"""
Project feed, peer review, comments, Q&A and the leaderboard.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

class CommunityPostViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityPostSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags__name']
    ordering_fields = ['created_at', 'upvotes', 'view_count']

    #: Writes are scoped to the author's own posts. Without this,
    #: ``get_queryset`` handed every post in the table to ``update`` and
    #: ``destroy``, and any logged-in user could rewrite or delete anyone
    #: else's post.
    WRITE_ACTIONS = {'update', 'partial_update', 'destroy'}

    def get_queryset(self):
        queryset = CommunityPost.objects.all().select_related(
            'author', 'attached_module'
        ).prefetch_related('replies', 'tags')

        if self.action in self.WRITE_ACTIONS:
            queryset = queryset.filter(author=self.request.user)

        # Filter by type
        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)

        # Filter by module
        module_id = self.request.query_params.get('module_id')
        if module_id:
            queryset = queryset.filter(attached_module_id=module_id)

        # Filter by tag. ``tags`` is now a real M2M on the post, so this
        # filter actually matches -- previously ``post.tags`` did not exist.
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__name=tag)

        # Filter by solved status
        solved = self.request.query_params.get('solved')
        if solved:
            queryset = queryset.filter(is_solved=solved.lower() == 'true')

        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        # Ledger, not a counter bump: the leaderboard now sorts a sum over
        # events, so this is idempotent and visible in the breakdown.
        xp_award(self.request.user, "community_post", reference=f"post:{post.id}")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic view count increment
        CommunityPost.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        post = self.get_object()
        user = request.user

        # The old get/delete/create sequence was three unsynchronised
        # statements: two concurrent requests from the same user could both
        # observe the vote, both delete, and both decrement -- leaving
        # ``upvotes`` permanently one lower than the real vote count.
        with transaction.atomic():
            post = CommunityPost.objects.select_for_update().get(pk=post.pk)
            existing = PostVote.objects.filter(user=user, post=post).first()
            if existing:
                existing.delete()
                CommunityPost.objects.filter(pk=post.pk).update(
                    upvotes=Greatest(F('upvotes') - 1, 0)
                )
                voted = False
            else:
                PostVote.objects.create(user=user, post=post, vote_type='post')
                CommunityPost.objects.filter(pk=post.pk).update(
                    upvotes=F('upvotes') + 1
                )
                voted = True

        post.refresh_from_db()
        return Response({'upvotes': post.upvotes, 'voted': voted})

    @action(detail=True, methods=['post'], url_path='mark-solved')
    def mark_solved(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user:
            return Response({'error': 'Only author can mark as solved'}, status=403)

        post.is_solved = not post.is_solved
        post.save()
        return Response({'is_solved': post.is_solved})

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        post = self.get_object()
        replies = post.replies.all().order_by('created_at')
        serializer = CommunityReplySerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)


class CommunityReplyViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityReplySerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]

    WRITE_ACTIONS = {'update', 'partial_update', 'destroy'}

    def get_queryset(self):
        queryset = CommunityReply.objects.all().select_related('author', 'post')

        # Same defect as the post ViewSet: writes must be scoped to the
        # author, or any authenticated user can edit or delete any reply.
        if self.action in self.WRITE_ACTIONS:
            queryset = queryset.filter(author=self.request.user)

        post_id = self.request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id)

        return queryset

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        post = get_object_or_404(CommunityPost, id=post_id)
        reply = serializer.save(author=self.request.user, post=post)

        CommunityPost.objects.filter(pk=post.pk).update(reply_count=F('reply_count') + 1)
        xp_award(self.request.user, "community_reply", reference=f"reply:{reply.id}")

        try:
            from core.email_tasks import send_reply_notification_email

            send_reply_notification_email.delay(reply.id)
        except Exception:  # noqa: BLE001
            logger.warning("could not dispatch reply notification", exc_info=True)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        reply = self.get_object()
        user = request.user

        # Serialised against concurrent requests from the same user; see the
        # equivalent comment on CommunityPostViewSet.upvote.
        with transaction.atomic():
            reply = CommunityReply.objects.select_for_update().get(pk=reply.pk)
            existing = PostVote.objects.filter(user=user, reply=reply).first()
            if existing:
                existing.delete()
                CommunityReply.objects.filter(pk=reply.pk).update(
                    upvotes=Greatest(F('upvotes') - 1, 0)
                )
                voted = False
            else:
                PostVote.objects.create(user=user, reply=reply, vote_type='reply')
                CommunityReply.objects.filter(pk=reply.pk).update(
                    upvotes=F('upvotes') + 1
                )
                voted = True

        reply.refresh_from_db()
        return Response({'upvotes': reply.upvotes, 'voted': voted})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        reply = self.get_object()
        if reply.post.author != request.user:
            return Response({'error': 'Only post author can accept answer'}, status=403)

        # Toggle acceptance
        reply.is_accepted = not reply.is_accepted
        reply.save()

        # If accepted, mark post as solved
        if reply.is_accepted:
            reply.post.is_solved = True
            reply.post.save()

        return Response({'is_accepted': reply.is_accepted})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_community_feed(request):
    """
    Returns recent project submissions from OTHER users.
    """
    user = request.user

    recent_subs = (
        UserRoadmapItem.objects
        .filter(status='completed', project_submission_link__isnull=False)
        .exclude(user=user)
        .select_related('user')
        .order_by('-submitted_at')[:20]
    )

    # One query for every vote this user has cast on the page, instead of one
    # per row. The previous loop cost 1 + N + N queries.
    my_votes = {
        r.submission_id: r.vote_type
        for r in ProjectReview.objects.filter(
            submission__in=[item.id for item in recent_subs],
            reviewer=user,
        )
    }

    feed_data = []
    for item in recent_subs:
        submitted = item.submitted_at or item.created_at
        feed_data.append({
            "id": item.id,
            "username": item.user.username,
            "career": item.user.target_career,
            "module": item.label,
            "link": item.project_submission_link,
            "verifications": item.verification_count,
            "user_vote": my_votes.get(item.id),
            "date": submitted.strftime("%d %b") if submitted else "",
        })

    return Response(feed_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_project(request, item_id):
    """
    Toggle upvote/downvote on a submitted project.

    Three defects fixed here:

    1. **Unscoped target.** ``get_object_or_404(UserRoadmapItem, id=item_id)``
       accepted any id, so a user could upvote a locked, never-submitted or
       private module belonging to anyone -- inflating their reputation and
       confirming that their roadmap exists.
    2. **Unbounded reputation.** ``+10`` was granted on creation but never
       withdrawn, so upvote -> toggle off -> upvote again paid out forever.
       Two accounts could farm each other with no cap and no cooldown.
    3. **Clobbering write.** ``item.save()`` wrote the whole row, including
       a stale ``status``/``github_score`` read before the count query, so a
       concurrent ``submit_project`` could be silently reverted.
    """
    user = request.user

    item = get_object_or_404(
        UserRoadmapItem.objects.select_related('user'),
        id=item_id,
        status='completed',
    )
    if not item.project_submission_link:
        raise Http404("No such project.")

    # Respect the owner's privacy choice.
    if item.user_id != user.pk and item.user.profile_visibility == 'private':
        raise Http404("No such project.")

    vote_type = request.data.get('vote_type', 'up')
    if vote_type not in ['up', 'down']:
        return Response({"error": "Invalid vote type"}, status=400)

    if item.user_id == user.pk:
        return Response({"error": "Cannot verify your own work"}, status=400)

    rep_delta = 0
    action = 'created'

    with transaction.atomic():
        locked = UserRoadmapItem.objects.select_for_update().get(pk=item.pk)

        review, created = ProjectReview.objects.get_or_create(
            submission=locked,
            reviewer=user,
            defaults={'vote_type': vote_type},
        )

        if not created:
            if review.vote_type == vote_type:
                # Toggle off -- and claw the reputation back.
                review.delete()
                action = 'removed'
                if vote_type == 'up':
                    rep_delta = -10
            else:
                # Change vote -- settle the old one and pay the new one.
                old = review.vote_type
                review.vote_type = vote_type
                review.save(update_fields=['vote_type'])
                action = 'changed'
                if old == 'up':
                    rep_delta -= 10
                if vote_type == 'up':
                    rep_delta += 10
        elif vote_type == 'up':
            rep_delta = 10

        if rep_delta:
            User.objects.filter(pk=locked.user_id).update(
                reputation_score=F('reputation_score') + rep_delta
            )

        # Recompute from the rows, then write only the counter -- not the
        # whole row, so a concurrent submit_project is not reverted.
        upvotes = ProjectReview.objects.filter(submission=locked, vote_type='up').count()
        downvotes = ProjectReview.objects.filter(submission=locked, vote_type='down').count()
        new_count = upvotes - downvotes
        UserRoadmapItem.objects.filter(pk=locked.pk).update(verification_count=new_count)

    return Response({
        "message": f"Vote {action}",
        "new_count": new_count,
        "user_vote": vote_type if action != 'removed' else None,
    })


def _get_commentable_project(user, project_id):
    """
    Resolve a roadmap item that the given user is allowed to comment on.

    A module is commentable when it is the caller's own, or when its owner
    has published it -- i.e. completed it, submitted a project, and not set
    their profile to private. Anything else is invisible, and
    ``get_object_or_404`` returns 404 rather than 403 so the endpoint does
    not confirm that an id exists.
    """
    project = get_object_or_404(UserRoadmapItem.objects.select_related('user'), id=project_id)

    if project.user_id == user.pk:
        return project

    owner = project.user
    if (
        project.status != 'completed'
        or not project.project_submission_link
        or owner.profile_visibility == 'private'
    ):
        raise Http404("No such project.")

    return project


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_comments(request, project_id):
    """
    Get all comments for a project.

    Scoped to projects that are actually published. The previous version
    did ``get_object_or_404(UserRoadmapItem, id=project_id)`` with no
    ownership or visibility filter, so any authenticated user could
    enumerate ids and read the comment thread on another user's locked,
    never-submitted, or explicitly private modules.
    """
    project = _get_commentable_project(request.user, project_id)
    comments = ProjectComment.objects.filter(project=project).select_related('author')
    serializer = ProjectCommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, project_id):
    """Create a new comment on a project."""
    # Same scoping as the read path -- posting into someone else's private
    # module was equally reachable before.
    project = _get_commentable_project(request.user, project_id)

    text = request.data.get('text', '').strip()
    if not text or len(text) > 2000:
        return Response({"error": "Comment must be 1-2000 characters"}, status=400)

    comment = ProjectComment.objects.create(
        project=project,
        author=request.user,
        text=text
    )

    serializer = ProjectCommentSerializer(comment)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    """Delete a comment (only author or project owner can delete)."""
    comment = get_object_or_404(ProjectComment, id=comment_id)
    
    if request.user != comment.author and request.user != comment.project.user:
        return Response({"error": "Unauthorized"}, status=403)
    
    comment.delete()
    return Response({"message": "Comment deleted"}, status=204)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_community(request):
    """
    Search community posts.

    Rewritten to work on both Postgres and SQLite. The previous version
    imported ``django.contrib.postgres.search``, which is Postgres-only and
    raised NotSupportedError on the SQLite fallback that settings.py
    defaults to -- and it read ``r.votes``, a field CommunityPost has never
    had (it is ``upvotes``), so it 500'd on any non-empty result even on
    Postgres.

    Ranking is plain relevance: title matches outrank body matches, with
    recency as the tiebreak. No Postgres-only features, no per-row
    to_tsvector, no N+1 on author or reply counts.
    """
    query_str = request.query_params.get('q', '').strip()
    post_type = request.query_params.get('type') or None

    try:
        page = max(int(request.query_params.get('page', 1)), 1)
    except (TypeError, ValueError):
        return Response({"error": "page must be an integer"}, status=400)

    page_size = 20
    posts = CommunityPost.objects.select_related('author').prefetch_related('replies')

    if query_str:
        posts = posts.filter(
            Q(title__icontains=query_str) | Q(content__icontains=query_str)
        )
        # Title hits first, then newest. Case-insensitive, so it behaves the
        # same on every backend.
        posts = posts.annotate(
            _title_hit=Case(
                When(title__icontains=query_str, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).order_by('-_title_hit', '-created_at')
    else:
        posts = posts.order_by('-created_at')

    if post_type:
        posts = posts.filter(post_type=post_type)

    total_count = posts.count()
    offset = (page - 1) * page_size
    results = posts[offset:offset + page_size]

    return Response({
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "results": [
            {
                "id": r.id,
                "title": r.title,
                "content": r.content[:200],
                "author": r.author.username,
                "author_avatar": getattr(r.author, "avatar_url", ""),
                "post_type": r.post_type,
                # The field is upvotes. ``votes`` never existed.
                "votes": r.upvotes,
                "reply_count": len(r.replies.all()),
                "created_at": r.created_at,
            }
            for r in results
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_leaderboard(request):
    """
    Community leaderboard.

    Sorts on a sum over the XP ledger scoped to 'community', not on
    User.community_xp. That column was written by lesson-quiz awards as well
    as community actions, so a user who had never posted anything could
    outrank genuine contributors just by grinding lessons.
    """
    leaders = (
        User.objects.annotate(
            community_xp_total=Coalesce(
                Sum("xp_events__amount", filter=Q(xp_events__scope="community")),
                Value(0),
            ),
            posts_count=Count("posts", distinct=True),
            replies_count=Count("replies", distinct=True),
        )
        .filter(community_xp_total__gt=0)
        .order_by("-community_xp_total", "-posts_count")
        .values("username", "community_xp_total", "posts_count", "replies_count")[:10]
    )

    rows = list(leaders)

    return Response({
        "leaders": [
            {
                "rank": index + 1,
                "username": row["username"],
                "xp": row["community_xp_total"],
                "posts": row["posts_count"],
                "replies": row["replies_count"],
            }
            for index, row in enumerate(rows)
        ],
        # The frontend offered a timeframe selector the backend never
        # honoured, then rendered mock data when the shape did not match.
        # There is one leaderboard and the response says so.
        "timeframe": "all-time",
    })


__all__ = [
    "CommunityPostViewSet",
    "CommunityReplyViewSet",
    "_get_commentable_project",
    "community_leaderboard",
    "create_comment",
    "delete_comment",
    "get_community_feed",
    "get_project_comments",
    "search_community",
    "verify_project",
]
