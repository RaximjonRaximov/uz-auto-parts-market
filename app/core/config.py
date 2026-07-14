"""Application settings and constants."""
from __future__ import annotations

from pathlib import Path

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

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
