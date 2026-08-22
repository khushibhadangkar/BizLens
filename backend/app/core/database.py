"""
BizLens Backend — Database Engine & Session Management.

Uses SQLAlchemy 2.x with synchronous sessions.
Async is not introduced until there is a proven need.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.is_development,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Declarative base for all SQLAlchemy models."""

    pass


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
