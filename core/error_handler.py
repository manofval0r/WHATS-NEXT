"""
Central DRF exception handling.

Replaces DRF's default handler so that:

1. Internal failures never leak stack traces, absolute file paths, SQL,
   or upstream API responses to an unauthenticated caller. Previously
   several views returned ``traceback.format_exc()`` in the response body.
2. DRF's own 400/401/403/404/405 responses keep their shape, so the
   frontend's existing error handling still works.
3. Unexpected exceptions return a generic 500 with a correlation id, and
   the detail is logged server-side where it belongs.

Wired up via ``EXCEPTION_HANDLER`` in settings.
"""

import logging
import uuid

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)

# Map of internal exception class -> (http status, stable machine-readable code)
_INTERNAL_ERRORS = (
    (IntegrityError, status.HTTP_400_BAD_REQUEST, "conflict"),
    (Http404, status.HTTP_404_NOT_FOUND, "not_found"),
    (ObjectDoesNotExist, status.HTTP_404_NOT_FOUND, "not_found"),
    (PermissionDenied, status.HTTP_403_FORBIDDEN, "forbidden"),
    (DjangoValidationError, status.HTTP_400_BAD_REQUEST, "invalid"),
)


def _correlation_id(request):
    """Reuse an inbound correlation id if present, else mint one."""
    existing = getattr(request, "correlation_id", None)
    if existing:
        return existing
    cid = uuid.uuid4().hex[:12]
    try:
        request.correlation_id = cid
    except AttributeError:  # pragma: no cover - some test request doubles are immutable
        pass
    return cid


def api_exception_handler(exc, context):
    """
    DRF exception handler that never leaks internals to the client.

    Signature matches ``rest_framework.views.exception_handler`` so it can be
    dropped in via ``REST_FRAMEWORK['EXCEPTION_HANDLER']``.
    """
    request = context.get("request") if context else None
    cid = _correlation_id(request) if request is not None else uuid.uuid4().hex[:12]

    # Let DRF handle everything it knows about first. Its responses are
    # already safe to serialise (they use the exception's own detail).
    response = drf_exception_handler(exc, context)
    if response is not None:
        if isinstance(exc, (exceptions.APIException, Http404, PermissionDenied)):
            return response
        # DRF only claims exceptions it recognises; anything reaching here
        # that it still rendered came from a non-API exception.
        response.data = {"error": _public_message(exc), "code": "error", "correlation_id": cid}
        return response

    # Not a DRF exception. Translate the Django-level ones we can describe
    # in terms the client can act on.
    for exc_type, code, machine_code in _INTERNAL_ERRORS:
        if isinstance(exc, exc_type):
            logger.info(
                "%s on %s %s (correlation_id=%s)",
                exc_type.__name__,
                getattr(request, "method", "?"),
                getattr(request, "path", "?"),
                cid,
            )
            return Response(
                {"error": _public_message(exc), "code": machine_code, "correlation_id": cid},
                status=code,
            )

    # Genuinely unexpected. Log everything, return nothing useful.
    logger.exception(
        "Unhandled exception on %s %s (correlation_id=%s)",
        getattr(request, "method", "?"),
        getattr(request, "path", "?"),
        cid,
        exc_info=exc,
    )
    return Response(
        {
            "error": "Something went wrong on our end.",
            "code": "server_error",
            "correlation_id": cid,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _public_message(exc):
    """A message safe to hand to a client, for known exception types."""
    if isinstance(exc, IntegrityError):
        # Almost always a duplicate on submit (unique_together) or a bad FK.
        # Never echo the driver's message: it leaks table and column names.
        return "That already exists, or references something that no longer does."
    if isinstance(exc, Http404):
        return "Not found."
    if isinstance(exc, ObjectDoesNotExist):
        return "Not found."
    if isinstance(exc, PermissionDenied):
        return "You do not have permission to do that."
    if isinstance(exc, DjangoValidationError):
        messages = getattr(exc, "messages", None)
        if messages:
            return "; ".join(str(m) for m in messages)
        return "That input was not valid."
    return "Something went wrong on our end."