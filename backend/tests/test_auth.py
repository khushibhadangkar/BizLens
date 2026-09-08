"""
BizLens Backend — Tests for authentication (structural, ES256/JWKS).

These tests verify the JWT validation logic structurally without requiring
a real Supabase instance.  They mock httpx.get (the JWKS endpoint fetch)
and sign tokens with a deterministic, test-only EC P-256 key pair.

The production security.py uses ES256 + JWKS and must NOT be changed merely
to satisfy these tests — the mocks adapt the tests to the production code.
"""

import time
from unittest.mock import MagicMock, patch

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from jose import jwt

from app.core.security import get_current_user_id

# ---------------------------------------------------------------------------
# Deterministic test key pair (NOT a real secret — generated once for tests).
# ---------------------------------------------------------------------------

_TEST_PRIVATE_KEY_PEM = (
    "-----BEGIN PRIVATE KEY-----\n"
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg2TmBaHr58oGZhVSB\n"
    "cBl+bXJmgPajoISA4NfrWEvjXtShRANCAASjhua/MnH9Byv8kAf+vq9dWrpbPLjq\n"
    "of9cdhJ6OwVTRZHj/Ai5jpaIp0Ax1Nxx9BLrE5rsaTMhVkQRlJbnz5a/\n"
    "-----END PRIVATE KEY-----\n"
)

# The corresponding public JWK.  kid must match what we embed in test tokens.
_TEST_KID = "test-key-1"
_TEST_JWK = {
    "kty": "EC",
    "crv": "P-256",
    "kid": _TEST_KID,
    "x": "o4bmvzJx_Qcr_JAH_r6vXVq6Wzy46qH_XHYSejsFU0U",
    "y": "keP8CLmOloinQDHU3HH0EusTmuxpMyFWRBGUlufPlr8",
    "alg": "ES256",
    "use": "sig",
}

_TEST_SUPABASE_URL = "https://test.supabase.co"


def _make_test_jwt(
    sub: str = "user-123",
    exp_offset: int = 3600,
    kid: str = _TEST_KID,
) -> str:
    """Sign an ES256 JWT with the test private key."""
    now = int(time.time())
    payload = {
        "sub": sub,
        "aud": "authenticated",
        "exp": now + exp_offset,
        "iat": now,
        "iss": f"{_TEST_SUPABASE_URL}/auth/v1",
        "role": "authenticated",
    }
    headers = {"kid": kid, "alg": "ES256"}
    return jwt.encode(
        payload,
        _TEST_PRIVATE_KEY_PEM,
        algorithm="ES256",
        headers=headers,
    )


def _make_jwks_response(keys: list[dict] | None = None) -> MagicMock:
    """Build a mock httpx.Response that returns the test JWKS."""
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"keys": keys if keys is not None else [_TEST_JWK]}
    return mock_resp


# ---------------------------------------------------------------------------
# Minimal test FastAPI app with a single protected route.
# ---------------------------------------------------------------------------

_test_app = FastAPI()


@_test_app.get("/protected")
def protected_route(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}


_client = TestClient(_test_app)


# ---------------------------------------------------------------------------
# Helper context manager: patches both supabase_url setting AND httpx.get.
# ---------------------------------------------------------------------------

def _patch_jwks(keys: list[dict] | None = None):
    """Return a combined context that supplies the test JWKS via httpx mock."""
    return patch(
        "app.core.security.httpx.get",
        return_value=_make_jwks_response(keys),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_missing_auth_header_returns_401():
    """Requests without an Authorization header should be rejected with 401."""
    response = _client.get("/protected")
    assert response.status_code == 401


def test_invalid_token_returns_401(monkeypatch):
    """A token that is not a valid JWT returns 401."""
    monkeypatch.setattr("app.core.security.settings.supabase_url", _TEST_SUPABASE_URL)

    with _patch_jwks():
        response = _client.get(
            "/protected",
            headers={"Authorization": "Bearer totally-invalid-token"},
        )

    assert response.status_code == 401


def test_valid_token_returns_user_id(monkeypatch):
    """A valid ES256 JWT is decoded and returns the user ID."""
    monkeypatch.setattr("app.core.security.settings.supabase_url", _TEST_SUPABASE_URL)

    token = _make_test_jwt(sub="user-abc-123")

    with _patch_jwks():
        response = _client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["user_id"] == "user-abc-123"


def test_expired_token_returns_401(monkeypatch):
    """An expired JWT returns 401."""
    monkeypatch.setattr("app.core.security.settings.supabase_url", _TEST_SUPABASE_URL)

    token = _make_test_jwt(sub="user-expired", exp_offset=-3600)  # expired 1 hour ago

    with _patch_jwks():
        response = _client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 401


def test_unknown_kid_returns_401(monkeypatch):
    """A JWT whose kid is not in the JWKS returns 401."""
    monkeypatch.setattr("app.core.security.settings.supabase_url", _TEST_SUPABASE_URL)

    token = _make_test_jwt(kid="unknown-kid")

    with _patch_jwks():  # JWKS only contains test-key-1
        response = _client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 401


def test_missing_supabase_url_returns_503(monkeypatch):
    """When supabase_url is not configured, the endpoint returns 503."""
    monkeypatch.setattr("app.core.security.settings.supabase_url", "")

    response = _client.get(
        "/protected",
        headers={"Authorization": "Bearer sometoken"},
    )

    assert response.status_code == 503


def test_jwks_network_error_returns_503(monkeypatch):
    """If the JWKS endpoint is unreachable, the endpoint returns 503."""
    import httpx

    monkeypatch.setattr("app.core.security.settings.supabase_url", _TEST_SUPABASE_URL)

    token = _make_test_jwt()

    with patch("app.core.security.httpx.get", side_effect=httpx.ConnectError("unreachable")):
        response = _client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 503
