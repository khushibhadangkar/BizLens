"""
BizLens Backend — Tests for Phase 3C Intelligence API.

Tests the three new analytics endpoints:
  GET /api/v1/analytics/{file_id}/insights
  GET /api/v1/analytics/{file_id}/verify
  GET /api/v1/analytics/{file_id}/verification

Also verifies that the existing Phase 2A endpoints still work.

Conventions match test_analytics.py:
  - SQLite StaticPool for cross-thread access from TestClient.
  - FastAPI dependency_overrides for auth + DB injection.
  - No real Supabase or PostgreSQL required.
"""

import uuid
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_current_user_id, get_db
from app.core.database import Base
from app.main import app
from app.modules.analytics.models import VerificationRecord
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.shared.enums import ProcessingStatus, VerificationStatus

# ---------------------------------------------------------------------------
# SQLite in-memory engine
# ---------------------------------------------------------------------------

_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="module", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture()
def db_session():
    db = _SessionLocal()
    db.query(VerificationRecord).delete()
    db.query(NormalizedFact).delete()
    db.query(ExtractedRow).delete()
    db.query(FileRecord).delete()
    db.commit()
    try:
        yield db
    finally:
        db.close()


_OWNER = "user-owner-abc"
_OTHER = "user-other-xyz"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_file(db, owner_id=_OWNER, status=ProcessingStatus.COMPLETED) -> FileRecord:
    rec = FileRecord(
        id=uuid.uuid4(),
        owner_id=owner_id,
        original_filename="report.csv",
        storage_path=f"{owner_id}/{uuid.uuid4()}/report.csv",
        file_type="csv",
        mime_type="text/csv",
        file_size=512,
        status=status,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def _make_fact(db, file_id, canonical_name, value, row_num=1) -> NormalizedFact:
    row = ExtractedRow(file_id=file_id, row_number=row_num, row_data={})
    db.add(row)
    db.commit()
    fact = NormalizedFact(
        file_id=file_id,
        extracted_row_id=row.id,
        row_number=row_num,
        canonical_name=canonical_name,
        value_numeric=value,
    )
    db.add(fact)
    db.commit()
    return fact


# ---------------------------------------------------------------------------
# Fixtures — TestClient
# ---------------------------------------------------------------------------

@pytest.fixture()
def authed_client(db_session):
    app.dependency_overrides[get_current_user_id] = lambda: _OWNER
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def unauthed_client():
    app.dependency_overrides.clear()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ===========================================================================
# /insights
# ===========================================================================

def test_insights_requires_auth(unauthed_client):
    response = unauthed_client.get(f"/api/v1/analytics/{uuid.uuid4()}/insights")
    assert response.status_code == 401


def test_insights_nonexistent_file_returns_404(authed_client):
    response = authed_client.get(f"/api/v1/analytics/{uuid.uuid4()}/insights")
    assert response.status_code == 404


def test_insights_wrong_owner_returns_404(authed_client, db_session):
    f = _make_file(db_session, owner_id=_OTHER)
    response = authed_client.get(f"/api/v1/analytics/{f.id}/insights")
    assert response.status_code == 404


@pytest.mark.parametrize("bad_status", [
    ProcessingStatus.PENDING,
    ProcessingStatus.PROCESSING,
    ProcessingStatus.FAILED,
])
def test_insights_non_completed_file_returns_409(authed_client, db_session, bad_status):
    f = _make_file(db_session, status=bad_status)
    response = authed_client.get(f"/api/v1/analytics/{f.id}/insights")
    assert response.status_code == 409


def test_insights_completed_file_returns_insights(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 10000.0, row_num=1)
    _make_fact(db_session, f.id, "expense", 3000.0, row_num=2)

    response = authed_client.get(f"/api/v1/analytics/{f.id}/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["file_id"] == str(f.id)
    metrics = {i["metric"] for i in data["insights"]}
    assert "revenue" in metrics
    assert "expense" in metrics
    assert "net_profit" in metrics
    assert "operating_margin" in metrics


def test_insights_no_facts_returns_data_quality_insight(authed_client, db_session):
    f = _make_file(db_session)
    response = authed_client.get(f"/api/v1/analytics/{f.id}/insights")
    assert response.status_code == 200
    data = response.json()
    metrics = {i["metric"] for i in data["insights"]}
    assert "data_quality" in metrics


# ===========================================================================
# /verify
# ===========================================================================

def test_verify_requires_auth(unauthed_client):
    response = unauthed_client.post(f"/api/v1/analytics/{uuid.uuid4()}/verify")
    assert response.status_code == 401


def test_verify_nonexistent_file_returns_404(authed_client):
    response = authed_client.post(f"/api/v1/analytics/{uuid.uuid4()}/verify")
    assert response.status_code == 404


def test_verify_wrong_owner_returns_404(authed_client, db_session):
    f = _make_file(db_session, owner_id=_OTHER)
    response = authed_client.post(f"/api/v1/analytics/{f.id}/verify")
    assert response.status_code == 404


def test_verify_returns_verification_records(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 5000.0, row_num=1)
    _make_fact(db_session, f.id, "expense", 2000.0, row_num=2)

    response = authed_client.post(f"/api/v1/analytics/{f.id}/verify")
    assert response.status_code == 200
    records = response.json()
    assert isinstance(records, list)
    assert len(records) > 0

    # Each record must have required fields.
    for r in records:
        assert "metric" in r
        assert "claimed_value" in r
        assert "verified_value" in r
        assert "status" in r
        assert "fact_count" in r
        assert r["status"] in ("VERIFIED", "NEEDS_REVIEW", "UNABLE_TO_VERIFY")


def test_verify_persists_records(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 1000.0, row_num=1)

    authed_client.post(f"/api/v1/analytics/{f.id}/verify")

    persisted = db_session.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).count()
    assert persisted > 0


def test_verify_is_idempotent(authed_client, db_session):
    """
    Calling POST /verify twice must not accumulate duplicate records.
    Strategy: call once, capture the count, call again, assert count unchanged.
    """
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 2000.0, row_num=1)

    # First call — establish the baseline record count.
    authed_client.post(f"/api/v1/analytics/{f.id}/verify")
    db_session.expire_all()  # Ensure we read fresh DB state.
    count_after_first = db_session.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).count()
    assert count_after_first > 0  # At least one record was created.

    # Second call — must replace, not append.
    authed_client.post(f"/api/v1/analytics/{f.id}/verify")
    db_session.expire_all()
    count_after_second = db_session.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).count()

    assert count_after_second == count_after_first  # No accumulation.


def test_verify_revenue_and_facts_match_status_verified(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 4000.0, row_num=1)

    response = authed_client.post(f"/api/v1/analytics/{f.id}/verify")
    records = response.json()
    rev_record = next((r for r in records if r["metric"] == "revenue"), None)
    assert rev_record is not None
    assert rev_record["status"] == "VERIFIED"
    assert rev_record["verified_value"] == 4000.0


# ===========================================================================
# /verification (read-only)
# ===========================================================================

def test_verification_requires_auth(unauthed_client):
    response = unauthed_client.get(f"/api/v1/analytics/{uuid.uuid4()}/verification")
    assert response.status_code == 401


def test_verification_nonexistent_file_returns_404(authed_client):
    response = authed_client.get(f"/api/v1/analytics/{uuid.uuid4()}/verification")
    assert response.status_code == 404


def test_verification_wrong_owner_returns_404(authed_client, db_session):
    f = _make_file(db_session, owner_id=_OTHER)
    response = authed_client.get(f"/api/v1/analytics/{f.id}/verification")
    assert response.status_code == 404


def test_verification_empty_before_verify_run(authed_client, db_session):
    f = _make_file(db_session)
    response = authed_client.get(f"/api/v1/analytics/{f.id}/verification")
    assert response.status_code == 200
    assert response.json() == []


def test_verification_returns_persisted_records(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 7000.0, row_num=1)

    authed_client.post(f"/api/v1/analytics/{f.id}/verify")

    response = authed_client.get(f"/api/v1/analytics/{f.id}/verification")
    assert response.status_code == 200
    records = response.json()
    assert len(records) > 0
    assert any(r["metric"] == "revenue" for r in records)


# ===========================================================================
# Regression — Phase 2A endpoints still work
# ===========================================================================

def test_existing_metrics_endpoint_still_works(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 500.0, row_num=1)

    response = authed_client.get(f"/api/v1/analytics/{f.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total_revenue"] == 500.0


def test_existing_evidence_endpoint_still_works(authed_client, db_session):
    f = _make_file(db_session)
    _make_fact(db_session, f.id, "revenue", 250.0, row_num=1)

    response = authed_client.get(f"/api/v1/analytics/{f.id}/evidence/revenue")
    assert response.status_code == 200
    facts = response.json()
    assert len(facts) == 1
    assert facts[0]["value_numeric"] == 250.0
