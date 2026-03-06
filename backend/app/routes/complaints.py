from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..config import get_settings
from ..database import get_db
from ..middleware.auth_middleware import get_current_user, require_roles
from ..models.complaint_model import ComplaintCreate, ComplaintUpdate


from ..services.satellite_service import capture_satellite_imagery
from ..services.analysis_service import run_ai_analysis
from ..models.workflow_models import SatelliteImageRecord, DetectionRecord, ReportRecord


router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("")
async def create_complaint(payload: ComplaintCreate):
    db = get_db()
    
    doc = payload.model_dump()
    doc["_id"] = f"c_{abs(hash(payload.submittedBy + payload.description))}"
    doc["status"] = "pending"
    doc["submittedAt"] = __import__("datetime").datetime.utcnow().date().isoformat()
    
    # Officer Assignment Logic:
    # Find an officer assigned to the region (placeholder logic)
    # For now, let's just pick the first officer we find or leave it empty if someone will manually assign
    officer = await db.users.find_one({"role": "officer"})
    if officer:
        doc["assignedOfficerId"] = str(officer["_id"])
        doc["region"] = officer.get("assigned_region", {}).get("name")
        
    await db.complaints.update_one({"_id": doc["_id"]}, {"$set": doc}, upsert=True)
    out = await db.complaints.find_one({"_id": doc["_id"]})
    out["id"] = str(out["_id"])
    out.pop("_id", None)
    return out


@router.get("")
async def list_complaints(
    mine: bool = False,
    user=Depends(require_roles("admin", "officer", "viewer")),
):
    db = get_db()
    q = {}
    if user["role"] == "officer":
        q["assignedOfficerId"] = str(user["id"])
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
        {"_id": complaint_id, "assignedOfficerId": str(user["id"])},
        {"$set": {"status": "investigating"}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")
    
    doc = await db.complaints.find_one({"_id": complaint_id})
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
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
    
    # 2. Run AI Analysis
    model_runner = request.app.state.model_runner
    if not model_runner.is_loaded:
        raise HTTPException(status_code=500, detail="AI Model not loaded on server")
        
    analysis_result = await run_ai_analysis(image_url, model_runner)
    
    # 3. Store Satellite Image Record
    sat_record = SatelliteImageRecord(
        complaint_id=complaint_id,
        satellite_image_url=image_url
    )
    await db.satellite_images.insert_one(sat_record.model_dump())
    
    # 4. Store Detection Record
    det_record = DetectionRecord(
        complaint_id=complaint_id,
        prediction=analysis_result.prediction,
        confidence=analysis_result.confidence,
        risk_score=analysis_result.risk_score
    )
    await db.detections.insert_one(det_record.model_dump())
    
    # 5. Update Complaint with results
    updates = {
        "satellite_image_url": image_url,
        "ai_prediction": analysis_result.prediction,
        "ai_confidence": analysis_result.confidence,
        "ai_risk_score": analysis_result.risk_score
    }
    await db.complaints.update_one({"_id": complaint_id}, {"$set": updates})
    
    return {
        "image_url": image_url,
        "prediction": analysis_result.prediction,
        "confidence": analysis_result.confidence,
        "risk_score": analysis_result.risk_score
    }


@router.patch("/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: str,
    payload: ComplaintUpdate,
    user=Depends(require_roles("officer", "admin")),
):
    db = get_db()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    res = await db.complaints.update_one({"_id": complaint_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    doc = await db.complaints.find_one({"_id": complaint_id})
    
    # If confirmed, generate a report
    if updates.get("status") == "confirmed":
        report = ReportRecord(
            complaint_id=complaint_id,
            viewer_email=doc["submittedBy"],
            complaint_images_urls=doc.get("complaint_images", []),
            satellite_image_url=doc.get("satellite_image_url"),
            ai_prediction=doc.get("ai_prediction", "N/A"),
            risk_score=doc.get("ai_risk_score", 0),
            officer_comments=updates.get("officerNotes"),
            status="confirmed"
        )
        await db.reports.insert_one(report.model_dump())
        
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
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

