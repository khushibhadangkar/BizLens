"""
BizLens Backend — Tests for file upload API.
"""

from datetime import datetime
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user_id, get_db, get_storage_service
from app.core.config import settings
from app.main import app
from app.services.storage import StorageException


class MockStorageService:
    def __init__(self):
        self.uploaded_files = []
        self.deleted_files = []
        self.should_fail_upload = False

    def upload_file(self, path: str, file_bytes: bytes, mime_type: str) -> str:
        if self.should_fail_upload:
            raise StorageException("Mocked upload failure")
        self.uploaded_files.append(path)
        return path

    def delete_file(self, path: str) -> None:
        self.deleted_files.append(path)


@pytest.fixture
def mock_db():
    db = MagicMock()

    def fake_refresh(obj):
        if not getattr(obj, "created_at", None):
            obj.created_at = datetime.utcnow()
        if not getattr(obj, "updated_at", None):
            obj.updated_at = datetime.utcnow()

    db.refresh.side_effect = fake_refresh
    return db


@pytest.fixture
def mock_storage():
    return MockStorageService()


@pytest.fixture
def client(mock_db, mock_storage):
    app.dependency_overrides[get_current_user_id] = lambda: "user-123"
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_storage_service] = lambda: mock_storage

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


def test_unauthenticated_upload(mock_db, mock_storage):
    # To test unauthenticated, we don't override get_current_user_id
    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_storage_service] = lambda: mock_storage

    with TestClient(app) as client:
        response = client.post("/api/v1/files", files={"file": ("test.csv", b"a,b,c")})
        assert response.status_code == 401


def test_upload_valid_csv(client, mock_db, mock_storage):
    response = client.post(
        "/api/v1/files", files={"file": ("data.csv", b"col1,col2\n1,2", "text/csv")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["original_filename"] == "data.csv"
    assert data["file_type"] == "csv"
    assert data["owner_id"] == "user-123"
    assert data["status"] == "PENDING"

    assert len(mock_storage.uploaded_files) == 1
    assert "data.csv" in mock_storage.uploaded_files[0]

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


def test_upload_valid_pdf(client, mock_storage):
    response = client.post(
        "/api/v1/files", files={"file": ("doc.pdf", b"%PDF-1.4", "application/pdf")}
    )
    assert response.status_code == 201
    assert response.json()["file_type"] == "pdf"


def test_upload_valid_xlsx(client, mock_storage):
    response = client.post(
        "/api/v1/files",
        files={
            "file": (
                "sheet.xlsx",
                b"PK\x03\x04",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )
    assert response.status_code == 201
    assert response.json()["file_type"] == "xlsx"


def test_upload_unsupported_extension(client, mock_storage):
    response = client.post(
        "/api/v1/files", files={"file": ("script.py", b"print('hello')", "text/x-python")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_upload_empty_file(client, mock_storage):
    response = client.post("/api/v1/files", files={"file": ("empty.csv", b"", "text/csv")})
    assert response.status_code == 400
    assert "File is empty" in response.json()["detail"]


def test_upload_oversized_file(client, mock_storage, monkeypatch):
    monkeypatch.setattr(settings, "max_upload_size_bytes", 10)
    response = client.post(
        "/api/v1/files", files={"file": ("large.csv", b"this is larger than 10 bytes", "text/csv")}
    )
    assert response.status_code == 413
    assert "exceeds maximum size" in response.json()["detail"]


def test_storage_failure_handled(client, mock_db, mock_storage):
    mock_storage.should_fail_upload = True
    response = client.post(
        "/api/v1/files", files={"file": ("data.csv", b"col1,col2\n1,2", "text/csv")}
    )
    assert response.status_code == 500
    assert "Failed to upload" in response.json()["detail"]
    mock_db.add.assert_not_called()
    mock_db.commit.assert_not_called()


def test_db_failure_handled_and_storage_rolled_back(client, mock_db, mock_storage):
    mock_db.commit.side_effect = Exception("DB error")

    response = client.post(
        "/api/v1/files", files={"file": ("data.csv", b"col1,col2\n1,2", "text/csv")}
    )

    assert response.status_code == 500
    assert "Failed to save file metadata" in response.json()["detail"]
    assert len(mock_storage.uploaded_files) == 1
    assert len(mock_storage.deleted_files) == 1
    assert mock_storage.uploaded_files[0] == mock_storage.deleted_files[0]
    mock_db.rollback.assert_called_once()
