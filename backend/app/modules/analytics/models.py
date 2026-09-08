"""
BizLens Backend — Analytics Database Models.

Contains the VerificationRecord model for persisting independent verification
results.  This is separate from the ingestion models (FileRecord, ExtractedRow,
NormalizedFact) to keep analytics concerns distinct from ingestion concerns.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.shared.enums import VerificationStatus


class VerificationRecord(Base):
    """
    Stores the result of an independent verification check for a single metric.

    The VerificationEngine re-queries NormalizedFact independently and compares
    the verified_value against the claimed_value from the InsightsEngine.
    The status field captures the outcome.

    Provenance chain:
        VerificationRecord → file_id → FileRecord → ExtractedRow → NormalizedFact
    """

    __tablename__ = "verification_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("file_records.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Which metric this record covers (e.g., "revenue", "expense", "net_profit").
    metric: Mapped[str] = mapped_column(String, index=True, nullable=False)

    # The value claimed by InsightsEngine (sourced from MetricsEngine).
    claimed_value: Mapped[float] = mapped_column(Float, nullable=False)

    # The value independently computed from NormalizedFact by VerificationEngine.
    verified_value: Mapped[float] = mapped_column(Float, nullable=False)

    # Outcome of the comparison.
    status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status", create_type=True),
        nullable=False,
    )

    # Number of NormalizedFact records consulted for this verification.
    fact_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
