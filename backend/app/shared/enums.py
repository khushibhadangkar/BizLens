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


class VerificationStatus(StrEnum):
    """Result of an independent verification check."""

    VERIFIED = "VERIFIED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    UNABLE_TO_VERIFY = "UNABLE_TO_VERIFY"
