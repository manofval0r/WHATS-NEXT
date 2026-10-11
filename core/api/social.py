"""
Following and friends progress.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request):
    """Follow another user."""
    username = request.data.get('username', '').strip()
    if not username:
        return Response({"error": "Username is required"}, status=400)

    target = User.objects.filter(username=username).first()
    if not target:
        return Response({"error": "User not found"}, status=404)
    if target == request.user:
        return Response({"error": "You can't follow yourself"}, status=400)

    _, created = UserFollowing.objects.get_or_create(follower=request.user, following=target)
    if not created:
        return Response({"message": "Already following"}, status=200)
    return Response({"message": f"Now following {username}"}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfollow_user(request):
    """Unfollow a user."""
    username = request.data.get('username', '').strip()
    if not username:
        return Response({"error": "Username is required"}, status=400)

    target = User.objects.filter(username=username).first()
    if not target:
        return Response({"error": "User not found"}, status=404)

    deleted, _ = UserFollowing.objects.filter(follower=request.user, following=target).delete()
    if not deleted:
        return Response({"error": "Not following this user"}, status=400)
    return Response({"message": f"Unfollowed {username}"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_following(request):
    """Get list of users the current user follows."""
    following = UserFollowing.objects.filter(follower=request.user).select_related('following')
    return Response([
        {
            "username": f.following.username,
            "avatar_seed": str(f.following.avatar_seed),
            "target_career": f.following.target_career,
            "followed_at": f.created_at,
        }
        for f in following
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_followers(request):
    """Get list of users who follow the current user."""
    followers = UserFollowing.objects.filter(following=request.user).select_related('follower')
    return Response([
        {
            "username": f.follower.username,
            "avatar_seed": str(f.follower.avatar_seed),
            "target_career": f.follower.target_career,
            "followed_at": f.created_at,
        }
        for f in followers
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends_progress(request):
    """
    Get roadmap progress of users the current user follows.
    Used for the 'friends overlay' on the roadmap graph.
    """
    following_ids = UserFollowing.objects.filter(
        follower=request.user
    ).values_list('following_id', flat=True)

    friends = User.objects.filter(id__in=following_ids)
    progress_data = []

    for friend in friends:
        items = UserRoadmapItem.objects.filter(user=friend)
        total = items.count()
        completed = items.filter(status='completed').count()
        active_module = items.filter(status='active').first()

        progress_data.append({
            "username": friend.username,
            "avatar_seed": str(friend.avatar_seed),
            "total_modules": total,
            "completed_modules": completed,
            "active_module": active_module.label if active_module else None,
            "active_step_order": active_module.step_order if active_module else None,
        })

    return Response(progress_data)


__all__ = [
    "follow_user",
    "get_followers",
    "get_following",
    "get_friends_progress",
    "unfollow_user",
]
