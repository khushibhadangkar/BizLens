"""
BizLens Backend — Tests for Phase 2A Analytics API.

Tests the two analytics endpoints:
  GET /api/v1/analytics/{file_id}
  GET /api/v1/analytics/{file_id}/evidence/{canonical_name}

Conventions follow test_files.py and test_normalization.py:
  - Real dependencies (get_current_user_id, get_db) are overridden via
    app.dependency_overrides so no real Supabase or PostgreSQL is required.
  - SQLite in-memory with StaticPool + check_same_thread=False is required
    because FastAPI's TestClient runs the ASGI app in a separate thread;
    the default SQLite SingletonThreadPool refuses cross-thread access.
  - The same db_session object is injected into both the test body AND the
    request handler so test-inserted rows are immediately visible.
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
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.shared.enums import ProcessingStatus


# ---------------------------------------------------------------------------
# SQLite engine — StaticPool keeps the same connection across threads
# ---------------------------------------------------------------------------

_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="module", autouse=True)
def _create_tables():
    """Create all tables once per module; drop after the module finishes."""
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture()
def db_session():
    """
    Provide a clean SQLite session with all rows removed before each test.
    Deletion order respects FK constraints.
    """
    db = _TestingSessionLocal()
    db.query(NormalizedFact).delete()
    db.query(ExtractedRow).delete()
    db.query(FileRecord).delete()
    db.commit()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_OWNER = "user-owner-123"
_OTHER = "user-other-456"
_CANONICAL_REVENUE = "revenue"
_CANONICAL_EXPENSE = "expense"


def _make_file_record(
    db,
    owner_id: str = _OWNER,
    status: ProcessingStatus = ProcessingStatus.COMPLETED,
) -> FileRecord:
    """Insert a minimal FileRecord and return it."""
    record = FileRecord(
        id=uuid.uuid4(),
        owner_id=owner_id,
        original_filename="sales.csv",
        storage_path=f"{owner_id}/{uuid.uuid4()}/sales.csv",
        file_type="csv",
        mime_type="text/csv",
        file_size=512,
        status=status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def _make_fact(
    db,
    file_id: uuid.UUID,
    canonical_name: str,
    value: float,
    row_number: int = 1,
) -> NormalizedFact:
    """Insert an ExtractedRow and a corresponding NormalizedFact; return the fact."""
    row = ExtractedRow(file_id=file_id, row_number=row_number, row_data={})
    db.add(row)
    db.commit()

    fact = NormalizedFact(
        file_id=file_id,
        extracted_row_id=row.id,
        row_number=row_number,
        canonical_name=canonical_name,
        value_numeric=value,
        date_value=date(2024, 1, min(row_number, 28)),
        category="Sales",
    )
    db.add(fact)
    db.commit()
    return fact


# ---------------------------------------------------------------------------
# Fixtures — TestClient variants
# ---------------------------------------------------------------------------


@pytest.fixture()
def authed_client(db_session):
    """
    TestClient where:
      - get_current_user_id returns _OWNER
      - get_db returns the SAME db_session used in the test body, so records
        written by helpers are immediately visible to the request handler.
    """
    app.dependency_overrides[get_current_user_id] = lambda: _OWNER
    app.dependency_overrides[get_db] = lambda: db_session

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def unauthed_client():
    """TestClient with no overrides — forces real JWT validation → 401."""
    app.dependency_overrides.clear()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test 1 — Unauthenticated request → 401
# ---------------------------------------------------------------------------

def test_get_metrics_unauthenticated_returns_401(unauthed_client):
    """GET /analytics/{file_id} without a token returns 401."""
    response = unauthed_client.get(f"/api/v1/analytics/{uuid.uuid4()}")
    assert response.status_code == 401


def test_get_evidence_unauthenticated_returns_401(unauthed_client):
    """GET /analytics/{file_id}/evidence/{name} without a token returns 401."""
    response = unauthed_client.get(
        f"/api/v1/analytics/{uuid.uuid4()}/evidence/revenue"
    )
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Test 2 — Authenticated user requesting another user's file → 404
# ---------------------------------------------------------------------------

def test_get_metrics_wrong_owner_returns_404(authed_client, db_session):
    """A file owned by a different user is indistinguishable from non-existent (404)."""
    other_file = _make_file_record(db_session, owner_id=_OTHER)

    response = authed_client.get(f"/api/v1/analytics/{other_file.id}")
    assert response.status_code == 404


def test_get_evidence_wrong_owner_returns_404(authed_client, db_session):
    """Same ownership rule applies to the evidence endpoint."""
    other_file = _make_file_record(db_session, owner_id=_OTHER)

    response = authed_client.get(
        f"/api/v1/analytics/{other_file.id}/evidence/revenue"
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Test 3 — COMPLETED file returns correct metrics
# ---------------------------------------------------------------------------

def test_get_metrics_completed_file_returns_correct_values(authed_client, db_session):
    """
    Authenticated owner requesting a COMPLETED file gets accurate metric values.
    Revenue: 1000 + 500 = 1500
    Expense: 200 + 300 = 500
    Net profit: 1000
    Margin: (1000 / 1500) * 100 ≈ 66.67
    """
    record = _make_file_record(db_session, owner_id=_OWNER)
    _make_fact(db_session, record.id, _CANONICAL_REVENUE, 1000.0, row_number=1)
    _make_fact(db_session, record.id, _CANONICAL_REVENUE, 500.0, row_number=2)
    _make_fact(db_session, record.id, _CANONICAL_EXPENSE, 200.0, row_number=3)
    _make_fact(db_session, record.id, _CANONICAL_EXPENSE, 300.0, row_number=4)

    response = authed_client.get(f"/api/v1/analytics/{record.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["file_id"] == str(record.id)
    assert data["total_revenue"] == 1500.0
    assert data["total_expense"] == 500.0
    assert data["net_profit"] == 1000.0
    assert data["revenue_fact_count"] == 2
    assert data["expense_fact_count"] == 2
    # Margin: (1000 / 1500) * 100
    assert abs(data["operating_margin"] - (1000.0 / 1500.0 * 100.0)) < 0.001


# ---------------------------------------------------------------------------
# Test 4 — COMPLETED file with no normalized facts → zeros, margin = null
# ---------------------------------------------------------------------------

def test_get_metrics_no_facts_returns_zeros(authed_client, db_session):
    """
    A COMPLETED file that produced no NormalizedFacts (e.g., unrecognised columns)
    returns all-zero metrics and operating_margin = null (no divide-by-zero error).
    """
    record = _make_file_record(db_session, owner_id=_OWNER)
    # No facts inserted.

    response = authed_client.get(f"/api/v1/analytics/{record.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["total_revenue"] == 0.0
    assert data["total_expense"] == 0.0
    assert data["net_profit"] == 0.0
    assert data["operating_margin"] is None
    assert data["revenue_fact_count"] == 0
    assert data["expense_fact_count"] == 0


# ---------------------------------------------------------------------------
# Test 5 — Evidence endpoint returns correct contributing facts
# ---------------------------------------------------------------------------

def test_get_evidence_revenue_returns_correct_facts(authed_client, db_session):
    """
    Evidence endpoint returns exactly the NormalizedFact records for 'revenue',
    with correct values and row numbers.
    """
    record = _make_file_record(db_session, owner_id=_OWNER)
    f1 = _make_fact(db_session, record.id, _CANONICAL_REVENUE, 800.0, row_number=1)
    f2 = _make_fact(db_session, record.id, _CANONICAL_REVENUE, 200.0, row_number=2)
    _make_fact(db_session, record.id, _CANONICAL_EXPENSE, 100.0, row_number=3)  # must NOT appear

    response = authed_client.get(
        f"/api/v1/analytics/{record.id}/evidence/revenue"
    )

    assert response.status_code == 200
    facts = response.json()

    # Exactly the two revenue facts; expense fact must be excluded.
    assert len(facts) == 2

    values = {f["value_numeric"] for f in facts}
    assert values == {800.0, 200.0}

    row_numbers = {f["row_number"] for f in facts}
    assert row_numbers == {1, 2}

    # canonical_name must be "revenue" for every returned fact
    assert all(f["canonical_name"] == "revenue" for f in facts)

    # Each fact must carry its extracted_row_id (provenance link)
    assert all(f["extracted_row_id"] is not None for f in facts)


def test_get_evidence_expense_returns_correct_facts(authed_client, db_session):
    """Evidence endpoint works identically for 'expense'."""
    record = _make_file_record(db_session, owner_id=_OWNER)
    _make_fact(db_session, record.id, _CANONICAL_REVENUE, 5000.0, row_number=1)
    _make_fact(db_session, record.id, _CANONICAL_EXPENSE, 300.0, row_number=2)
    _make_fact(db_session, record.id, _CANONICAL_EXPENSE, 700.0, row_number=3)

    response = authed_client.get(
        f"/api/v1/analytics/{record.id}/evidence/expense"
    )

    assert response.status_code == 200
    facts = response.json()
    assert len(facts) == 2
    assert {f["value_numeric"] for f in facts} == {300.0, 700.0}


# ---------------------------------------------------------------------------
# Test 6 — Evidence for unknown/empty canonical_name → empty list
# ---------------------------------------------------------------------------

def test_get_evidence_unknown_canonical_name_returns_empty(authed_client, db_session):
    """
    An unrecognised canonical_name returns an empty list — not 404 or 500.
    MetricsEngine.get_contributing_facts_query() simply finds no matching facts.
    """
    record = _make_file_record(db_session, owner_id=_OWNER)
    _make_fact(db_session, record.id, _CANONICAL_REVENUE, 100.0)

    response = authed_client.get(
        f"/api/v1/analytics/{record.id}/evidence/profit"
    )

    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# Test 7 — File not COMPLETED → 409
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bad_status", [
    ProcessingStatus.PENDING,
    ProcessingStatus.PROCESSING,
    ProcessingStatus.FAILED,
])
def test_get_metrics_non_completed_file_returns_409(authed_client, db_session, bad_status):
    """Requesting metrics for a file that is not COMPLETED returns 409 Conflict."""
    record = _make_file_record(db_session, owner_id=_OWNER, status=bad_status)

    response = authed_client.get(f"/api/v1/analytics/{record.id}")
    assert response.status_code == 409
    assert "not ready" in response.json()["detail"].lower()


@pytest.mark.parametrize("bad_status", [
    ProcessingStatus.PENDING,
    ProcessingStatus.PROCESSING,
    ProcessingStatus.FAILED,
])
def test_get_evidence_non_completed_file_returns_409(authed_client, db_session, bad_status):
    """The evidence endpoint also rejects non-COMPLETED files with 409."""
    record = _make_file_record(db_session, owner_id=_OWNER, status=bad_status)

    response = authed_client.get(
        f"/api/v1/analytics/{record.id}/evidence/revenue"
    )
    assert response.status_code == 409


# ---------------------------------------------------------------------------
# Test 8 — Nonexistent file_id returns 404
# ---------------------------------------------------------------------------

def test_get_metrics_nonexistent_file_returns_404(authed_client):
    """A random UUID that has no FileRecord in the DB returns 404."""
    response = authed_client.get(f"/api/v1/analytics/{uuid.uuid4()}")
    assert response.status_code == 404


def test_get_evidence_nonexistent_file_returns_404(authed_client):
    """Same 404 behaviour for the evidence endpoint."""
    response = authed_client.get(
        f"/api/v1/analytics/{uuid.uuid4()}/evidence/revenue"
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Test 9 — File isolation (facts from other files do not contaminate results)
# ---------------------------------------------------------------------------

def test_metrics_are_isolated_per_file(authed_client, db_session):
    """
    MetricsEngine is scoped to file_id.  A second file's facts must not
    appear in another file's metrics response.
    """
    file_a = _make_file_record(db_session, owner_id=_OWNER)
    file_b = _make_file_record(db_session, owner_id=_OWNER)

    _make_fact(db_session, file_a.id, _CANONICAL_REVENUE, 100.0)
    _make_fact(db_session, file_b.id, _CANONICAL_REVENUE, 99999.0)  # must NOT appear in file_a

    response = authed_client.get(f"/api/v1/analytics/{file_a.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["total_revenue"] == 100.0
    assert data["revenue_fact_count"] == 1
