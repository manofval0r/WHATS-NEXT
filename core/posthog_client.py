"""
PostHog server-side analytics helper
=====================================
Thin wrapper around the ``posthog`` SDK.  All methods silently no-op when
``settings.POSTHOG_API_KEY`` is empty — safe for local dev without a PostHog
account.

Usage::

    from core.posthog_client import ph_capture, ph_identify
    ph_capture(user, 'onboarding_completed', {'role': 'fullstack'})
"""

from __future__ import annotations
import logging
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

_client = None          # lazily initialised on first call
_disabled = None        # cached "is PostHog configured?" check


def _get_client():
    """Lazily initialise the PostHog client (or mark disabled)."""
    global _client, _disabled

    if _disabled is not None:
        return _client          # already resolved

    api_key = getattr(settings, 'POSTHOG_API_KEY', '')
    host = getattr(settings, 'POSTHOG_HOST', 'https://us.i.posthog.com')

    if not api_key:
        _disabled = True
        logger.info('[PostHog] No API key — analytics disabled.')
        return None

    try:
        from posthog import Posthog
        _client = Posthog(api_key, host=host)
        _disabled = False
        logger.info('[PostHog] Client initialised (host=%s).', host)
    except Exception as exc:
        _disabled = True
        logger.warning('[PostHog] Failed to init: %s', exc)

    return _client


def _distinct_id(user) -> str:
    """Return a stable distinct-id string for a Django User."""
    return str(user.pk)


def ph_capture(user, event: str, properties: dict[str, Any] | None = None) -> None:
    """
    Capture a named event for a user.

    :param user:       Django ``User`` instance
    :param event:      e.g. ``'onboarding_completed'``
    :param properties:  arbitrary key–value pairs
    """
    client = _get_client()
    if client is None:
        return

    try:
        client.capture(
            distinct_id=_distinct_id(user),
            event=event,
            properties=properties or {},
        )
    except Exception as exc:
        logger.warning('[PostHog] capture failed: %s', exc)


def ph_identify(user, traits: dict[str, Any] | None = None) -> None:
    """
    Identify a user and set / update person properties.

    Call once on registration or when profile traits change.
    """
    client = _get_client()
    if client is None:
        return

    person_props = {
        'email': getattr(user, 'email', ''),
        'username': getattr(user, 'username', ''),
        'plan_tier': getattr(user, 'plan_tier', 'FREE'),
        'target_career': getattr(user, 'target_career', ''),
    }
    if traits:
        person_props.update(traits)

    try:
        client.identify(
            distinct_id=_distinct_id(user),
            properties=person_props,
        )
    except Exception as exc:
        logger.warning('[PostHog] identify failed: %s', exc)


def ph_feature_flag(user, flag_key: str) -> bool | str | None:
    """
    Evaluate a PostHog feature flag for a user.

    Returns the flag value (bool / string variant), or ``None`` when
    PostHog is not configured.
    """
    client = _get_client()
    if client is None:
        return None

    try:
        return client.feature_enabled(flag_key, _distinct_id(user))
    except Exception as exc:
        logger.warning('[PostHog] feature_flag failed: %s', exc)
        return None
