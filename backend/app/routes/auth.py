from __future__ import annotations

from fastapi import APIRouter

from ..models.user_model import TokenResponse, UserCreate, UserLogin
from ..services.auth_service import AuthService


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserCreate):
    return await AuthService.register_user(payload.model_dump())


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    return await AuthService.login(payload.email, payload.password)

