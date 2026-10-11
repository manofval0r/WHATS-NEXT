"""
Guest session tokens for JADA.

The vulnerability this closes
-----------------------------
Guest chat sessions were identified by a bare UUID supplied by the client and
echoed straight back in the response. That meant:

* any guest who learned another guest's ``session_id`` could read that
  conversation's full history by asking JADA to repeat it, and could inject
  messages into it -- the lookup was ``filter(id=..., session_id=...,
  user__isnull=True)`` and both halves were attacker-supplied;
* the 20-message guest cap was only evaluated ``if conversation_id:``,
  so omitting that field minted a fresh conversation every call and the
  limit was unreachable by construction;
* ``POST /api/jada/claim-guest/`` let any authenticated user attach any
  guest session to their account given only the UUID.

Why signing fixes it
--------------------
The UUID alone is the secret, and a UUID is only 122 bits of entropy that
was being carried in plaintext through browser storage and URLs. Signing
turns it into a value the client cannot manufacture: it carries an HMAC over
the session id and an expiry, verified with ``django.core.signing``. A
forged or edited token fails verification and is refused, and tokens expire.

The raw UUID is never returned to the client at all.
"""

from __future__ import annotations

import uuid

from django.core import signing
from django.core.signing import BadSignature, SignatureExpired

# Bump the salt to invalidate every outstanding guest token.
_SALT = "whats-next.jada.guest.v1"

# Guest sessions are short-lived by design: the point is to let someone try
# the tutor before signing up, not to hand out a durable credential.
DEFAULT_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


def issue_session(*, max_age: int = DEFAULT_MAX_AGE) -> str:
    """
    Mint a new signed guest token wrapping a fresh UUID.

    The returned string is opaque and unforgeable. The UUID is stored on
    ``JadaConversation.session_id``; only this signed form reaches the client.
    """
    raw = uuid.uuid4()
    return signing.dumps({"sid": str(raw)}, salt=_SALT, compress=True)


def sign_session(session_id, *, max_age: int = DEFAULT_MAX_AGE) -> str:
    """
    Wrap an existing session UUID in a fresh signed token.

    Used when handing a token back to a client that already has a session,
    e.g. on every guest chat response, so the raw UUID never leaves the server.
    """
    return signing.dumps({"sid": str(session_id)}, salt=_SALT, compress=True)


def verify_session(token: str | None, *, max_age: int = DEFAULT_MAX_AGE) -> str | None:
    """
    Return the raw session UUID for a valid token, else None.

    None means invalid, expired or forged. Callers must treat it as
    unauthenticated rather than falling back to a client-supplied value.
    """
    if not token or not isinstance(token, str):
        return None

    try:
        data = signing.loads(token, salt=_SALT, max_age=max_age)
    except SignatureExpired:
        return None
    except BadSignature:
        return None

    sid = data.get("sid")
    if not sid:
        return None

    try:
        return str(uuid.UUID(str(sid)))
    except (ValueError, AttributeError, TypeError):
        return None


def looks_like_token(value: str | None) -> bool:
    """
    True when a client is sending an unsigned legacy UUID.

    Used to return a clear 401 instead of silently treating the request as a
    brand new session, so upgrading the client is diagnosable.
    """
    if not value or not isinstance(value, str):
        return False
    try:
        uuid.UUID(value)
    except (ValueError, AttributeError, TypeError):
        return False
    return True