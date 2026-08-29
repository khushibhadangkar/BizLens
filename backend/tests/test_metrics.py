"""
BizLens Backend — Tests for Phase 3C Metrics Engine.
"""

import uuid
from typing import Generator
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.modules.ingestion.models import ExtractedRow, FileRecord, NormalizedFact
from app.modules.analytics.metrics import MetricsEngine
from app.shared.enums import ProcessingStatus

engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session() -> Generator:
    # Clear tables before each test
    db = TestingSessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def file_id_1() -> uuid.UUID:
    return uuid.uuid4()

@pytest.fixture
def file_id_2() -> uuid.UUID:
    return uuid.uuid4()


def create_fact(db, file_id, canonical_name, value):
    # Dummy extracted row to satisfy foreign key if needed (SQLite doesn't strictly enforce, but good practice)
    er = ExtractedRow(file_id=file_id, row_number=1, row_data={})
    db.add(er)
    db.commit()
    
    fact = NormalizedFact(
        file_id=file_id,
        extracted_row_id=er.id,
        row_number=1,
        canonical_name=canonical_name,
        value_numeric=value
    )
    db.add(fact)
    db.commit()


def test_metrics_calculation_standard(db_session, file_id_1):
    """Test standard revenue, expense, net profit, and operating margin calculations."""
    create_fact(db_session, file_id_1, "revenue", 1000.0)
    create_fact(db_session, file_id_1, "revenue", 500.0)
    create_fact(db_session, file_id_1, "expense", 200.0)
    create_fact(db_session, file_id_1, "expense", 300.0)
    create_fact(db_session, file_id_1, "unrelated_metric", 9999.0) # Should be ignored
    
    engine = MetricsEngine(db_session, file_id_1)
    result = engine.calculate()
    
    assert result.file_id == file_id_1
    assert result.total_revenue == 1500.0
    assert result.total_expense == 500.0
    assert result.net_profit == 1000.0
    assert result.operating_margin == (1000.0 / 1500.0) * 100.0
    assert result.revenue_fact_count == 2
    assert result.expense_fact_count == 2


def test_metrics_zero_revenue(db_session, file_id_1):
    """Test safe handling of zero revenue (no divide by zero)."""
    create_fact(db_session, file_id_1, "expense", 100.0)
    
    engine = MetricsEngine(db_session, file_id_1)
    result = engine.calculate()
    
    assert result.total_revenue == 0.0
    assert result.total_expense == 100.0
    assert result.net_profit == -100.0
    assert result.operating_margin is None
    assert result.revenue_fact_count == 0
    assert result.expense_fact_count == 1


def test_metrics_file_isolation(db_session, file_id_1, file_id_2):
    """Test that metrics engine scopes exclusively to the provided file_id."""
    # File 1 data
    create_fact(db_session, file_id_1, "revenue", 100.0)
    
    # File 2 data (should not contaminate file 1)
    create_fact(db_session, file_id_2, "revenue", 5000.0)
    create_fact(db_session, file_id_2, "expense", 1000.0)
    
    engine1 = MetricsEngine(db_session, file_id_1)
    res1 = engine1.calculate()
    
    assert res1.total_revenue == 100.0
    assert res1.total_expense == 0.0
    
    engine2 = MetricsEngine(db_session, file_id_2)
    res2 = engine2.calculate()
    
    assert res2.total_revenue == 5000.0
    assert res2.total_expense == 1000.0


def test_provenance_queries(db_session, file_id_1):
    """Test that the engine exposes the raw query for future provenance tracing."""
    create_fact(db_session, file_id_1, "revenue", 10.0)
    create_fact(db_session, file_id_1, "revenue", 20.0)
    
    engine = MetricsEngine(db_session, file_id_1)
    
    rev_query = engine.get_contributing_facts_query("revenue")
    facts = rev_query.all()
    
    assert len(facts) == 2
    assert sum(f.value_numeric for f in facts) == 30.0
