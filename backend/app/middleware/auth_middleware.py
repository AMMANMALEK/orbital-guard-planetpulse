from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from ..config import get_settings
from ..database import get_db


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

# ─── Demo fallback user ───────────────────────────────────────────────────────
# When no valid JWT is provided (e.g. test/demo mode), all routes will receive
# this user. They will behave as if an admin is logged in.
DEMO_USER = {
    "id": "demo-admin",
    "name": "Demo Admin",
    "email": "admin@test.com",
    "role": "admin",
    "region": "Global",
}
# ─────────────────────────────────────────────────────────────────────────────


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    now = datetime.now(tz=timezone.utc)
    exp = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(
    creds: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer)],
):
    """
    Returns the authenticated user from a valid JWT.
    If no token or an invalid token is provided, returns DEMO_USER instead of
    raising 401 — allowing the app to run in demo mode without authentication.
    """
    if creds is None or not creds.credentials:
        return DEMO_USER

    settings = get_settings()
    try:
        payload = jwt.decode(
            creds.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id or not role:
            return DEMO_USER

        # Try to fetch from DB; if not found fall back to demo user
        db = get_db()
        user = await db.users.find_one({"_id": user_id})
        if not user:
            # Auth token is valid but user no longer in DB – use payload info
            return {
                "id": user_id,
                "name": user_id,
                "email": user_id,
                "role": role,
                "region": payload.get("region", "Global"),
            }
        user["id"] = user["_id"]
        user.pop("_id", None)
        user.pop("hashed_password", None)
        return user

    except JWTError:
        # Invalid / expired token → fall back to demo user
        return DEMO_USER


def require_roles(*roles: str):
    """
    Role-based access wrapper. In demo mode (no JWT) the DEMO_USER role is
    'admin', so all routes are accessible. With a real JWT, the role in the
    token is enforced.
    """
    async def _dep(user=Depends(get_current_user)):
        # If no roles are specified, any authenticated user passes
        if not roles:
            return user
        if user.get("role") not in roles:
            # In demo mode the user is always 'admin' so this won't trigger
            from fastapi import HTTPException
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return _dep
