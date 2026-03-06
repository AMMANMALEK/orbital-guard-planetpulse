from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from ..database import get_db


class AlertService:
    @staticmethod
    async def create_alert_from_detection(
        *,
        detection_id: str,
        detection_type: str,
        severity: str,
        message: str,
        region: str,
        status: str = "active",
        notes: Optional[str] = None,
    ) -> dict[str, Any]:
        db = get_db()
        doc = {
            "_id": f"a_{detection_id}",
            "detectionId": detection_id,
            "type": detection_type,
            "severity": severity,
            "status": status,
            "message": message,
            "date": datetime.utcnow().date().isoformat(),
            "region": region,
            "notes": notes,
        }
        await db.alerts.update_one({"_id": doc["_id"]}, {"$setOnInsert": doc}, upsert=True)
        doc["id"] = doc["_id"]
        doc.pop("_id", None)
        return doc

