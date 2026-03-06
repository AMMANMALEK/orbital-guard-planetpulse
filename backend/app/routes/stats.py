from __future__ import annotations

from fastapi import APIRouter, Depends

from ..database import get_db
from ..middleware.auth_middleware import require_roles


router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
async def get_stats(_user=Depends(require_roles("admin", "officer", "viewer"))):
    db = get_db()

    total_detections = await db.detections.count_documents({})
    active_alerts = await db.alerts.count_documents({"status": {"$in": ["active", "investigating"]}})
    resolved_alerts = await db.alerts.count_documents({"status": "resolved"})
    pending_complaints = await db.complaints.count_documents({"status": "pending"})
    total_alerts = await db.alerts.count_documents({})

    # Risk distribution aggregation
    high_risk = await db.detections.count_documents({"risk_score": {"$gte": 80}})
    medium_risk = await db.detections.count_documents({"risk_score": {"$gte": 65, "$lt": 80}})
    low_risk = await db.detections.count_documents({"risk_score": {"$lt": 65}})

    # Breakdown by type
    mining = await db.detections.count_documents({"prediction": "illegal-mining"})
    deforestation = await db.detections.count_documents({"prediction": "deforestation"})
    encroachment = await db.detections.count_documents({"prediction": "river-encroachment"})

    return {
        "total_detections": total_detections,
        "active_alerts": active_alerts,
        "resolved_alerts": resolved_alerts,
        "pending_complaints": pending_complaints,
        "total_alerts": total_alerts,
        "risk_distribution": [
            {"name": "High Risk", "value": high_risk},
            {"name": "Medium Risk", "value": medium_risk},
            {"name": "Low Risk", "value": low_risk},
        ],
        "detection_breakdown": {
            "mining": mining,
            "deforestation": deforestation,
            "encroachment": encroachment,
        },
    }
