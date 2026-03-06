from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from ..database import get_db
from ..middleware.auth_middleware import hash_password, require_roles
from ..models.user_model import UserCreate, UserPublic, AssignedLocation


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserPublic])
async def list_users(_admin=Depends(require_roles("admin"))):
    db = get_db()
    users = []
    async for u in db.users.find({}):
        u["id"] = str(u["_id"])
        u.pop("_id", None)
        u.pop("hashed_password", None)
        users.append(u)
    return users


@router.post("", response_model=UserPublic)
async def create_user(payload: UserCreate, _admin=Depends(require_roles("admin"))):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_id = payload.email
    now = datetime.utcnow().date().isoformat()
    # Map pydantic models to dicts
    locations = [loc.model_dump() for loc in payload.assigned_locations]
    
    doc = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role,
        "assigned_locations": locations,
        "active_complaints_count": 0,
        "resolved_complaints_count": 0,
        "status": "active",
        "lastLogin": now,
        "hashed_password": hash_password(payload.password),
    }
    await db.users.insert_one(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    doc.pop("hashed_password", None)
    return doc


@router.patch("/{user_id}/locations", response_model=UserPublic)
async def update_user_locations(
    user_id: str, 
    locations: list[AssignedLocation], 
    _admin=Depends(require_roles("admin"))
):
    db = get_db()
    loc_dicts = [loc.model_dump() for loc in locations]
    res = await db.users.find_one_and_update(
        {"_id": user_id},
        {"$set": {"assigned_locations": loc_dicts}},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    
    res["id"] = str(res["_id"])
    res.pop("_id", None)
    res.pop("hashed_password", None)
    return res


@router.delete("/{user_id}")
async def delete_user(user_id: str, _admin=Depends(require_roles("admin"))):
    db = get_db()
    
    # 1. Unassign active complaints
    await db.complaints.update_many(
        {"assigned_officer_id": user_id},
        {"$set": {
            "assigned_officer_id": None,
            "status": "pending_admin_assignment"
        }}
    )
    
    # 2. Delete the user
    res = await db.users.delete_one({"_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": True}

