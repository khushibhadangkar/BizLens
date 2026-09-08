"""
BizLens Backend — Verification Engine.

Independently validates Insight claims against the underlying NormalizedFact
records stored in the database.  This is a second, independent analytical pass:
it does NOT trust the Insight's supporting_value as numerical truth; instead it
re-queries the database and computes the verified value from scratch.

Verification status semantics:
  VERIFIED       — facts exist, verified_value matches claimed_value within tolerance.
  NEEDS_REVIEW   — facts exist but values differ beyond tolerance.
  UNABLE_TO_VERIFY — no supporting facts found for the metric.

Tolerance: 0.01 (1 cent absolute) or 0.0001% relative (whichever is larger)
to handle floating-point rounding without hiding real discrepancies.
"""

import logging
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.analytics.insights import Insight
from app.modules.analytics.models import VerificationRecord
from app.modules.ingestion.models import NormalizedFact
from app.shared.enums import VerificationStatus

logger = logging.getLogger(__name__)

# Numeric comparison tolerance — values within this fraction of the larger
# value (or within the absolute floor) are considered matching.
_RELATIVE_TOLERANCE = 1e-6   # 0.0001 %
_ABSOLUTE_FLOOR = 0.01       # 1 cent (currency-agnostic)


def _values_match(a: float, b: float) -> bool:
    """Return True when a and b agree within the documented tolerance."""
    diff = abs(a - b)
    if diff <= _ABSOLUTE_FLOOR:
        return True
    larger = max(abs(a), abs(b))
    if larger == 0:
        return True
    return (diff / larger) <= _RELATIVE_TOLERANCE


class VerificationEngine:
    """
    Independently verifies Insight claims against NormalizedFact records.

    Usage:
        engine = VerificationEngine(db, file_id)
        records = engine.verify_all(insights)
    """

    def __init__(self, db: Session, file_id: uuid.UUID) -> None:
        self.db = db
        self.file_id = file_id

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def verify_insight(self, insight: Insight) -> VerificationRecord:
        """
        Verify a single Insight against the database and return a VerificationRecord.

        The record is NOT yet committed — callers are responsible for adding it
        to the session and committing.
        """
        claimed = insight.supporting_value if insight.supporting_value is not None else 0.0

        verified_value, fact_count = self._independently_compute(insight.metric)

        if fact_count == 0 and insight.metric not in ("net_profit", "operating_margin"):
            status = VerificationStatus.UNABLE_TO_VERIFY
        elif _values_match(claimed, verified_value):
            status = VerificationStatus.VERIFIED
        else:
            status = VerificationStatus.NEEDS_REVIEW

        return VerificationRecord(
            file_id=self.file_id,
            metric=insight.metric,
            claimed_value=claimed,
            verified_value=verified_value,
            status=status,
            fact_count=fact_count,
        )

    def verify_all(self, insights: list[Insight]) -> list[VerificationRecord]:
        """
        Idempotently verify all insights for the file.

        Existing VerificationRecords for this file are removed before inserting
        the new ones, so the result always reflects the current state.
        The entire operation is transactional: either all records are replaced
        or none are (the caller must own the surrounding transaction / commit).
        """
        # Remove stale records for this file (idempotency).
        self.db.query(VerificationRecord).filter(
            VerificationRecord.file_id == self.file_id
        ).delete(synchronize_session=False)
        self.db.flush()

        records: list[VerificationRecord] = []
        for insight in insights:
            # Skip data_quality insights — they describe missing columns,
            # not numerical claims that can be verified.
            if insight.metric == "data_quality":
                continue
            record = self.verify_insight(insight)
            self.db.add(record)
            records.append(record)

        self.db.flush()
        logger.info(
            "Verification complete: file_id=%s metrics=%s",
            self.file_id,
            [r.metric for r in records],
        )
        return records

    # ------------------------------------------------------------------
    # Private — independent DB queries
    # ------------------------------------------------------------------

    def _sum_facts(self, canonical_name: str) -> tuple[float, int]:
        """Return (sum_of_values, fact_count) for a canonical_name, scoped to file_id."""
        row = (
            self.db.query(
                func.sum(NormalizedFact.value_numeric),
                func.count(NormalizedFact.id),
            )
            .filter(
                NormalizedFact.file_id == self.file_id,
                NormalizedFact.canonical_name == canonical_name,
            )
            .first()
        )
        total = float(row[0]) if row and row[0] is not None else 0.0
        count = int(row[1]) if row and row[1] is not None else 0
        return total, count

    def _independently_compute(self, metric: str) -> tuple[float, int]:
        """
        Re-derive the metric value from NormalizedFact records.

        Returns (verified_value, fact_count_consulted).
        For derived metrics (net_profit, operating_margin) the fact_count is the
        sum of the constituent fact counts.
        """
        if metric == "revenue":
            return self._sum_facts("revenue")

        if metric == "expense":
            return self._sum_facts("expense")

        if metric == "net_profit":
            rev, rc = self._sum_facts("revenue")
            exp, ec = self._sum_facts("expense")
            return (rev - exp), (rc + ec)

        if metric == "operating_margin":
            rev, rc = self._sum_facts("revenue")
            exp, ec = self._sum_facts("expense")
            net = rev - exp
            if rev == 0.0:
                return 0.0, (rc + ec)
            return (net / rev) * 100.0, (rc + ec)

        # For any metric we don't specifically handle, return (0, 0) → UNABLE_TO_VERIFY.
        logger.warning("VerificationEngine: unhandled metric '%s'", metric)
        return 0.0, 0
