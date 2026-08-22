"""
BizLens Backend — Tests for the health endpoint.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_200():
    """The /api/v1/health endpoint should return 200 with a healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "bizlens-backend"


def test_health_response_structure():
    """The health response should contain exactly the expected keys."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert set(data.keys()) == {"status", "service"}
