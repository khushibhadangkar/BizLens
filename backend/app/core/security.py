"""
BizLens Backend — Supabase JWT Authentication.

Validates JWTs issued by Supabase Auth.
Extracts the authenticated user's UUID for downstream use.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

_bearer_scheme = HTTPBearer(auto_error=True)

# Supabase uses HS256 by default for project JWTs.
_JWT_ALGORITHM = "HS256"
_JWT_AUDIENCE = "authenticated"


def _decode_supabase_jwt(token: str) -> dict:
    """Decode and validate a Supabase-issued JWT.

    Raises HTTPException on any validation failure.
    """
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[_JWT_ALGORITHM],
            audience=_JWT_AUDIENCE,
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    return payload


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> str:
    """FastAPI dependency — returns the authenticated Supabase user UUID.

    Usage in a route:
        @router.get("/me")
        def me(user_id: str = Depends(get_current_user_id)):
            ...
    """
    payload = _decode_supabase_jwt(credentials.credentials)
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a user identifier.",
        )
    return user_id
