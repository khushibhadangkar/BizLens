"""
BizLens Backend — Tests for application startup.
"""

from fastapi.testclient import TestClient

from app.main import app


def test_app_creates_successfully():
    """The FastAPI application should instantiate without errors."""
    assert app is not None
    assert app.title == "BizLens Backend"


def test_app_docs_available_in_dev():
    """In development mode, /docs should be accessible."""
    client = TestClient(app)
    response = client.get("/docs")
    # Should return 200 (Swagger UI) or redirect, not 404.
    assert response.status_code != 404


def test_unknown_route_returns_404():
    """Requests to undefined routes should return 404."""
    client = TestClient(app)
    response = client.get("/api/v1/nonexistent")
    assert response.status_code == 404
