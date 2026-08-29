"""
BizLens Backend — Supabase JWT Authentication.

Validates ES256 JWTs issued by Supabase Auth using the project's
JWKS public key and extracts the authenticated user's UUID.
"""

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

_bearer_scheme = HTTPBearer(auto_error=True)

_JWT_ALGORITHM = "ES256"
_JWT_AUDIENCE = "authenticated"


def _decode_supabase_jwt(token: str) -> dict:
    """Decode and validate a Supabase-issued ES256 JWT."""

    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured.",
        )

    try:
        # Get the token's key ID.
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        if not kid:
            raise JWTError("Missing kid in JWT header.")

        # Fetch Supabase public signing keys.
        jwks_url = (
            f"{settings.supabase_url.rstrip('/')}"
            "/auth/v1/.well-known/jwks.json"
        )

        response = httpx.get(jwks_url, timeout=10.0)
        response.raise_for_status()

        jwks = response.json()

        # Find the public key matching this token's kid.
        signing_key = next(
            (
                key
                for key in jwks.get("keys", [])
                if key.get("kid") == kid
            ),
            None,
        )

        if signing_key is None:
            raise JWTError("No matching signing key found.")

        # Verify signature + claims.
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=[_JWT_ALGORITHM],
            audience=_JWT_AUDIENCE,
            issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1",
        )

        return payload

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to retrieve Supabase signing keys.",
        ) from exc


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> str:
    """Return the authenticated Supabase user's UUID."""

    payload = _decode_supabase_jwt(credentials.credentials)

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id