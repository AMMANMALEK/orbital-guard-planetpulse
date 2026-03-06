from __future__ import annotations

from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from ..config import get_settings
from ..database import get_db
from ..middleware.auth_middleware import require_roles
from ..utils.image_processing import save_upload


router = APIRouter(prefix="/api/detections", tags=["detections"])


@router.get("")
async def list_detections(
    region: Optional[str] = None,
    limit: int = 200,
    _user=Depends(require_roles("admin", "officer", "viewer")),
):
    db = get_db()
    q = {}
    if region:
        q["region"] = region
    out = []
    async for d in db.detections.find(q).sort("timestamp", -1).limit(limit):
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        d["coordinates"] = tuple(d.get("coordinates", (20.0, 78.0)))
        out.append(d)
    return out


@router.patch("/{detection_id}")
async def update_detection(
    detection_id: str,
    status: str,
    _user=Depends(require_roles("admin", "officer")),
):
    db = get_db()
    res = await db.detections.update_one({"_id": detection_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Detection not found")
    doc = await db.detections.find_one({"_id": detection_id})
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.post("/analyze")
async def analyze_and_detect(
    request: Request,
    image: UploadFile = File(...),
    location: str = Form("Unknown"),
    lat: float = Form(20.0),
    lng: float = Form(78.0),
    region: str = Form("Unknown"),
    user=Depends(require_roles("admin", "officer")),
):
    settings = get_settings()
    upload_dir = Path(__file__).resolve().parents[2] / "uploads"
    saved = await save_upload(image, upload_dir)
    abs_path = str(saved.resolve())
    image_url = f"{settings.base_url}/uploads/{saved.name}"

    print(f"[Detection] Image saved to: {abs_path}")

    # AI Router: Gemini first → OpenRouter fallback
    from ..services.ai.ai_router import analyze_image
    result = await analyze_image(image_path=abs_path, image_url=image_url)

    violation_type = str(result.get("violation_type", "unknown"))
    confidence = float(result.get("confidence", 0.0))
    risk_score = int(result.get("risk_score", 0))

    print(f"[Detection] Final result: type={violation_type} conf={confidence} risk={risk_score}")

    db = get_db()
    from ..services.alert_service import AlertService

    now_iso = datetime.utcnow().isoformat()
    det_id = f"d_{saved.stem}"
    doc = {
        "_id": det_id,
        "image_url": image_url,
        "violation_type": violation_type,
        "confidence": confidence,
        "risk_score": risk_score,
        "location": location,
        "coordinates": [lat, lng],
        "timestamp": now_iso,
        "region": region,
        "status": "detected",
        "created_by": user["id"],
    }
    await db.detections.insert_one(doc)

    if risk_score >= 70:
        severity = "high" if risk_score >= 80 else "medium"
        await AlertService.create_alert_from_detection(
            detection_id=det_id,
            detection_type=violation_type,
            severity=severity,
            message=f"AI detected {violation_type.replace('_', ' ')} near {location}",
            region=region,
            status="active",
        )

    doc["id"] = doc["_id"]
    doc.pop("_id", None)
    doc["coordinates"] = tuple(doc["coordinates"])

    return {
        "violation_type": violation_type,
        "confidence": confidence,
        "risk_score": risk_score,
        "detection": doc,
    }
