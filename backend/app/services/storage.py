"""
BizLens Backend — Storage Service.

Provides a unified interface for file storage.
Currently implemented via Supabase Storage.
"""

import logging
from typing import Protocol

from supabase import Client, create_client

from app.core.config import settings
from app.core.exceptions import BizLensError

logger = logging.getLogger(__name__)


class StorageException(BizLensError):
    """Raised when a storage operation fails."""

    pass


class StorageService(Protocol):
    """Interface for file storage operations."""

    def upload_file(self, path: str, file_bytes: bytes, mime_type: str) -> str:
        """Upload a file and return the storage path."""
        ...

    def delete_file(self, path: str) -> None:
        """Delete a file from storage."""
        ...


class SupabaseStorageService:
    """Supabase Storage implementation."""

    def __init__(self) -> None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            logger.warning("Supabase Storage credentials missing. Storage operations will fail.")
            self._client: Client | None = None
        else:
            self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        self.bucket = settings.storage_bucket_name

    def upload_file(self, path: str, file_bytes: bytes, mime_type: str) -> str:
        """Upload a file to Supabase Storage.

        Args:
            path: Destination path in the bucket (e.g., owner_id/file_id/filename.csv)
            file_bytes: Raw file content
            mime_type: MIME type of the file

        Returns:
            The path where the file was stored.

        Raises:
            StorageException: If the upload fails.
        """
        if not self._client:
            raise StorageException("Storage is not configured.")

        try:
            self._client.storage.from_(self.bucket).upload(
                path, file_bytes, file_options={"content-type": mime_type}
            )
            # The response usually contains {"Key": "..."} or similar on success.
            # We simply return the requested path as it's deterministic.
            return path
        except Exception as e:
            logger.error(f"Failed to upload file to Supabase Storage: {e}")
            raise StorageException(f"Failed to upload file: {e}") from e

    def delete_file(self, path: str) -> None:
        """Delete a file from Supabase Storage.

        Args:
            path: Path to the file in the bucket.

        Raises:
            StorageException: If the deletion fails.
        """
        if not self._client:
            raise StorageException("Storage is not configured.")

        try:
            self._client.storage.from_(self.bucket).remove([path])
        except Exception as e:
            logger.error(f"Failed to delete file from Supabase Storage: {e}")
            raise StorageException(f"Failed to delete file: {e}") from e


# Singleton instance
storage_service = SupabaseStorageService()
