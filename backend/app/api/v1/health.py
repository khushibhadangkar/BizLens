"""
BizLens Backend — Health Check Endpoint.

Provides application and database liveness checks.
Does not expose secrets or internal system details.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    """Application liveness check.

    Returns a simple status indicator confirming the API process is running.
    """
    return {"status": "healthy", "service": "bizlens-backend"}


@router.get("/health/db")
def health_check_db(db: Session = Depends(get_db)) -> dict:
    """Database connectivity check.

    Executes a trivial query to verify the database connection is alive.
    Intended for internal monitoring — do not expose to unauthenticated
    public traffic in production.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        logger.exception("Database health check failed")
        return {"status": "unhealthy", "database": "disconnected"}
