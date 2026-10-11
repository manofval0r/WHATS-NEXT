"""
Reusable DRF permissions.

The bug this exists to prevent
------------------------------
``CommunityPostViewSet`` and ``CommunityReplyViewSet`` both used
``ModelViewSet`` with ``get_queryset() -> CommunityPost.objects.all()`` and
no object-level permission. That made ``PATCH``, ``PUT`` and ``DELETE``
available on *every* post and reply by any authenticated user: the write
path was inherited straight from ``get_queryset()``, which was not scoped to
the author.

``IsAuthorOrReadOnly`` closes that at the permission layer, and the
ViewSets additionally scope writes in ``get_queryset()`` so the fix does not
rest on a single mechanism.
"""

from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Only the author may modify or delete; anyone authenticated may read."""

    message = "You can only edit or delete your own posts."

    def has_object_permission(self, request, view, obj):
        # Safe methods need no ownership check.
        if request.method in permissions.SAFE_METHODS:
            return True

        author_id = getattr(obj, "author_id", None)
        return author_id == getattr(request.user, "pk", None)


class IsSelfOrReadOnly(permissions.BasePermission):
    """Account-scoped variant: a user may only write to their own record."""

    message = "You can only modify your own data."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_id = getattr(obj, "user_id", getattr(obj, "pk", None))
        return owner_id == getattr(request.user, "pk", None)