"""
Liveness endpoint.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is healthy"})


__all__ = [
    "health_check",
]
