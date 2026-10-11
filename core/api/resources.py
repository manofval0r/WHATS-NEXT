"""
Resource hub, saved resources, click tracking and the waitlist.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resources_feed(request):
    """
    Paginated, cached, per-tab resource feed.

    Query params
    ------------
    tab    : 'news' | 'jobs' | 'videos'  (required)
    offset : int  (default 0)
    limit  : int  (default 6, max 20)
    """
    user = request.user
    tab = request.query_params.get('tab', 'news')
    offset = int(request.query_params.get('offset', 0))
    limit = min(int(request.query_params.get('limit', _PAGE_SIZE)), 20)

    is_premium = getattr(user, 'plan_tier', 'FREE') == 'PREMIUM'

    # Build search context from user's roadmap
    ctx = get_user_search_context(user)

    # ── cache key per user + tab ──
    cache_key = f"res_feed:{user.id}:{tab}"
    items = django_cache.get(cache_key)

    if items is None:
        try:
            if tab == 'news':
                items = fetch_tech_news(
                    ctx['module_labels'], career_title=ctx['career_title'], limit=30,
                )
            elif tab == 'jobs':
                items = fetch_jobs_multi(
                    ctx['module_labels'], career_title=ctx['career_title'], limit=30,
                )
            elif tab == 'videos':
                items = fetch_youtube_for_modules(
                    ctx['module_labels'], per_module=2, limit=30,
                )
            else:
                return Response({'detail': 'Invalid tab'}, status=400)
        except Exception as exc:
            print(f"[resources_feed] {tab} error: {exc}")
            items = []

        django_cache.set(cache_key, items, _RESOURCE_CACHE_TTL)

    # ── premium gating ──
    total = len(items)
    if not is_premium and offset + limit > _FREE_RESOURCE_LIMIT:
        limit = max(_FREE_RESOURCE_LIMIT - offset, 0)

    page = items[offset:offset + limit]
    has_more = (offset + limit) < total
    hit_premium_wall = (not is_premium) and (offset + len(page) >= _FREE_RESOURCE_LIMIT) and has_more

    ph_capture(str(user.id), 'resources_feed_loaded', {
        'tab': tab, 'offset': offset, 'count': len(page),
        'premium': is_premium,
    })

    return Response({
        'career_focus': ctx['career_title'],
        'tab': tab,
        'items': page,
        'offset': offset,
        'count': len(page),
        'total': total if is_premium else min(total, _FREE_RESOURCE_LIMIT),
        'has_more': has_more if is_premium else (has_more and not hit_premium_wall),
        'premium_wall': hit_premium_wall,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_resource(request):
    """Save a resource (news, video, job) as bookmark."""
    from core.models import SavedResource
    
    user = request.user
    data = request.data
    
    try:
        saved = SavedResource.objects.create(
            user=user,
            resource_type=data.get('resource_type', 'article'),  # news, video, job, article
            title=data.get('title', ''),
            url=data.get('url', ''),
            source=data.get('source', ''),
            description=data.get('description', ''),
            thumbnail_url=data.get('thumbnail', ''),
            tags=data.get('tags', []),
        )
        
        return Response({
            "id": saved.id,
            "message": "Resource saved successfully"
        }, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_resources(request):
    """Get user's saved resources with optional filtering."""
    from core.models import SavedResource
    
    user = request.user
    resource_type = request.query_params.get('type', None)
    search_query = request.query_params.get('search', None)
    page = int(request.query_params.get('page', 1))
    page_size = 20
    
    query = SavedResource.objects.filter(user=user)
    
    if resource_type:
        query = query.filter(resource_type=resource_type)
    
    if search_query:
        query = query.filter(title__icontains=search_query) | query.filter(description__icontains=search_query)
    
    total_count = query.count()
    offset = (page - 1) * page_size
    resources = query.order_by('-saved_at')[offset:offset + page_size]
    
    return Response({
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "results": [
            {
                "id": r.id,
                "type": r.resource_type,
                "title": r.title,
                "url": r.url,
                "source": r.source,
                "description": r.description,
                "thumbnail": r.thumbnail_url,
                "tags": r.tags,
                "saved_at": r.saved_at,
            }
            for r in resources
        ]
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_saved_resource(request, resource_id):
    """Delete a saved resource."""
    from core.models import SavedResource
    
    user = request.user
    try:
        resource = SavedResource.objects.get(id=resource_id, user=user)
        resource.delete()
        return Response({"message": "Resource deleted"})
    except SavedResource.DoesNotExist:
        return Response({"error": "Resource not found"}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def join_waitlist(request):
    """
    Join the platform waitlist. Syncs to Loops.so for email campaigns.
    """
    import os

    email = request.data.get('email', '').strip().lower()
    name = request.data.get('name', '').strip()
    source = request.data.get('source', 'landing').strip()

    if not email or '@' not in email:
        return Response({"error": "Valid email is required"}, status=400)

    waitlist_entry, created = Waitlist.objects.get_or_create(
        email=email,
        defaults={"name": name, "source": source}
    )

    if not created:
        return Response({"message": "You're already on the list!", "already_registered": True})

    # Sync to Loops.so (non-blocking, best-effort)
    loops_api_key = os.environ.get('LOOPS_API_KEY', '')
    if loops_api_key:
        try:
            http_requests.post(
                "https://app.loops.so/api/v1/contacts/create",
                headers={
                    "Authorization": f"Bearer {loops_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "email": email,
                    "firstName": name,
                    "source": source,
                    "userGroup": "waitlist",
                },
                timeout=5,
            )
            waitlist_entry.synced_to_loops = True
            waitlist_entry.save(update_fields=['synced_to_loops'])
        except Exception as e:
            print(f"[WAITLIST] Loops.so sync failed: {e}")

    return Response({
        "message": "You're on the list! We'll be in touch.",
        "position": Waitlist.objects.count(),
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_resource_click(request):
    """
    Track when a user clicks an external resource link.
    Used for analytics and auto-swapping low-CTR resources.
    """
    url = request.data.get('url', '').strip()
    title = request.data.get('title', '').strip()
    module_id = request.data.get('module_id')

    if not url:
        return Response({"error": "URL is required"}, status=400)

    module = None
    if module_id:
        module = UserRoadmapItem.objects.filter(id=module_id, user=request.user).first()

    ResourceClick.objects.create(
        user=request.user,
        url=url,
        title=title[:500] if title else '',
        module=module,
    )

    return Response({"tracked": True})


__all__ = [
    "delete_saved_resource",
    "get_resources_feed",
    "get_saved_resources",
    "join_waitlist",
    "save_resource",
    "track_resource_click",
]
