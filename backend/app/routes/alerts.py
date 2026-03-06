from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ..database import get_db
from ..middleware.auth_middleware import require_roles
from ..models.alert_model import AlertUpdate


router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("")
async def list_alerts(
    status: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 200,
    user=Depends(require_roles("admin", "officer", "viewer")),
):
    db = get_db()
    q = {}
    if status:
        q["status"] = status
    if region:
        q["region"] = region

    # Optional scoping for officers/viewers
    if user.get("role") == "officer" and user.get("region") and not region:
        q["region"] = user["region"]

    out = []
    async for a in db.alerts.find(q).sort("date", -1).limit(limit):
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        out.append(a)
    return out


@router.patch("/{alert_id}")
async def update_alert(
    alert_id: str,
    payload: AlertUpdate,
    user=Depends(require_roles("admin", "officer")),
):
    db = get_db()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        return {"updated": False}

    # officers can only change status/notes
    if user.get("role") == "officer":
        allowed = {"status", "notes"}
        updates = {k: v for k, v in updates.items() if k in allowed}
        if not updates:
            raise HTTPException(status_code=403, detail="Forbidden")

    res = await db.alerts.update_one({"_id": alert_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    doc = await db.alerts.find_one({"_id": alert_id})
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

