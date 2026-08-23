"""
BizLens Backend — Shared Enumerations.

Enums used across multiple modules.
Add new enums here when they are needed by more than one module.
"""

from enum import StrEnum


class AppEnvironment(StrEnum):
    """Runtime environment."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class ProcessingStatus(StrEnum):
    """Status of an uploaded file."""

    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
