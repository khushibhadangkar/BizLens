"""
BizLens Backend — Tests for authentication (structural).

These tests verify the JWT validation logic structurally
without requiring a real Supabase instance.
"""

import time

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from jose import jwt

from app.core.security import get_current_user_id

# --- Test-only FastAPI app with a protected route ---
_test_app = FastAPI()


@_test_app.get("/protected")
def protected_route(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}


_client = TestClient(_test_app)

# A known test secret — NOT a real secret.
_TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests-only"


def _make_test_jwt(sub: str = "user-123", secret: str = _TEST_JWT_SECRET) -> str:
    """Create a JWT token matching Supabase's format for testing."""
    payload = {
        "sub": sub,
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_missing_auth_header_returns_401():
    """Requests without an Authorization header should be rejected."""
    response = _client.get("/protected")
    assert response.status_code == 401


def test_invalid_token_returns_401(monkeypatch):
    """An invalid JWT should return 401."""
    from app.core.security import settings

    monkeypatch.setattr(settings, "supabase_jwt_secret", _TEST_JWT_SECRET)

    response = _client.get(
        "/protected",
        headers={"Authorization": "Bearer totally-invalid-token"},
    )
    assert response.status_code == 401


def test_valid_token_returns_user_id(monkeypatch):
    """A valid JWT should extract and return the user ID."""
    from app.core.security import settings

    monkeypatch.setattr(settings, "supabase_jwt_secret", _TEST_JWT_SECRET)

    token = _make_test_jwt(sub="user-abc-123")
    response = _client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["user_id"] == "user-abc-123"


def test_expired_token_returns_401(monkeypatch):
    """An expired JWT should return 401."""
    from app.core.security import settings

    monkeypatch.setattr(settings, "supabase_jwt_secret", _TEST_JWT_SECRET)

    payload = {
        "sub": "user-expired",
        "aud": "authenticated",
        "exp": int(time.time()) - 3600,  # Expired 1 hour ago.
        "iat": int(time.time()) - 7200,
    }
    token = jwt.encode(payload, _TEST_JWT_SECRET, algorithm="HS256")
    response = _client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
