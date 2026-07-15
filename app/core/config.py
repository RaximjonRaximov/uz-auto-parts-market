"""Application settings and constants."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Loads config from environment / .env file."""

    database_url: str = "sqlite:///./autoparts.db"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173,http://localhost:8000,http://localhost:9000"
    trusted_hosts: str = "localhost,127.0.0.1,*.devinapps.com,*.loca.lt"
    site_url: str = "https://uzautoparts.uz"
    rate_limit: int = 120  # requests per window
    rate_window: int = 60  # seconds
    secret_key: str = "change-me-in-production-please-32chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Payment gateway placeholders (set real credentials in production)
    payme_merchant_id: Optional[str] = None
    click_service_id: Optional[str] = None
    click_merchant_id: Optional[str] = None
    uzum_service_id: Optional[str] = None
    payment_return_url: str = "https://uzautoparts.uz/payment/success"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
