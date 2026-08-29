"""
BizLens Backend — Tests for Phase 3B Normalization.
"""

import uuid
from datetime import date
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.modules.ingestion.processor import process_file
from app.shared.enums import ProcessingStatus
from app.services.storage import storage_service

engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

@pytest.fixture
def db_session():
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
def mock_session_local(db_session):
    with patch("app.modules.ingestion.processor.SessionLocal") as mock:
        class SessionWrapper:
            def __getattr__(self, item):
                if item == "close":
                    return lambda: None
                return getattr(db_session, item)
        
        mock.return_value = SessionWrapper()
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


def test_normalization_valid_fields(mock_session_local, db_session, test_file_record, mock_storage):
    """Test valid revenue/expense normalization with dates and categories."""
    csv_content = b"date,department,Revenue,Cost,unknown_col\n2024-07-01,Sales,\"$485,000\",120000,ignored\n2024-07-15,Engineering,0,\"$84,000.50\",ignored"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.COMPLETED
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    
    # Row 1 should have Revenue and Cost
    # Row 2 should have Revenue (0) and Cost (84000.5)
    assert len(facts) == 4
    
    row1_rev = next(f for f in facts if f.row_number == 1 and f.canonical_name == "revenue")
    assert row1_rev.value_numeric == 485000.0
    assert row1_rev.date_value == date(2024, 7, 1)
    assert row1_rev.category == "Sales"
    assert row1_rev.extracted_row_id is not None
    
    row1_exp = next(f for f in facts if f.row_number == 1 and f.canonical_name == "expense")
    assert row1_exp.value_numeric == 120000.0
    
    row2_rev = next(f for f in facts if f.row_number == 2 and f.canonical_name == "revenue")
    assert row2_rev.value_numeric == 0.0
    
    row2_exp = next(f for f in facts if f.row_number == 2 and f.canonical_name == "expense")
    assert row2_exp.value_numeric == 84000.50


def test_normalization_explicit_aliases(mock_session_local, db_session, test_file_record, mock_storage):
    """Test that explicit aliases are matched, but substring traps like 'sales tax' are rejected."""
    csv_content = b"Sales Tax,Income Tax,Tax Rate,Expense Ratio,Total Revenue,Operating Cost\n100,200,300,400,500,600"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.COMPLETED
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).all()
    
    # Only "Total Revenue" and "Operating Cost" should be normalized.
    # Sales Tax, Income Tax, Tax Rate, Expense Ratio should be ignored.
    assert len(facts) == 2
    
    rev_fact = next(f for f in facts if f.canonical_name == "revenue")
    assert rev_fact.value_numeric == 500.0
    
    exp_fact = next(f for f in facts if f.canonical_name == "expense")
    assert exp_fact.value_numeric == 600.0


def test_normalization_unknown_columns(mock_session_local, db_session, test_file_record, mock_storage):
    """Test that unknown columns don't crash the pipeline and are skipped."""
    csv_content = b"random_col,another_col\n123,456"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.COMPLETED
    
    # No facts generated, but extracted rows still exist
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).all()
    assert len(facts) == 0
    
    rows = db_session.query(ExtractedRow).filter(ExtractedRow.file_id == test_file_record.id).all()
    assert len(rows) == 1


def test_normalization_malformed_values(mock_session_local, db_session, test_file_record, mock_storage):
    """Test malformed values are handled safely."""
    csv_content = b"date,department,revenue\nbad-date,Sales,NOT_A_NUMBER"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    db_session.refresh(test_file_record)
    assert test_file_record.status == ProcessingStatus.COMPLETED
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).all()
    # Fact should not be generated if numeric parse completely fails (NOT_A_NUMBER has no digits so it's empty, float('') fails)
    # Actually re.sub(r'[^\d.-]', '', 'NOT_A_NUMBER') -> '' -> float('') -> ValueError, so num_val=None -> fact skipped.
    assert len(facts) == 0


def test_normalization_duplicate_processing(mock_session_local, db_session, test_file_record, mock_storage):
    """Test duplicate processing clears old records and doesn't duplicate them."""
    csv_content = b"revenue\n100\n200"
    mock_storage.get_file_bytes.return_value = csv_content

    # Run once
    process_file(test_file_record.id)
    rows_pass1 = db_session.query(ExtractedRow).count()
    facts_pass1 = db_session.query(NormalizedFact).count()
    
    assert rows_pass1 == 2
    assert facts_pass1 == 2
    
    # Run twice
    process_file(test_file_record.id)
    rows_pass2 = db_session.query(ExtractedRow).count()
    facts_pass2 = db_session.query(NormalizedFact).count()
    
    assert rows_pass2 == 2
    assert facts_pass2 == 2
