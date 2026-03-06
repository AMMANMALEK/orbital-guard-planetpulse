from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from ..config import get_settings
from ..database import get_db
from ..middleware.auth_middleware import require_roles
from ..services.detection_service import DetectionService
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


@router.post("/upload")
async def upload_and_detect(
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
    image_url = f"{settings.base_url}/uploads/{saved.name}"

    # Get model runner from app state (set during startup in main.py)
    model_runner = getattr(request.app.state, "model_runner", None)
    if model_runner is None or not model_runner.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="AI model is not loaded. Check that the model file exists at the configured path.",
        )

    service = DetectionService(model_runner)
    try:
        det = await service.create_detection(
            image_path=saved,
            image_url=image_url,
            location=location,
            coordinates=(lat, lng),
            region=region,
            created_by=user["id"],
        )
    except (FileNotFoundError, RuntimeError) as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "prediction": det["prediction"],
        "confidence": det["confidence"],
        "risk_score": det["risk_score"],
        "detection": det,
    }


@router.post("/test-model")
async def test_model(
    request: Request,
    image: UploadFile = File(...),
    _admin=Depends(require_roles("admin", "officer")),
):
    settings = get_settings()
    upload_dir = Path(__file__).resolve().parents[2] / "uploads"
    saved = await save_upload(image, upload_dir)

    model_runner = getattr(request.app.state, "model_runner", None)
    if model_runner is None or not model_runner.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="AI model is not loaded.",
        )

    try:
        res = model_runner.infer(str(saved))
        return {
            "prediction": res.prediction,
            "confidence": res.confidence,
            "risk_score": res.risk_score,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
