"""
BizLens Backend — Files API.

Handles file upload and basic metadata retrieval for the Phase 1 ingestion.
"""

import logging
import os
import re
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.dependencies import AuthenticatedUser, DbSession, StorageDep
from app.core.config import settings
from app.modules.ingestion.models import FileRecord
from app.modules.ingestion.schemas import FileRecordResponse
from app.shared.enums import ProcessingStatus

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Files"])

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".pdf"}


def sanitize_filename(filename: str) -> str:
    """Return a safe filename without path traversal chars."""
    basename = os.path.basename(filename)
    # Remove all characters except word characters, dots, and hyphens
    sanitized = re.sub(r"[^\w\.-]", "_", basename)
    # Prevent empty or hidden-only filenames
    if not sanitized or sanitized.startswith("."):
        return "unnamed_file"
    return sanitized


@router.post("", response_model=FileRecordResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    user_id: AuthenticatedUser,
    db: DbSession,
    storage: StorageDep,
    file: UploadFile = File(...),
):
    """
    Upload a file for processing.

    Accepts CSV, XLSX, and PDF files. Validates size and extension.
    The file is stored securely and metadata is saved to the database.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided.")

    # 1. Extension validation
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # 2. Read and Size validation
    content = await file.read()
    file_size = len(content)

    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty.")

    if file_size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_upload_size_bytes} bytes.",
        )

    # 3. Prepare storage path
    file_id = uuid.uuid4()
    safe_filename = sanitize_filename(file.filename)
    storage_path = f"{user_id}/{file_id}/{safe_filename}"
    mime_type = file.content_type or "application/octet-stream"

    # 4. Upload to Storage
    try:
        storage.upload_file(storage_path, content, mime_type)
    except Exception as e:
        logger.error(f"Storage upload failed for {file.filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage.",
        ) from e

    # 5. Save to Database
    record = FileRecord(
        id=file_id,
        owner_id=user_id,
        original_filename=file.filename,
        storage_path=storage_path,
        file_type=ext.lstrip("."),
        mime_type=mime_type,
        file_size=file_size,
        status=ProcessingStatus.PENDING,
    )

    db.add(record)
    try:
        db.commit()
        db.refresh(record)
    except Exception as e:
        logger.error(f"Database commit failed for {file_id}: {e}")
        db.rollback()
        # Rollback storage
        try:
            storage.delete_file(storage_path)
        except Exception as delete_err:
            logger.error(f"Failed to rollback storage for {storage_path}: {delete_err}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file metadata.",
        ) from e

    return record
