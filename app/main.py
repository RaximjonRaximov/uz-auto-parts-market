"""Uzbekistan Auto Parts Marketplace — FastAPI backend (modular)."""
from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.api.routes import api_router, robots_content, sitemap_content
from app.core.config import settings
from app.core.middleware import RateLimitMiddleware, SecurityHeadersMiddleware
from app.db import Base, engine, get_db
from app.seed import seed_all

# --- Create tables and seed sample data ---
Base.metadata.create_all(bind=engine)
seed_all()

app = FastAPI(
    title="Uzbekistan Auto Parts Marketplace",
    version="0.2.0",
    description="Modern, secure, SEO-optimized auto spare parts marketplace for Uzbekistan",
    docs_url=None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Content-Type-Options"],
    max_age=600,
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[h.strip() for h in settings.trusted_hosts.split(",") if h.strip()],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(api_router)


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok", "version": "0.2.0"}


@app.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
def robots_txt():
    return robots_content()


@app.get("/sitemap.xml", response_class=Response, include_in_schema=False)
def sitemap(db: Session = Depends(get_db)):
    xml = sitemap_content(db)
    return Response(content=xml, media_type="application/xml")


# --- Static frontend mount ---
static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists() and any(static_dir.iterdir()):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
