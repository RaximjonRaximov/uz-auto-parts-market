"""Pytest configuration and shared fixtures."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_autoparts.db")
os.environ.setdefault("TRUSTED_HOSTS", "localhost,127.0.0.1,testserver")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    """Shared FastAPI test client."""
    with TestClient(app) as c:
        yield c
