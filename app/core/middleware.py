"""HTTP middlewares for security headers and rate limiting."""
from __future__ import annotations

import time
from typing import Dict, List

from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response.headers["Content-Security-Policy"] = csp
        response.headers["X-Content-Security-Policy"] = csp
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    _storage: Dict[str, List[float]] = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.headers.get("x-forwarded-for", request.client.host or "unknown").split(",")[0].strip()
        now = time.time()
        window = self._storage.setdefault(client_ip, [])
        cutoff = now - settings.rate_window
        # Keep only requests inside the window
        window[:] = [t for t in window if t > cutoff]

        if len(window) >= settings.rate_limit:
            raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")

        window.append(now)
        return await call_next(request)
