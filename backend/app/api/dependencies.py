"""
BizLens Backend — Shared API Dependencies.

Reusable FastAPI dependencies injected into route handlers.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.storage import StorageService, storage_service

# Re-export so routers import from a single location.
__all__ = [
    "AuthenticatedUser",
    "DbSession",
    "StorageDep",
    "get_current_user_id",
    "get_db",
    "get_storage_service",
]


def get_storage_service() -> StorageService:
    """Dependency that provides the storage service."""
    return storage_service


# Convenience type aliases for route signatures.
DbSession = Annotated[Session, Depends(get_db)]
AuthenticatedUser = Annotated[str, Depends(get_current_user_id)]
StorageDep = Annotated[StorageService, Depends(get_storage_service)]
