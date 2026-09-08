"""
BizLens Backend — Tests for Phase 3A InsightsEngine.

Verifies that InsightsEngine generates correct, deterministic observations
from FileMetricsResult.  No database or network calls are required.
"""

import uuid

import pytest

from app.modules.analytics.insights import Insight, InsightsEngine
from app.modules.analytics.metrics import FileMetricsResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _result(
    total_revenue: float = 0.0,
    total_expense: float = 0.0,
    operating_margin: float | None = None,
    revenue_fact_count: int = 0,
    expense_fact_count: int = 0,
) -> FileMetricsResult:
    net_profit = total_revenue - total_expense
    if operating_margin is None and total_revenue != 0.0:
        operating_margin = (net_profit / total_revenue) * 100.0
    return FileMetricsResult(
        file_id=uuid.uuid4(),
        total_revenue=total_revenue,
        total_expense=total_expense,
        net_profit=net_profit,
        operating_margin=operating_margin,
        revenue_fact_count=revenue_fact_count,
        expense_fact_count=expense_fact_count,
    )


def _metrics(res: FileMetricsResult) -> set[str]:
    return {i.metric for i in InsightsEngine(res).generate()}


# ---------------------------------------------------------------------------
# Test 1 — Revenue insight
# ---------------------------------------------------------------------------

def test_revenue_insight_present_when_revenue_positive():
    res = _result(total_revenue=10000.0, revenue_fact_count=5)
    insights = InsightsEngine(res).generate()
    rev = [i for i in insights if i.metric == "revenue"]
    assert len(rev) == 1
    assert rev[0].supporting_value == 10000.0
    assert "10,000.00" in rev[0].observation


def test_revenue_insight_absent_when_revenue_zero():
    res = _result(total_revenue=0.0, revenue_fact_count=0)
    assert "revenue" not in _metrics(res)


# ---------------------------------------------------------------------------
# Test 2 — Expense insight
# ---------------------------------------------------------------------------

def test_expense_insight_present_when_expense_positive():
    res = _result(total_expense=3000.0, expense_fact_count=3)
    insights = InsightsEngine(res).generate()
    exp = [i for i in insights if i.metric == "expense"]
    assert len(exp) == 1
    assert exp[0].supporting_value == 3000.0
    assert "3,000.00" in exp[0].observation


def test_expense_insight_absent_when_expense_zero():
    res = _result(total_expense=0.0)
    assert "expense" not in _metrics(res)


# ---------------------------------------------------------------------------
# Test 3 — Profitability insight
# ---------------------------------------------------------------------------

def test_profitable_insight_when_net_profit_positive():
    res = _result(total_revenue=10000.0, total_expense=3000.0, revenue_fact_count=2, expense_fact_count=1)
    insights = InsightsEngine(res).generate()
    profit = [i for i in insights if i.metric == "net_profit"]
    assert len(profit) == 1
    assert profit[0].label == "Profitable"
    assert profit[0].supporting_value == 7000.0


def test_loss_insight_when_net_profit_negative():
    res = _result(total_revenue=1000.0, total_expense=5000.0, revenue_fact_count=1, expense_fact_count=2)
    insights = InsightsEngine(res).generate()
    profit = [i for i in insights if i.metric == "net_profit"]
    assert len(profit) == 1
    assert profit[0].label == "Operating at a Loss"
    assert profit[0].supporting_value == -4000.0


def test_breakeven_insight_when_net_profit_zero_with_data():
    res = _result(total_revenue=5000.0, total_expense=5000.0, revenue_fact_count=2, expense_fact_count=2)
    insights = InsightsEngine(res).generate()
    profit = [i for i in insights if i.metric == "net_profit"]
    assert len(profit) == 1
    assert profit[0].label == "Break-Even"
    assert profit[0].supporting_value == 0.0


def test_no_profitability_insight_when_all_zeros():
    """When both revenue and expense are zero there is no meaningful profitability observation."""
    res = _result(total_revenue=0.0, total_expense=0.0)
    assert "net_profit" not in _metrics(res)


# ---------------------------------------------------------------------------
# Test 4 — Operating margin insight
# ---------------------------------------------------------------------------

def test_margin_insight_present_when_margin_available():
    res = _result(total_revenue=10000.0, total_expense=3000.0, revenue_fact_count=2, expense_fact_count=1)
    insights = InsightsEngine(res).generate()
    margin = [i for i in insights if i.metric == "operating_margin"]
    assert len(margin) == 1
    assert margin[0].supporting_value is not None
    assert "70.00%" in margin[0].observation  # (7000/10000)*100 = 70.0


def test_margin_insight_absent_when_revenue_zero():
    res = _result(total_revenue=0.0, total_expense=100.0, expense_fact_count=1, operating_margin=None)
    assert "operating_margin" not in _metrics(res)


# ---------------------------------------------------------------------------
# Test 5 — Missing revenue insight
# ---------------------------------------------------------------------------

def test_missing_revenue_insight_when_no_facts():
    res = _result(total_revenue=0.0, revenue_fact_count=0)
    insights = InsightsEngine(res).generate()
    dq = [i for i in insights if i.metric == "data_quality"]
    assert len(dq) == 1
    assert dq[0].supporting_value is None


def test_no_missing_revenue_insight_when_revenue_present():
    res = _result(total_revenue=1000.0, revenue_fact_count=1)
    assert "data_quality" not in _metrics(res)


# ---------------------------------------------------------------------------
# Test 6 — Zero metrics (empty file, no recognisable columns)
# ---------------------------------------------------------------------------

def test_empty_metrics_produces_data_quality_insight_only():
    res = _result()
    insights = InsightsEngine(res).generate()
    metrics = {i.metric for i in insights}
    # Should have data_quality (no revenue) and nothing else.
    assert metrics == {"data_quality"}


# ---------------------------------------------------------------------------
# Test 7 — Determinism (same input → same output)
# ---------------------------------------------------------------------------

def test_insights_are_deterministic():
    res = _result(total_revenue=1500.0, total_expense=500.0, revenue_fact_count=3, expense_fact_count=2)
    out1 = InsightsEngine(res).generate()
    out2 = InsightsEngine(res).generate()
    assert [(i.metric, i.supporting_value) for i in out1] == [
        (i.metric, i.supporting_value) for i in out2
    ]


# ---------------------------------------------------------------------------
# Test 8 — supporting_value accuracy
# ---------------------------------------------------------------------------

def test_revenue_supporting_value_matches_metric_value():
    res = _result(total_revenue=42000.0, revenue_fact_count=10)
    insights = InsightsEngine(res).generate()
    rev = next(i for i in insights if i.metric == "revenue")
    assert rev.supporting_value == 42000.0


def test_loss_supporting_value_is_negative():
    res = _result(total_revenue=100.0, total_expense=400.0, revenue_fact_count=1, expense_fact_count=2)
    insights = InsightsEngine(res).generate()
    loss = next(i for i in insights if i.metric == "net_profit")
    assert loss.supporting_value == -300.0
