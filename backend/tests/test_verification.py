"""
BizLens Backend — Tests for Phase 3B VerificationEngine.

Verifies that the VerificationEngine independently queries NormalizedFact,
correctly classifies verification outcomes, persists records, and is idempotent.
"""

import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.modules.analytics.insights import Insight
from app.modules.analytics.models import VerificationRecord
from app.modules.analytics.verification import VerificationEngine
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.shared.enums import ProcessingStatus, VerificationStatus

# ---------------------------------------------------------------------------
# SQLite in-memory engine — StaticPool keeps same connection across threads.
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
def db():
    session = _SessionLocal()
    # Clear in FK-safe order.
    session.query(VerificationRecord).delete()
    session.query(NormalizedFact).delete()
    session.query(ExtractedRow).delete()
    session.query(FileRecord).delete()
    session.commit()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _file(db, owner_id: str = "user-1") -> FileRecord:
    rec = FileRecord(
        id=uuid.uuid4(),
        owner_id=owner_id,
        original_filename="data.csv",
        storage_path=f"{owner_id}/{uuid.uuid4()}/data.csv",
        file_type="csv",
        mime_type="text/csv",
        file_size=256,
        status=ProcessingStatus.COMPLETED,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def _fact(db, file_id: uuid.UUID, canonical_name: str, value: float, row_num: int = 1) -> NormalizedFact:
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


def _insight(metric: str, value: float | None) -> Insight:
    return Insight(metric=metric, label=metric, observation="", supporting_value=value)


# ---------------------------------------------------------------------------
# Test 1 — Exact match → VERIFIED
# ---------------------------------------------------------------------------

def test_exact_match_is_verified(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 1000.0)
    engine = VerificationEngine(db, f.id)
    record = engine.verify_insight(_insight("revenue", 1000.0))
    assert record.status == VerificationStatus.VERIFIED
    assert record.verified_value == 1000.0
    assert record.fact_count == 1


# ---------------------------------------------------------------------------
# Test 2 — Within floating-point tolerance → VERIFIED
# ---------------------------------------------------------------------------

def test_within_tolerance_is_verified(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 1000.0)
    # Differ by 0.001 — within absolute floor of 0.01
    engine = VerificationEngine(db, f.id)
    record = engine.verify_insight(_insight("revenue", 1000.001))
    assert record.status == VerificationStatus.VERIFIED


# ---------------------------------------------------------------------------
# Test 3 — Values differ significantly → NEEDS_REVIEW
# ---------------------------------------------------------------------------

def test_significant_mismatch_is_needs_review(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 1000.0)
    engine = VerificationEngine(db, f.id)
    # Claim 500 but DB has 1000 — clear discrepancy
    record = engine.verify_insight(_insight("revenue", 500.0))
    assert record.status == VerificationStatus.NEEDS_REVIEW
    assert record.claimed_value == 500.0
    assert record.verified_value == 1000.0


# ---------------------------------------------------------------------------
# Test 4 — No facts → UNABLE_TO_VERIFY
# ---------------------------------------------------------------------------

def test_no_facts_is_unable_to_verify(db):
    f = _file(db)
    # No facts inserted.
    engine = VerificationEngine(db, f.id)
    record = engine.verify_insight(_insight("revenue", 500.0))
    assert record.status == VerificationStatus.UNABLE_TO_VERIFY
    assert record.fact_count == 0


# ---------------------------------------------------------------------------
# Test 5 — Net profit (derived metric) is verified correctly
# ---------------------------------------------------------------------------

def test_net_profit_verified_correctly(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 5000.0, row_num=1)
    _fact(db, f.id, "expense", 2000.0, row_num=2)
    engine = VerificationEngine(db, f.id)
    record = engine.verify_insight(_insight("net_profit", 3000.0))
    assert record.status == VerificationStatus.VERIFIED
    assert record.verified_value == 3000.0
    assert record.fact_count == 2  # 1 revenue + 1 expense


# ---------------------------------------------------------------------------
# Test 6 — Operating margin (derived) is verified
# ---------------------------------------------------------------------------

def test_operating_margin_verified_correctly(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 10000.0, row_num=1)
    _fact(db, f.id, "expense", 3000.0, row_num=2)
    # Expected margin: (7000/10000)*100 = 70.0
    engine = VerificationEngine(db, f.id)
    record = engine.verify_insight(_insight("operating_margin", 70.0))
    assert record.status == VerificationStatus.VERIFIED
    assert abs(record.verified_value - 70.0) < 0.01


# ---------------------------------------------------------------------------
# Test 7 — File scoping
# ---------------------------------------------------------------------------

def test_verification_is_scoped_to_file_id(db):
    f1 = _file(db, owner_id="user-1")
    f2 = _file(db, owner_id="user-2")
    _fact(db, f1.id, "revenue", 1000.0)
    _fact(db, f2.id, "revenue", 99999.0)  # must not contaminate f1

    engine = VerificationEngine(db, f1.id)
    record = engine.verify_insight(_insight("revenue", 1000.0))
    assert record.status == VerificationStatus.VERIFIED
    assert record.verified_value == 1000.0  # only f1 revenue


# ---------------------------------------------------------------------------
# Test 8 — Persistence
# ---------------------------------------------------------------------------

def test_verify_all_persists_records(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 2000.0)

    engine = VerificationEngine(db, f.id)
    insights = [_insight("revenue", 2000.0)]
    records = engine.verify_all(insights)
    db.commit()

    persisted = db.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).all()
    assert len(persisted) == 1
    assert persisted[0].metric == "revenue"
    assert persisted[0].status == VerificationStatus.VERIFIED


# ---------------------------------------------------------------------------
# Test 9 — Repeated verification does not accumulate duplicate records
# ---------------------------------------------------------------------------

def test_verify_all_is_idempotent(db):
    f = _file(db)
    _fact(db, f.id, "revenue", 3000.0)

    insights = [_insight("revenue", 3000.0)]

    engine = VerificationEngine(db, f.id)
    engine.verify_all(insights)
    db.commit()

    # Run a second time.
    engine.verify_all(insights)
    db.commit()

    count = db.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).count()
    assert count == 1  # not 2


# ---------------------------------------------------------------------------
# Test 10 — Cross-file contamination in verify_all
# ---------------------------------------------------------------------------

def test_verify_all_does_not_contaminate_other_files(db):
    f1 = _file(db, owner_id="user-a")
    f2 = _file(db, owner_id="user-b")
    _fact(db, f1.id, "revenue", 500.0)
    _fact(db, f2.id, "revenue", 8000.0)

    engine1 = VerificationEngine(db, f1.id)
    engine1.verify_all([_insight("revenue", 500.0)])
    db.commit()

    engine2 = VerificationEngine(db, f2.id)
    engine2.verify_all([_insight("revenue", 8000.0)])
    db.commit()

    recs_f1 = db.query(VerificationRecord).filter(
        VerificationRecord.file_id == f1.id
    ).all()
    recs_f2 = db.query(VerificationRecord).filter(
        VerificationRecord.file_id == f2.id
    ).all()

    assert len(recs_f1) == 1 and recs_f1[0].verified_value == 500.0
    assert len(recs_f2) == 1 and recs_f2[0].verified_value == 8000.0


# ---------------------------------------------------------------------------
# Test 11 — data_quality insights are skipped (no numerical claim to verify)
# ---------------------------------------------------------------------------

def test_data_quality_insights_are_skipped(db):
    f = _file(db)
    # data_quality insight has no supporting_value to verify.
    dq = Insight(metric="data_quality", label="No Revenue", observation="...", supporting_value=None)

    engine = VerificationEngine(db, f.id)
    records = engine.verify_all([dq])
    db.commit()

    assert records == []
    assert db.query(VerificationRecord).filter(
        VerificationRecord.file_id == f.id
    ).count() == 0
