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


@router.get("", response_model=list[FileRecordResponse])
def list_files(
    user_id: AuthenticatedUser,
    db: DbSession,
) -> list[FileRecord]:
    """
    Return all files that belong to the authenticated user, newest first.

    Only the authenticated user's files are returned — owner_id is derived
    exclusively from the validated JWT, never from request parameters.
    """
    return (
        db.query(FileRecord)
        .filter(FileRecord.owner_id == user_id)
        .order_by(FileRecord.created_at.desc())
        .all()
    )


@router.get("/{file_id}", response_model=FileRecordResponse)
def get_file(
    file_id: uuid.UUID,
    user_id: AuthenticatedUser,
    db: DbSession,
) -> FileRecord:
    """
    Return a single file record owned by the authenticated user.

    Returns 404 if the file does not exist OR belongs to a different user.
    This prevents leaking whether another user's UUID exists in the system.
    """
    record = (
        db.query(FileRecord)
        .filter(FileRecord.id == file_id, FileRecord.owner_id == user_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
    return record


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: uuid.UUID,
    user_id: AuthenticatedUser,
    db: DbSession,
    storage: StorageDep,
) -> None:
    """
    Delete a file owned by the authenticated user.

    Removes the object from Supabase Storage before deleting the database record.
    If storage deletion fails the database record is preserved and 500 is returned,
    keeping the system consistent (no orphaned DB rows pointing to missing objects).
    """
    record = (
        db.query(FileRecord)
        .filter(FileRecord.id == file_id, FileRecord.owner_id == user_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")

    # 1. Remove from storage first; abort and preserve the DB record on failure.
    try:
        storage.delete_file(record.storage_path)
    except Exception as e:
        logger.error("Storage deletion failed for path=%s: %s", record.storage_path, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file from storage.",
        ) from e

    # 2. Remove the database record.
    try:
        db.delete(record)
        db.commit()
    except Exception as e:
        logger.error("Database deletion failed for file_id=%s: %s", file_id, e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file record.",
        ) from e
