"""Security helpers for input sanitization and escaping."""
from __future__ import annotations

import re
from typing import Optional


def _sanitize(s: Optional[str], max_len: int = 200) -> Optional[str]:
    if s is None:
        return None
    s = s.strip()
    if len(s) > max_len:
        s = s[:max_len]
    return s


def _clean_html(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    # Strip angle brackets and quotes to prevent HTML/JS injection.
    return re.sub(r"[<>\"']", "", s)


def escape_like(s: str) -> str:
    """Escape SQL LIKE wildcards so users cannot inject broad wildcards."""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def sanitize_q(q: Optional[str]) -> Optional[str]:
    if not q:
        return None
    q = q.strip()
    if len(q) > 100:
        q = q[:100]
    return q
