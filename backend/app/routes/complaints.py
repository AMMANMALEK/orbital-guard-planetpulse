from __future__ import annotations

from pathlib import Path
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..config import get_settings
from ..database import get_db
from ..middleware.auth_middleware import get_current_user, require_roles
from ..models.complaint_model import (
    ComplaintCreate, ComplaintUpdate
)
from ..services.satellite_service import capture_satellite_imagery
from ..services.analysis_service import run_ai_analysis
from ..services.geocoding_service import get_coordinates
from ..models.workflow_models import SatelliteImageRecord, DetectionRecord, ReportRecord
from ..services.socket_manager import broadcast_new_complaint, broadcast_complaint_update


router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("")
async def create_complaint(payload: ComplaintCreate):
    db = get_db()
    
    # 1. Geocode the location
    lat, lng = await get_coordinates(payload.city, payload.state)
    
    doc = payload.model_dump()
    doc["_id"] = f"c_{__import__('hashlib').sha256((payload.submittedBy + payload.description + str(__import__('time').time())).encode()).hexdigest()[:12]}"
    doc["latitude"] = lat
    doc["longitude"] = lng
    doc["status"] = "pending_admin_assignment"
    doc["submittedAt"] = datetime.utcnow().isoformat()
    
    # Automatic Routing Logic (India: State + City)
    # Find active officer who handles this city and state
    assigned_officer_id = None
    officer = await db.users.find_one({
        "role": "officer",
        "status": "active",
        "assigned_locations": {
            "$elemMatch": {
                "state": payload.state,
                "city": payload.city
            }
        }
    })
    
    if officer:
        assigned_officer_id = str(officer["_id"])
        doc["assigned_officer_id"] = assigned_officer_id
        doc["status"] = "assigned"
        # Increment officer workload
        await db.users.update_one(
            {"_id": officer["_id"]},
            {"$inc": {"active_complaints_count": 1}}
        )
    else:
        doc["status"] = "pending_admin_assignment"
        doc["assigned_officer_id"] = None

    await db.complaints.insert_one(doc)
    out = await db.complaints.find_one({"_id": doc["_id"]})
    out["id"] = str(out["_id"])
    out.pop("_id", None)
    # Broadcast for real-time updates
    await broadcast_new_complaint(out)
    return out


@router.get("")
async def list_complaints(
    mine: bool = False,
    user=Depends(require_roles("admin", "officer", "viewer")),
):
    db = get_db()
    q = {}
    if user["role"] == "officer":
        q["assigned_officer_id"] = str(user["id"])
    if user["role"] == "viewer" and mine:
        q["submittedBy"] = user.get("email")

    out = []
    async for c in db.complaints.find(q).sort("submittedAt", -1).limit(500):
        c["id"] = str(c["_id"])
        c.pop("_id", None)
        out.append(c)
    return out


@router.patch("/{complaint_id}/investigate")
async def investigate_complaint(
    complaint_id: str,
    user=Depends(require_roles("officer")),
):
    db = get_db()
    res = await db.complaints.update_one(
        {"_id": complaint_id, "assigned_officer_id": str(user["id"])},
        {"$set": {"status": "investigating"}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")
    
    doc = await db.complaints.find_one({"_id": complaint_id})
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    await broadcast_complaint_update(doc)
    return doc


@router.post("/{complaint_id}/capture")
async def capture_and_analyze(
    complaint_id: str,
    request: Request,
    zoom: int = 15,
    user=Depends(require_roles("officer")),
):
    db = get_db()
    complaint = await db.complaints.find_one({"_id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # 1. Capture Satellite Image
    image_url = await capture_satellite_imagery(complaint["latitude"], complaint["longitude"], zoom)
    
    # 2. Run AI Analysis (Dual Verification: Ground Evidence + Satellite Imagery)
    images_to_analyze = complaint.get("complaint_images", []) + [image_url]
    analysis_result = await run_ai_analysis(images_to_analyze)
    
    # 3. Store Satellite Image Record
    sat_record = SatelliteImageRecord(
        complaint_id=complaint_id,
        satellite_image_url=image_url
    )
    await db.satellite_images.insert_one(sat_record.model_dump())
    
    # 4. Store Detection Record
    det_record = DetectionRecord(
        complaint_id=complaint_id,
        violation_type=analysis_result.get("violation_type", "unknown"),
        confidence=float(analysis_result.get("confidence", 0)),
        risk_score=int(analysis_result.get("risk_score", 0))    
    )
    await db.detections.insert_one(det_record.model_dump())
    
    # 5. Update Complaint with results
    updates = {
        "satellite_image_url": image_url,
        "ai_violation_type": analysis_result.get("violation_type", "unknown"),
        "ai_confidence": float(analysis_result.get("confidence", 0)),
        "ai_risk_score": int(analysis_result.get("risk_score", 0))
    }
    await db.complaints.update_one({"_id": complaint_id}, {"$set": updates})
    
    updated_complaint = await db.complaints.find_one({"_id": complaint_id})
    if updated_complaint:
        updated_complaint["id"] = str(updated_complaint["_id"])
        updated_complaint.pop("_id", None)
        await broadcast_complaint_update(updated_complaint)

    return {
        "image_url": image_url,
        "violation_type": analysis_result.get("violation_type", "unknown"),
        "confidence": float(analysis_result.get("confidence", 0)),
        "risk_score": int(analysis_result.get("risk_score", 0))
    }


@router.patch("/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: str,
    payload: ComplaintUpdate,
    user=Depends(require_roles("officer", "admin")),
):
    db = get_db()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    old_doc = await db.complaints.find_one({"_id": complaint_id})
    if not old_doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    res = await db.complaints.update_one({"_id": complaint_id}, {"$set": updates})
    doc = await db.complaints.find_one({"_id": complaint_id})
    
    # Workload Tracking Logic
    # If moving from assigned/investigating to a terminal status (resolved/confirmed/rejected)
    terminal_statuses = ["resolved", "confirmed", "rejected"]
    if updates.get("status") in terminal_statuses and old_doc.get("status") not in terminal_statuses:
        officer_id = doc.get("assigned_officer_id")
        if officer_id:
            await db.users.update_one(
                {"_id": officer_id},
                {
                    "$inc": {
                        "active_complaints_count": -1,
                        "resolved_complaints_count": 1 if updates.get("status") in ["resolved", "confirmed"] else 0
                    }
                }
            )

    # If confirmed, generate a report
    if updates.get("status") == "confirmed":
        report = ReportRecord(
            complaint_id=complaint_id,
            viewer_email=doc["submittedBy"],
            complaint_images_urls=doc.get("complaint_images", []),
            satellite_image_url=doc.get("satellite_image_url"),
            ai_violation_type=doc.get("ai_violation_type", "N/A"),
            risk_score=doc.get("ai_risk_score", 0),
            officer_comments=updates.get("officerNotes"),
            status="confirmed"
        )
        await db.reports.insert_one(report.model_dump())
        
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    await broadcast_complaint_update(doc)
    return doc


@router.get("/{complaint_id}/report")
async def get_complaint_report(complaint_id: str):
    db = get_db()
    report = await db.reports.find_one({"complaint_id": complaint_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report["id"] = str(report["_id"])
    report.pop("_id", None)
    return report
