"""
BizLens Backend — Application Exception Definitions.

All custom exceptions inherit from BizLensError so that the
global exception handler can catch them uniformly.
"""

from fastapi import HTTPException, status


class BizLensError(Exception):
    """Base exception for all BizLens application errors."""

    def __init__(self, message: str = "An internal error occurred."):
        self.message = message
        super().__init__(self.message)


class NotFoundError(BizLensError):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource", identifier: str = ""):
        detail = f"{resource} not found"
        if identifier:
            detail = f"{resource} '{identifier}' not found"
        super().__init__(detail)


class ValidationError(BizLensError):
    """Raised when input fails business-level validation."""

    pass


class AuthorizationError(BizLensError):
    """Raised when a user is not permitted to perform an action."""

    pass


def bizlens_error_to_http(err: BizLensError) -> HTTPException:
    """Map a domain exception to an appropriate HTTP response."""
    status_map: dict[type, int] = {
        NotFoundError: status.HTTP_404_NOT_FOUND,
        ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
        AuthorizationError: status.HTTP_403_FORBIDDEN,
    }
    code = status_map.get(type(err), status.HTTP_500_INTERNAL_SERVER_ERROR)
    return HTTPException(status_code=code, detail=err.message)
