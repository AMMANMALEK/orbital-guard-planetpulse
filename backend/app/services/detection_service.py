from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from ..config import get_settings
from ..database import get_db
from ..utils.image_processing import risk_level_from_score
from ..utils.model_loader import ModelRunner
from .alert_service import AlertService


class DetectionService:
    def __init__(self, model_runner: ModelRunner):
        self.model_runner = model_runner

    async def create_detection(
        self,
        *,
        image_path: Path,
        image_url: str,
        location: str,
        coordinates: tuple[float, float],
        region: str,
        created_by: str,
    ) -> dict[str, Any]:
        db = get_db()

        result = self.model_runner.infer(str(image_path))
        det_type = result.prediction

        now_iso = datetime.utcnow().isoformat()
        det_id = f"d_{image_path.stem}"
        doc = {
            "_id": det_id,
            "image_url": image_url,
            "prediction": det_type,
            "confidence": float(result.confidence),
            "risk_score": int(result.risk_score),
            "location": location,
            "coordinates": list(coordinates),
            "timestamp": now_iso,
            "region": region,
            "status": "detected",
            "created_by": created_by,
        }
        await db.detections.insert_one(doc)

        # Auto-create alert if risk is high enough
        if doc["risk_score"] >= 70:
            severity = "high" if doc["risk_score"] >= 80 else "medium"
            await AlertService.create_alert_from_detection(
                detection_id=det_id,
                detection_type=det_type,
                severity=severity,
                message=f"AI detected {det_type.replace('-', ' ')} near {location}",
                region=region,
                status="active",
            )

        doc["id"] = doc["_id"]
        doc.pop("_id", None)
        doc["coordinates"] = tuple(doc["coordinates"])
        return doc

