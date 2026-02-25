"""Authentication dependencies for FastAPI."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import Settings, get_settings
from app.core.logging import get_logger
from app.core.security import (
    ClerkJWTError,
    SignatureVerificationError,
    TokenClaims,
    TokenExpiredError,
    TokenInvalidError,
    TokenMissingError,
    verify_token,
    verify_token_from_header,
)

logger = get_logger(__name__)

# HTTP Bearer security scheme for OpenAPI docs
security_scheme = HTTPBearer(
    scheme_name="Bearer",
    description="Clerk JWT token",
    auto_error=False,
)


def _handle_jwt_error(error: ClerkJWTError) -> HTTPException:
    """Convert ClerkJWTError to HTTPException with appropriate status."""
    if isinstance(error, TokenMissingError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": error.code,
                "message": error.message,
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif isinstance(error, TokenExpiredError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": error.code,
                "message": error.message,
            },
            headers={"WWW-Authenticate": 'Bearer error="invalid_token", error_description="Token has expired"'},
        )
    elif isinstance(error, SignatureVerificationError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": error.code,
                "message": error.message,
            },
            headers={"WWW-Authenticate": 'Bearer error="invalid_token", error_description="Invalid signature"'},
        )
    else:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": error.code,
                "message": error.message,
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    settings: Settings = Depends(get_settings),
) -> TokenClaims:
    """Get the current authenticated user from the request.

    This dependency validates the JWT token and returns the user claims.
    It supports two authentication methods:
    1. Direct JWT validation (for direct API calls)
    2. X-User-Id header (for calls through API gateway that already validated)

    Args:
        credentials: Bearer token from Authorization header.
        x_user_id: User ID from X-User-Id header (set by API gateway).
        settings: Application settings.

    Returns:
        TokenClaims with user information.

    Raises:
        HTTPException: 401 if authentication fails.
    """
    # Development mode: allow X-User-Id header bypass
    if settings.is_development and x_user_id:
        logger.debug("Using X-User-Id header for auth (dev mode)", user_id=x_user_id)
        return TokenClaims(
            user_id=x_user_id,
            email=f"{x_user_id}@dev.local",
        )

    # Production: require valid JWT
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "TOKEN_MISSING",
                "message": "Authorization header with Bearer token is required",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = verify_token(credentials.credentials)
        logger.debug(
            "User authenticated",
            user_id=claims.user_id,
            email=claims.email,
        )
        return claims

    except ClerkJWTError as e:
        logger.warning(
            "Authentication failed",
            error_code=e.code,
            error_message=e.message,
        )
        raise _handle_jwt_error(e)


async def get_current_user_or_none(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    settings: Settings = Depends(get_settings),
) -> TokenClaims | None:
    """Get the current user if authenticated, or None if not.

    Same as get_current_user but returns None instead of raising
    an exception when no valid authentication is provided.

    Args:
        credentials: Bearer token from Authorization header.
        x_user_id: User ID from X-User-Id header.
        settings: Application settings.

    Returns:
        TokenClaims if authenticated, None otherwise.
    """
    # Development mode: allow X-User-Id header
    if settings.is_development and x_user_id:
        return TokenClaims(
            user_id=x_user_id,
            email=f"{x_user_id}@dev.local",
        )

    if not credentials:
        return None

    try:
        return verify_token(credentials.credentials)
    except ClerkJWTError:
        return None


async def require_authenticated(
    user: Annotated[TokenClaims, Depends(get_current_user)],
) -> TokenClaims:
    """Dependency that requires authentication.

    This is an alias for get_current_user that makes the intent clearer
    in endpoint definitions.

    Args:
        user: The authenticated user from get_current_user.

    Returns:
        The authenticated user's claims.
    """
    return user


async def require_verified_email(
    user: Annotated[TokenClaims, Depends(get_current_user)],
) -> TokenClaims:
    """Dependency that requires authentication with verified email.

    Args:
        user: The authenticated user from get_current_user.

    Returns:
        The authenticated user's claims.

    Raises:
        HTTPException: 403 if email is not verified.
    """
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "EMAIL_NOT_VERIFIED",
                "message": "Email verification required for this action",
            },
        )
    return user


def require_org_role(allowed_roles: list[str]):
    """Create a dependency that requires specific organization role(s).

    Args:
        allowed_roles: List of allowed role names.

    Returns:
        FastAPI dependency function.

    Example:
        @router.get("/admin")
        async def admin_only(user: Annotated[TokenClaims, Depends(require_org_role(["admin"]))]):
            ...
    """

    async def _require_org_role(
        user: Annotated[TokenClaims, Depends(get_current_user)],
    ) -> TokenClaims:
        if not user.org_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "ORG_MEMBERSHIP_REQUIRED",
                    "message": "Organization membership required",
                },
            )

        if user.org_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSIONS",
                    "message": f"Required role: {', '.join(allowed_roles)}",
                },
            )

        return user

    return _require_org_role


# Type aliases for common auth patterns
CurrentUser = Annotated[TokenClaims, Depends(get_current_user)]
OptionalUser = Annotated[TokenClaims | None, Depends(get_current_user_or_none)]
AuthenticatedUser = Annotated[TokenClaims, Depends(require_authenticated)]
VerifiedUser = Annotated[TokenClaims, Depends(require_verified_email)]
