"""
BizLens Backend — Tests for file upload API.
"""

import uuid
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


# ===========================================================
# Phase 2 — GET list, GET single, DELETE
# ===========================================================

def _make_file_record_mock(owner_id: str = "user-123"):
    """
    Build a lightweight mock that Pydantic (from_attributes=True) can serialize
    as a FileRecordResponse.  All attributes are real Python values.
    """
    record = MagicMock()
    record.id = uuid.uuid4()
    record.owner_id = owner_id
    record.original_filename = "test.csv"
    record.storage_path = f"{owner_id}/{uuid.uuid4()}/test.csv"
    record.file_type = "csv"
    record.mime_type = "text/csv"
    record.file_size = 1024
    record.status = "PENDING"
    record.error_message = None
    record.created_at = datetime.utcnow()
    record.updated_at = datetime.utcnow()
    return record


# --- GET /api/v1/files ---

def test_list_files_returns_owned_files(client, mock_db):
    """GET /api/v1/files returns the authenticated user's files."""
    record = _make_file_record_mock(owner_id="user-123")
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [record]

    response = client.get("/api/v1/files")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["owner_id"] == "user-123"
    assert data[0]["original_filename"] == "test.csv"


def test_list_files_returns_empty_list_when_no_files(client, mock_db):
    """GET /api/v1/files returns an empty list when the user has no files."""
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []

    response = client.get("/api/v1/files")

    assert response.status_code == 200
    assert response.json() == []


def test_list_files_requires_authentication(mock_db, mock_storage):
    """GET /api/v1/files returns 401 when no valid token is present."""
    from app.api.dependencies import get_current_user_id, get_db, get_storage_service
    from app.main import app as _app

    _app.dependency_overrides.clear()
    _app.dependency_overrides[get_db] = lambda: mock_db
    _app.dependency_overrides[get_storage_service] = lambda: mock_storage

    with TestClient(_app) as c:
        response = c.get("/api/v1/files")
        assert response.status_code == 401

    _app.dependency_overrides.clear()


# --- GET /api/v1/files/{file_id} ---

def test_get_file_returns_owned_file(client, mock_db):
    """GET /api/v1/files/{id} returns the file when it belongs to the user."""
    record = _make_file_record_mock()
    mock_db.query.return_value.filter.return_value.first.return_value = record

    response = client.get(f"/api/v1/files/{record.id}")

    assert response.status_code == 200
    assert response.json()["owner_id"] == "user-123"


def test_get_file_returns_404_for_nonexistent_file(client, mock_db):
    """GET /api/v1/files/{id} returns 404 for a file that does not exist."""
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.get(f"/api/v1/files/{uuid.uuid4()}")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_file_returns_404_for_another_users_file(client, mock_db):
    """
    GET /api/v1/files/{id} returns 404 when the file belongs to a different user.

    The query filters by BOTH file_id AND owner_id, so a record owned by another
    user returns None — identical to a nonexistent file, preventing UUID enumeration.
    """
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.get(f"/api/v1/files/{uuid.uuid4()}")

    assert response.status_code == 404


# --- DELETE /api/v1/files/{file_id} ---

def test_delete_owned_file_succeeds(client, mock_db, mock_storage):
    """DELETE /api/v1/files/{id} removes the storage object and DB record."""
    record = _make_file_record_mock()
    mock_db.query.return_value.filter.return_value.first.return_value = record

    response = client.delete(f"/api/v1/files/{record.id}")

    assert response.status_code == 204
    assert record.storage_path in mock_storage.deleted_files
    mock_db.delete.assert_called_once_with(record)
    mock_db.commit.assert_called_once()


def test_delete_nonexistent_file_returns_404(client, mock_db, mock_storage):
    """DELETE /api/v1/files/{id} returns 404 for a missing or unowned file."""
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.delete(f"/api/v1/files/{uuid.uuid4()}")

    assert response.status_code == 404
    mock_db.delete.assert_not_called()


def test_delete_storage_failure_preserves_db_record(client, mock_db, mock_storage):
    """
    If storage deletion raises, the DB record must not be deleted.

    This preserves consistency: an orphaned storage object is recoverable via
    a cleanup job; an orphaned DB row pointing to a missing object is worse.
    """
    from app.services.storage import StorageException

    record = _make_file_record_mock()
    mock_db.query.return_value.filter.return_value.first.return_value = record

    def _failing_delete(path: str) -> None:
        raise StorageException("simulated storage error")

    mock_storage.delete_file = _failing_delete

    response = client.delete(f"/api/v1/files/{record.id}")

    assert response.status_code == 500
    mock_db.delete.assert_not_called()
    mock_db.commit.assert_not_called()


def test_delete_ownership_comes_from_jwt_not_request(client, mock_db, mock_storage):
    """
    Ownership is derived exclusively from the JWT sub claim.

    There is no request body or path parameter that lets a caller specify
    owner_id.  The query always filters by the authenticated user's ID.
    The mock returns None to simulate the WHERE owner_id = 'user-123' clause
    excluding a file owned by a different user.
    """
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # The authenticated user (user-123) tries to delete a file belonging to
    # another user.  The query finds nothing; the endpoint returns 404.
    response = client.delete(f"/api/v1/files/{uuid.uuid4()}")

    assert response.status_code == 404
    mock_db.delete.assert_not_called()
