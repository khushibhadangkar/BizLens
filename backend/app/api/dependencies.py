"""
BizLens Backend — Shared API Dependencies.

Reusable FastAPI dependencies injected into route handlers.
"""

from fastapi import Depends

from app.core.database import get_db
from app.core.security import get_current_user_id

# Re-export so routers import from a single location.
__all__ = ["AuthenticatedUser", "DbSession", "get_current_user_id", "get_db"]

# Convenience type aliases for route signatures.
DbSession = Depends(get_db)
AuthenticatedUser = Depends(get_current_user_id)
