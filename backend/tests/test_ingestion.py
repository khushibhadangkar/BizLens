"""
BizLens Backend — Tests for Phase 3A Ingestion Processor.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.modules.ingestion.models import ExtractedRow, FileRecord
from app.modules.ingestion.processor import process_file
from app.shared.enums import ProcessingStatus
from app.services.storage import storage_service, StorageException


# In-memory SQLite DB for testing processor
engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


@pytest.fixture
def db_session():
    # Recreate tables for clean state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def mock_storage():
    with patch("app.modules.ingestion.processor.storage_service") as mock:
        yield mock


@pytest.fixture
def test_file_record(db_session):
    record = FileRecord(
        id=uuid.uuid4(),
        owner_id="user-123",
        original_filename="test.csv",
        storage_path="user-123/test.csv",
        file_type="csv",
        mime_type="text/csv",
        file_size=100,
        status=ProcessingStatus.PENDING
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture
def mock_session_local(db_session):
    # Return a mock that yields db_session but ignores close()
    with patch("app.modules.ingestion.processor.SessionLocal") as mock:
        class SessionWrapper:
            def __getattr__(self, item):
                if item == "close":
                    return lambda: None
                return getattr(db_session, item)
        
        mock.return_value = SessionWrapper()
        yield mock


def test_process_valid_csv(mock_session_local, db_session, test_file_record, mock_storage):
    """Test successful parsing and row extraction."""
    
    csv_content = b"header1,header2\nval1,val2\nval3,val4"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.COMPLETED
    
    rows = db_session.query(ExtractedRow).filter(ExtractedRow.file_id == test_file_record.id).order_by(ExtractedRow.row_number).all()
    assert len(rows) == 2
    
    assert rows[0].row_number == 1
    assert rows[0].row_data == {"header1": "val1", "header2": "val2"}
    
    assert rows[1].row_number == 2
    assert rows[1].row_data == {"header1": "val3", "header2": "val4"}


def test_process_csv_no_headers(mock_session_local, db_session, test_file_record, mock_storage):
    """Test parsing empty CSV causes FAILED status."""
    
    csv_content = b""
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.FAILED
    assert "no headers" in str(test_file_record.error_message).lower()
    
    rows = db_session.query(ExtractedRow).filter(ExtractedRow.file_id == test_file_record.id).all()
    assert len(rows) == 0


def test_process_missing_file_record(mock_session_local, db_session, mock_storage):
    """Test missing file record does not crash."""
    
    # Should just return early and not call storage
    process_file(uuid.uuid4())
    mock_storage.get_file_bytes.assert_not_called()


def test_process_storage_failure(mock_session_local, db_session, test_file_record, mock_storage):
    """Test storage download failure updates status to FAILED."""
    
    mock_storage.get_file_bytes.side_effect = StorageException("Failed to download")

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.FAILED
    assert "Failed to download" in test_file_record.error_message
