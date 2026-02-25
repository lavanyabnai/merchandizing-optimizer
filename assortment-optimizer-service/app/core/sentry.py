"""Sentry error tracking integration.

This module provides Sentry integration for:
- Error tracking and reporting
- Performance monitoring (traces)
- Profiling support
"""

from app.core.logging import get_logger

logger = get_logger(__name__)


def init_sentry() -> None:
    """Initialize Sentry SDK for error tracking and performance monitoring.

    Called during application startup. Sentry is only initialized if
    SENTRY_DSN is configured in settings.
    """
    from app.config import get_settings

    settings = get_settings()

    if not settings.sentry_dsn:
        logger.info("Sentry DSN not configured, error tracking disabled")
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.asyncio import AsyncioIntegration
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.httpx import HttpxIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            release=f"assortment-optimizer@{settings.app_version}",
            # Performance monitoring
            traces_sample_rate=settings.sentry_traces_sample_rate,
            # Profiling
            profiles_sample_rate=settings.sentry_profiles_sample_rate,
            # Integrations
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                AsyncioIntegration(),
                SqlalchemyIntegration(),
                HttpxIntegration(),
                LoggingIntegration(
                    level=None,  # Don't capture log messages as breadcrumbs
                    event_level=None,  # Don't capture error logs as events
                ),
            ],
            # Configuration
            send_default_pii=False,  # Don't send personally identifiable information
            attach_stacktrace=True,  # Attach stack traces to messages
            max_breadcrumbs=50,  # Limit breadcrumbs for memory
            # Filtering
            before_send=_before_send,
            before_send_transaction=_before_send_transaction,
        )

        logger.info(
            "Sentry initialized",
            environment=settings.environment,
            traces_sample_rate=settings.sentry_traces_sample_rate,
        )

    except ImportError:
        logger.warning("sentry-sdk not installed, error tracking disabled")
    except Exception as e:
        logger.error("Failed to initialize Sentry", error=str(e))


def _before_send(event: dict, hint: dict) -> dict | None:
    """Filter or modify events before sending to Sentry.

    Args:
        event: The Sentry event to be sent.
        hint: Additional context about the event.

    Returns:
        The event to send, or None to drop it.
    """
    # Get the exception if available
    exc_info = hint.get("exc_info")
    if exc_info:
        exc_type, exc_value, _ = exc_info

        # Don't report validation errors - these are expected
        if exc_type.__name__ == "RequestValidationError":
            return None

        # Don't report 404 errors
        if exc_type.__name__ == "HTTPException":
            if getattr(exc_value, "status_code", None) == 404:
                return None

    # Scrub sensitive data from headers
    if "request" in event and "headers" in event["request"]:
        headers = event["request"]["headers"]
        sensitive_headers = ["authorization", "cookie", "x-api-key"]
        for header in sensitive_headers:
            if header in headers:
                headers[header] = "[Filtered]"

    return event


def _before_send_transaction(event: dict, hint: dict) -> dict | None:
    """Filter or modify transactions before sending to Sentry.

    Args:
        event: The Sentry transaction to be sent.
        hint: Additional context about the transaction.

    Returns:
        The transaction to send, or None to drop it.
    """
    # Don't trace health check endpoints
    transaction_name = event.get("transaction", "")
    if any(
        path in transaction_name
        for path in ["/health", "/metrics", "/stats", "/nginx-health"]
    ):
        return None

    return event


def capture_exception(exception: Exception) -> str | None:
    """Capture an exception and send to Sentry.

    Args:
        exception: The exception to capture.

    Returns:
        The Sentry event ID, or None if Sentry is not configured.
    """
    try:
        import sentry_sdk

        return sentry_sdk.capture_exception(exception)
    except ImportError:
        return None


def capture_message(message: str, level: str = "info") -> str | None:
    """Capture a message and send to Sentry.

    Args:
        message: The message to capture.
        level: The severity level (debug, info, warning, error, fatal).

    Returns:
        The Sentry event ID, or None if Sentry is not configured.
    """
    try:
        import sentry_sdk

        return sentry_sdk.capture_message(message, level=level)
    except ImportError:
        return None


def set_user(user_id: str, email: str | None = None) -> None:
    """Set the current user context for Sentry.

    Args:
        user_id: The user's unique identifier.
        email: The user's email address (optional).
    """
    try:
        import sentry_sdk

        sentry_sdk.set_user({"id": user_id, "email": email} if email else {"id": user_id})
    except ImportError:
        pass


def set_tag(key: str, value: str) -> None:
    """Set a tag for the current Sentry scope.

    Args:
        key: The tag key.
        value: The tag value.
    """
    try:
        import sentry_sdk

        sentry_sdk.set_tag(key, value)
    except ImportError:
        pass


def set_context(name: str, context: dict) -> None:
    """Set additional context for the current Sentry scope.

    Args:
        name: The context name.
        context: The context data.
    """
    try:
        import sentry_sdk

        sentry_sdk.set_context(name, context)
    except ImportError:
        pass
