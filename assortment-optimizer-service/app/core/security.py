"""Security utilities for JWT verification."""

import time
from dataclasses import dataclass
from typing import Any

import httpx
import jwt
from jwt import PyJWKClient, PyJWKClientError
from jwt.exceptions import (
    DecodeError,
    ExpiredSignatureError,
    InvalidAudienceError,
    InvalidSignatureError,
    InvalidTokenError,
)

from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class JWKSCache:
    """Cache for JWKS keys with TTL."""

    keys: dict[str, Any] | None = None
    fetched_at: float = 0
    ttl_seconds: int = 3600  # 1 hour


# Global JWKS cache
_jwks_cache = JWKSCache()


class JWTError(Exception):
    """Base exception for JWT errors."""

    def __init__(self, message: str, code: str = "JWT_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class TokenMissingError(JWTError):
    """Raised when no token is provided."""

    def __init__(self, message: str = "Authorization token is required"):
        super().__init__(message, "TOKEN_MISSING")


class TokenExpiredError(JWTError):
    """Raised when token has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message, "TOKEN_EXPIRED")


class TokenInvalidError(JWTError):
    """Raised when token is invalid."""

    def __init__(self, message: str = "Invalid token"):
        super().__init__(message, "TOKEN_INVALID")


class SignatureVerificationError(JWTError):
    """Raised when token signature is invalid."""

    def __init__(self, message: str = "Invalid token signature"):
        super().__init__(message, "SIGNATURE_INVALID")


async def fetch_jwks(force_refresh: bool = False) -> dict[str, Any]:
    """Fetch JWKS from the configured endpoint with caching.

    Args:
        force_refresh: Force refresh even if cache is valid.

    Returns:
        JWKS keys dictionary.

    Raises:
        JWTError: If JWKS cannot be fetched.
    """
    global _jwks_cache
    settings = get_settings()

    current_time = time.time()
    cache_valid = (
        _jwks_cache.keys is not None
        and (current_time - _jwks_cache.fetched_at) < _jwks_cache.ttl_seconds
    )

    if cache_valid and not force_refresh:
        return _jwks_cache.keys

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                settings.jwt_jwks_url,
                timeout=10.0,
            )
            response.raise_for_status()
            jwks = response.json()

            _jwks_cache.keys = jwks
            _jwks_cache.fetched_at = current_time

            logger.info("JWKS fetched and cached successfully")
            return jwks

    except httpx.HTTPError as e:
        logger.error("Failed to fetch JWKS", error=str(e))
        # Return cached keys if available, even if expired
        if _jwks_cache.keys is not None:
            logger.warning("Using expired JWKS cache due to fetch failure")
            return _jwks_cache.keys
        raise JWTError(f"Failed to fetch JWKS: {str(e)}")


def get_jwk_client() -> PyJWKClient:
    """Get a PyJWKClient for the configured JWKS endpoint.

    Returns:
        Configured PyJWKClient instance.
    """
    settings = get_settings()
    return PyJWKClient(
        settings.jwt_jwks_url,
        cache_keys=True,
        lifespan=3600,  # Cache for 1 hour
    )


@dataclass
class TokenClaims:
    """Decoded JWT claims."""

    user_id: str
    session_id: str | None = None
    email: str | None = None
    email_verified: bool = False
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    image_url: str | None = None
    org_id: str | None = None
    org_role: str | None = None
    issued_at: int | None = None
    expires_at: int | None = None
    raw_claims: dict[str, Any] | None = None

    @classmethod
    def from_jwt_payload(cls, payload: dict[str, Any]) -> "TokenClaims":
        """Create TokenClaims from JWT payload.

        Args:
            payload: Decoded JWT payload dictionary.

        Returns:
            TokenClaims instance.
        """
        # Standard JWT 'sub' claim for user_id
        user_id = payload.get("sub", "")

        # Session ID is in 'sid'
        session_id = payload.get("sid")

        # Email might be in different places
        email = payload.get("email") or payload.get("email_address")
        email_verified = payload.get("email_verified", False)

        # User metadata
        first_name = payload.get("first_name")
        last_name = payload.get("last_name")
        full_name = payload.get("name") or payload.get("full_name")
        image_url = payload.get("image_url") or payload.get("picture")

        # Organization claims
        org_id = payload.get("org_id")
        org_role = payload.get("org_role")

        # Standard JWT claims
        issued_at = payload.get("iat")
        expires_at = payload.get("exp")

        return cls(
            user_id=user_id,
            session_id=session_id,
            email=email,
            email_verified=email_verified,
            first_name=first_name,
            last_name=last_name,
            full_name=full_name,
            image_url=image_url,
            org_id=org_id,
            org_role=org_role,
            issued_at=issued_at,
            expires_at=expires_at,
            raw_claims=payload,
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "email": self.email,
            "email_verified": self.email_verified,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "image_url": self.image_url,
            "org_id": self.org_id,
            "org_role": self.org_role,
        }


def verify_token(token: str) -> TokenClaims:
    """Verify a JWT token and extract claims.

    Args:
        token: JWT token string (without 'Bearer ' prefix).

    Returns:
        TokenClaims with verified user information.

    Raises:
        TokenMissingError: If token is empty.
        TokenExpiredError: If token has expired.
        SignatureVerificationError: If signature is invalid.
        TokenInvalidError: For other validation errors.
    """
    if not token:
        raise TokenMissingError()

    settings = get_settings()

    try:
        # Get the signing key from JWKS
        jwk_client = get_jwk_client()
        signing_key = jwk_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "require": ["sub", "exp", "iat"],
            },
        )

        # Extract claims
        claims = TokenClaims.from_jwt_payload(payload)

        if not claims.user_id:
            raise TokenInvalidError("Token missing user ID (sub claim)")

        logger.debug(
            "Token verified successfully",
            user_id=claims.user_id,
            session_id=claims.session_id,
        )

        return claims

    except ExpiredSignatureError:
        logger.warning("Token expired")
        raise TokenExpiredError()

    except InvalidSignatureError:
        logger.warning("Invalid token signature")
        raise SignatureVerificationError()

    except InvalidAudienceError as e:
        logger.warning("Invalid token audience", error=str(e))
        raise TokenInvalidError(f"Invalid audience: {str(e)}")

    except PyJWKClientError as e:
        logger.error("Failed to get signing key", error=str(e))
        raise TokenInvalidError(f"Failed to verify token: {str(e)}")

    except DecodeError as e:
        logger.warning("Token decode error", error=str(e))
        raise TokenInvalidError(f"Invalid token format: {str(e)}")

    except InvalidTokenError as e:
        logger.warning("Token validation error", error=str(e))
        raise TokenInvalidError(str(e))

    except Exception as e:
        logger.error("Unexpected error during token verification", error=str(e))
        raise TokenInvalidError(f"Token verification failed: {str(e)}")


def verify_token_from_header(authorization: str | None) -> TokenClaims:
    """Verify token from Authorization header.

    Args:
        authorization: Full Authorization header value (e.g., 'Bearer xxx').

    Returns:
        TokenClaims with verified user information.

    Raises:
        TokenMissingError: If header is missing or malformed.
        TokenExpiredError: If token has expired.
        SignatureVerificationError: If signature is invalid.
        TokenInvalidError: For other validation errors.
    """
    if not authorization:
        raise TokenMissingError("Authorization header is required")

    if not authorization.startswith("Bearer "):
        raise TokenInvalidError("Authorization header must use Bearer scheme")

    token = authorization[7:]  # Remove 'Bearer ' prefix

    if not token:
        raise TokenMissingError("Token is empty")

    return verify_token(token)


def extract_user_id_from_header(
    authorization: str | None = None,
    x_user_id: str | None = None,
) -> str | None:
    """Extract user ID from headers (auth token or X-User-Id).

    This is a convenience function that tries multiple sources.

    Args:
        authorization: Authorization header value.
        x_user_id: X-User-Id header value (from API gateway).

    Returns:
        User ID string or None if not found.
    """
    # First try X-User-Id (set by API gateway after validation)
    if x_user_id:
        return x_user_id

    # Then try to extract from token
    if authorization:
        try:
            claims = verify_token_from_header(authorization)
            return claims.user_id
        except JWTError:
            pass

    return None
