"""Custom exceptions for the application."""

from typing import Any


class AssortmentOptimizerError(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)


class ValidationError(AssortmentOptimizerError):
    """Raised when input validation fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="VALIDATION_ERROR", details=details)


class NotFoundError(AssortmentOptimizerError):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str, identifier: str) -> None:
        super().__init__(
            message=f"{resource} not found: {identifier}",
            code="NOT_FOUND",
            details={"resource": resource, "identifier": identifier},
        )


class AuthenticationError(AssortmentOptimizerError):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message, code="AUTHENTICATION_ERROR")


class AuthorizationError(AssortmentOptimizerError):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Permission denied") -> None:
        super().__init__(message, code="AUTHORIZATION_ERROR")


class DatabaseError(AssortmentOptimizerError):
    """Raised when a database operation fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="DATABASE_ERROR", details=details)


class OptimizationError(AssortmentOptimizerError):
    """Raised when optimization fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="OPTIMIZATION_ERROR", details=details)


class SimulationError(AssortmentOptimizerError):
    """Raised when simulation fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="SIMULATION_ERROR", details=details)


class ExternalServiceError(AssortmentOptimizerError):
    """Raised when an external service call fails."""

    def __init__(
        self,
        service: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=f"External service error ({service}): {message}",
            code="EXTERNAL_SERVICE_ERROR",
            details={"service": service, **(details or {})},
        )
