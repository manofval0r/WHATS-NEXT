"""
Minimal compatibility shim for the removed `cgi` stdlib module on Python 3.13+.

This file provides a very small subset of the original `cgi` API that
third-party packages (notably `feedparser`) call at import/runtime.

Intended only as a short-term developer convenience so the project can
run on Python versions where `cgi` was removed. For production / long-term
use, prefer running the project on a supported Python version (3.11 or 3.12)
or upgrade/remove packages that rely on `cgi`.
"""
from typing import Tuple, Dict

def parse_header(value: str) -> Tuple[str, Dict[str, str]]:
    """Parse a MIME header like Content-Type into (main, params dict).

    This mirrors the behaviour of the old `cgi.parse_header` closely enough
    for simple header parsing used by feedparser and similar libraries.
    """
    if not value:
        return "", {}

    parts = value.split(";")
    main = parts[0].strip()
    params: Dict[str, str] = {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            k = k.strip().lower()
            v = v.strip().strip('"')
            params[k] = v
    return main, params


# Very small subset of other helpers that sometimes get referenced.
def escape(s: str) -> str:
    """Escape HTML special characters (replacement for `cgi.escape`).

    Note: `cgi.escape` was removed/deprecated; this simple implementation
    is only used in a few libraries and is intentionally minimal.
    """
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# Provide a placeholder FieldStorage class in case some code imports it.
class FieldStorage:
    def __init__(self, *args, **kwargs):
        raise RuntimeError("FieldStorage is not supported in this compatibility shim; use a supported Python version")
