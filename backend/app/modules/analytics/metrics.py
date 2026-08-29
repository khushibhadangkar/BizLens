"""
BizLens Backend — Deterministic Metrics Engine.

Calculates business metrics exclusively from NormalizedFact records.
"""

import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, Query

from app.modules.ingestion.models import NormalizedFact


@dataclass
class FileMetricsResult:
    """Deterministic result of metric calculations for a single file."""
    file_id: uuid.UUID
    total_revenue: float
    total_expense: float
    net_profit: float
    operating_margin: Optional[float]
    revenue_fact_count: int
    expense_fact_count: int


class MetricsEngine:
    """
    Calculates business metrics deterministically.
    Operates ONLY on NormalizedFact. Never reads raw rows or fixtures.
    """

    def __init__(self, db: Session, file_id: uuid.UUID):
        self.db = db
        self.file_id = file_id

    def get_contributing_facts_query(self, canonical_name: str) -> Query:
        """
        Returns the exact SQLAlchemy query representing the facts 
        contributing to a specific metric.
        This provides a reusable foundation for future Evidence/Provenance tracing.
        """
        return self.db.query(NormalizedFact).filter(
            NormalizedFact.file_id == self.file_id,
            NormalizedFact.canonical_name == canonical_name
        )

    def calculate(self) -> FileMetricsResult:
        """Calculate and return the core metrics."""
        
        # 1. Total Revenue
        rev_query = self.get_contributing_facts_query("revenue")
        rev_stats = rev_query.with_entities(
            func.sum(NormalizedFact.value_numeric),
            func.count(NormalizedFact.id)
        ).first()
        
        total_revenue = float(rev_stats[0]) if rev_stats and rev_stats[0] is not None else 0.0
        revenue_count = int(rev_stats[1]) if rev_stats and rev_stats[1] is not None else 0

        # 2. Total Expense
        exp_query = self.get_contributing_facts_query("expense")
        exp_stats = exp_query.with_entities(
            func.sum(NormalizedFact.value_numeric),
            func.count(NormalizedFact.id)
        ).first()
        
        total_expense = float(exp_stats[0]) if exp_stats and exp_stats[0] is not None else 0.0
        expense_count = int(exp_stats[1]) if exp_stats and exp_stats[1] is not None else 0

        # 3. Net Profit
        net_profit = total_revenue - total_expense

        # 4. Operating Margin
        if total_revenue != 0.0:
            operating_margin = (net_profit / total_revenue) * 100.0
        else:
            # Prevent divide-by-zero
            operating_margin = None

        return FileMetricsResult(
            file_id=self.file_id,
            total_revenue=total_revenue,
            total_expense=total_expense,
            net_profit=net_profit,
            operating_margin=operating_margin,
            revenue_fact_count=revenue_count,
            expense_fact_count=expense_count
        )
