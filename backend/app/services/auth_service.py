from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import HTTPException, status

from ..database import get_db
from ..middleware.auth_middleware import create_access_token, hash_password, verify_password


class AuthService:
    @staticmethod
    async def register_user(user_in: dict[str, Any]) -> dict[str, Any]:
        db = get_db()
        existing = await db.users.find_one({"email": user_in["email"]})
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user_id = user_in.get("id") or user_in["email"]
        now = datetime.utcnow().date().isoformat()
        doc = {
            "_id": user_id,
            "name": user_in["name"],
            "email": user_in["email"],
            "role": user_in.get("role", "viewer"),
            "assigned_region": user_in.get("assigned_region"),
            "status": "active",
            "lastLogin": now,
            "hashed_password": hash_password(user_in["password"]),
        }
        await db.users.insert_one(doc)

        token = create_access_token(subject=user_id, role=doc["role"])
        public = {k: v for k, v in doc.items() if k != "hashed_password"}
        public["id"] = public["_id"]
        public.pop("_id", None)
        return {"access_token": token, "token_type": "bearer", "user": public}

    @staticmethod
    async def login(email: str, password: str) -> dict[str, Any]:
        db = get_db()
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user.get("hashed_password", "")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        await db.users.update_one({"_id": user["_id"]}, {"$set": {"lastLogin": datetime.utcnow().date().isoformat()}})

        token = create_access_token(subject=user["_id"], role=user["role"])
        user["id"] = user["_id"]
        user.pop("_id", None)
        user.pop("hashed_password", None)
        return {"access_token": token, "token_type": "bearer", "user": user}

