"""Authentication endpoints for testing and user info."""

from fastapi import APIRouter

from app.core.auth import CurrentUser, OptionalUser
from app.core.security import TokenClaims
from app.schemas.common import BaseSchema

router = APIRouter()


class UserInfoResponse(BaseSchema):
    """Response schema for user info endpoint."""

    user_id: str
    email: str | None = None
    email_verified: bool = False
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    image_url: str | None = None
    org_id: str | None = None
    org_role: str | None = None
    authenticated: bool = True


class AuthStatusResponse(BaseSchema):
    """Response schema for auth status check."""

    authenticated: bool
    user: UserInfoResponse | None = None


@router.get("/me", response_model=UserInfoResponse)
async def get_current_user_info(user: CurrentUser) -> UserInfoResponse:
    """Get information about the currently authenticated user.

    This endpoint requires authentication and returns the user's
    profile information extracted from the JWT token.

    Returns:
        User profile information.
    """
    return UserInfoResponse(
        user_id=user.user_id,
        email=user.email,
        email_verified=user.email_verified,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        image_url=user.image_url,
        org_id=user.org_id,
        org_role=user.org_role,
        authenticated=True,
    )


@router.get("/status", response_model=AuthStatusResponse)
async def check_auth_status(user: OptionalUser) -> AuthStatusResponse:
    """Check authentication status.

    This endpoint does not require authentication. It returns
    whether the request is authenticated and user info if so.

    Returns:
        Authentication status and optional user info.
    """
    if user is None:
        return AuthStatusResponse(
            authenticated=False,
            user=None,
        )

    return AuthStatusResponse(
        authenticated=True,
        user=UserInfoResponse(
            user_id=user.user_id,
            email=user.email,
            email_verified=user.email_verified,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            image_url=user.image_url,
            org_id=user.org_id,
            org_role=user.org_role,
            authenticated=True,
        ),
    )


@router.get("/protected")
async def protected_endpoint(user: CurrentUser) -> dict:
    """Example protected endpoint that requires authentication.

    This endpoint demonstrates how to protect routes and access
    user information from the authenticated token.

    Returns:
        A message confirming authentication with user ID.
    """
    return {
        "message": "You are authenticated!",
        "user_id": user.user_id,
        "email": user.email,
    }


@router.get("/public")
async def public_endpoint() -> dict:
    """Example public endpoint that does not require authentication.

    This endpoint is accessible to everyone, authenticated or not.

    Returns:
        A simple greeting message.
    """
    return {
        "message": "This endpoint is public and accessible to everyone.",
    }
