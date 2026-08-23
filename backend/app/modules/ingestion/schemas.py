"""
BizLens Backend — Ingestion Schemas.

Pydantic schemas for the ingestion module.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.shared.enums import ProcessingStatus


class FileRecordResponse(BaseModel):
    """Schema for returning FileRecord metadata."""

    id: uuid.UUID
    owner_id: str
    original_filename: str
    file_type: str
    mime_type: str
    file_size: int
    status: ProcessingStatus
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
