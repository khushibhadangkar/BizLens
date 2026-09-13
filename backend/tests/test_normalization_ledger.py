"""
BizLens Backend — Tests for Phase 3 Ledger Normalization.
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
        original_filename="test_ledger.csv",
        storage_path="user-123/test_ledger.csv",
        file_type="csv",
        mime_type="text/csv",
        file_size=100,
        status=ProcessingStatus.PENDING
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


def test_normalization_ledger_date_type_amount(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format: date, type, amount"""
    csv_content = b"date,type,amount\n2024-07-01,Revenue,5000\n2024-07-02,Expense,2000"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 2
    
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 5000.0
    assert facts[0].date_value == date(2024, 7, 1)
    
    assert facts[1].canonical_name == "expense"
    assert facts[1].value_numeric == 2000.0


def test_normalization_ledger_date_metric_value(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format: date, metric, value"""
    csv_content = b"date,metric,value\n2024-07-01,Sales,5000\n2024-07-02,Cost,2000"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 2
    
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 5000.0
    assert facts[1].canonical_name == "expense"
    assert facts[1].value_numeric == 2000.0


def test_normalization_ledger_date_account_total(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format: date, account, total"""
    csv_content = b"date,account,total\n2024-07-01,arr,5000\n2024-07-02,operating cost,2000"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 2
    
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 5000.0
    assert facts[1].canonical_name == "expense"
    assert facts[1].value_numeric == 2000.0


def test_normalization_ledger_case_variations(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format with various cases: Revenue, revenue, REVENUE"""
    csv_content = b"date,type,amount\n2024-07-01,Revenue,100\n2024-07-02,revenue,200\n2024-07-03,REVENUE,300"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 3
    assert all(f.canonical_name == "revenue" for f in facts)
    assert sum(f.value_numeric for f in facts) == 600.0


def test_normalization_mixed_irrelevant_rows(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format with rows that should be ignored"""
    csv_content = b"date,type,amount\n2024-07-01,Revenue,500\n2024-07-02,HR Update,0\n2024-07-03,Unknown,100"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 1
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 500.0


def test_normalization_ledger_missing_value(mock_session_local, db_session, test_file_record, mock_storage):
    """Test ledger format with missing or non-numeric value"""
    csv_content = b"date,type,amount\n2024-07-01,Revenue,invalid\n2024-07-02,Expense,\n2024-07-03,Revenue,100"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 1
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 100.0


def test_normalization_ledger_ambiguous_schema_ignored(mock_session_local, db_session, test_file_record, mock_storage):
    """Test that ambiguous numeric columns are ignored safely."""
    csv_content = b"date,department,quantity,some_code\n2024-07-01,Sales,500,892304\n2024-07-02,Engineering,200,999123"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 0


def test_normalization_category_exclusion(mock_session_local, db_session, test_file_record, mock_storage):
    """Test that the ledger metric type is NOT extracted as the category"""
    csv_content = b"date,type,category,amount\n2024-07-01,Revenue,Software,1000"
    mock_storage.get_file_bytes.return_value = csv_content

    process_file(test_file_record.id)
    
    facts = db_session.query(NormalizedFact).filter(NormalizedFact.file_id == test_file_record.id).order_by(NormalizedFact.row_number).all()
    assert len(facts) == 1
    assert facts[0].canonical_name == "revenue"
    assert facts[0].value_numeric == 1000.0
    assert facts[0].category == "Software"
