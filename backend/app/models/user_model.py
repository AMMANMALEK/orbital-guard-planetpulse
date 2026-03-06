from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["admin", "officer", "viewer"]
UserStatus = Literal["active", "inactive"]


class AssignedRegion(BaseModel):
    name: str
    latitude: float
    longitude: float


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    assigned_region: Optional[AssignedRegion] = None
    status: UserStatus = "active"
    lastLogin: str = Field(default_factory=lambda: datetime.utcnow().date().isoformat())


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole = "viewer"
    assigned_region: Optional[AssignedRegion] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

