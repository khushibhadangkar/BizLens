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
