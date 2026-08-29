"""
BizLens Backend — Ingestion Models.

Contains the database models for file upload and ingestion tracking.
"""

import uuid
from datetime import datetime, date

from sqlalchemy import BigInteger, DateTime, Enum, String, func, ForeignKey, Integer, JSON, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base
from app.shared.enums import ProcessingStatus


class FileRecord(Base):
    """Represents an uploaded physical file."""

    __tablename__ = "file_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    original_filename: Mapped[str] = mapped_column(String, nullable=False)
    storage_path: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    file_type: Mapped[str] = mapped_column(String, nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)

    status: Mapped[ProcessingStatus] = mapped_column(
        Enum(ProcessingStatus, name="processing_status", create_type=True),
        nullable=False,
        default=ProcessingStatus.PENDING,
    )
    error_message: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    extracted_rows: Mapped[list["ExtractedRow"]] = relationship(
        "ExtractedRow", back_populates="file", cascade="all, delete-orphan"
    )


class ExtractedRow(Base):
    """Represents a single parsed row from an uploaded file."""

    __tablename__ = "extracted_rows"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("file_records.id", ondelete="CASCADE"), index=True, nullable=False
    )
    row_number: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    row_data: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    file: Mapped["FileRecord"] = relationship("FileRecord", back_populates="extracted_rows")
    normalized_facts: Mapped[list["NormalizedFact"]] = relationship(
        "NormalizedFact", back_populates="extracted_row", cascade="all, delete-orphan"
    )

class NormalizedFact(Base):
    """Represents a generic normalized business fact from an extracted row."""

    __tablename__ = "normalized_facts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("file_records.id", ondelete="CASCADE"), index=True, nullable=False
    )
    extracted_row_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("extracted_rows.id", ondelete="CASCADE"), index=True, nullable=False
    )
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)

    canonical_name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    value_numeric: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    value_string: Mapped[str | None] = mapped_column(String, nullable=True)
    date_value: Mapped[date | None] = mapped_column(Date, index=True, nullable=True)
    category: Mapped[str | None] = mapped_column(String, index=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    extracted_row: Mapped["ExtractedRow"] = relationship("ExtractedRow", back_populates="normalized_facts")
