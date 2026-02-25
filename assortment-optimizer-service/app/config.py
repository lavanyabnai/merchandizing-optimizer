"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Assortment Optimizer"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = Field(default="development", description="Environment name")

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1

    # CORS - stored as comma-separated string to avoid JSON parsing issues
    cors_origins_str: str = Field(
        default="http://localhost:3000",
        description="Allowed CORS origins (comma-separated)",
        alias="cors_origins",
    )

    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/assortment_optimizer",
        description="PostgreSQL connection URL",
    )
    database_pool_size: int = Field(default=5, ge=1, le=50)
    database_max_overflow: int = Field(default=10, ge=0, le=100)

    # Redis
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL",
    )
    redis_ttl_default: int = Field(default=3600, description="Default cache TTL in seconds")

    # Authentication (Clerk)
    clerk_secret_key: str = Field(default="", description="Clerk secret key")
    clerk_publishable_key: str = Field(default="", description="Clerk publishable key")
    clerk_jwks_url: str = Field(
        default="https://api.clerk.com/v1/jwks",
        description="Clerk JWKS URL",
    )

    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: str = Field(default="json", description="Log format: json or text")

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, description="Requests per window")
    rate_limit_window: int = Field(default=60, description="Window in seconds")

    # Sentry Error Tracking
    sentry_dsn: str = Field(default="", description="Sentry DSN for error tracking")
    sentry_traces_sample_rate: float = Field(
        default=0.1, ge=0.0, le=1.0, description="Sentry traces sample rate"
    )
    sentry_profiles_sample_rate: float = Field(
        default=0.1, ge=0.0, le=1.0, description="Sentry profiles sample rate"
    )

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
