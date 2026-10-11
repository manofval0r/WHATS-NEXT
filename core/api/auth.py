"""
Registration, login helpers, OAuth callback, onboarding entry points.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

def ensure_avatar_url(user):
    """Ensure the user has a persistent avatar_url. Set it once from avatar_seed."""
    if user.avatar_url:
        return user.avatar_url
    seed = str(user.avatar_seed) if user.avatar_seed else user.username
    url = f"https://api.dicebear.com/7.x/identicon/svg?seed={seed}"
    User.objects.filter(pk=user.pk).update(avatar_url=url)
    user.avatar_url = url
    return url


USERNAME_MAX_LENGTH = 30


USERNAME_MIN_LENGTH = 3


USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]+$')


_USERNAME_HEADER_UNSAFE = re.compile(r'["\\;]')


def _validate_username(candidate, exclude_user=None):
    """
    Validate a username against every rule the app enforces.

    Returns ``(True, None)`` or ``(False, reason)``.
    """
    candidate = (candidate or '').strip()

    if not candidate:
        return False, "Username is required"
    if len(candidate) < USERNAME_MIN_LENGTH:
        return False, f"Username must be at least {USERNAME_MIN_LENGTH} characters"
    if len(candidate) > USERNAME_MAX_LENGTH:
        return False, f"Username must be {USERNAME_MAX_LENGTH} characters or fewer"
    if not USERNAME_PATTERN.match(candidate):
        return False, "Only letters, numbers, and underscores allowed"
    if _USERNAME_HEADER_UNSAFE.search(candidate):
        return False, "Username contains characters that are not allowed"

    taken = User.objects.filter(username__iexact=candidate)
    if exclude_user is not None:
        taken = taken.exclude(pk=exclude_user.pk)
    if taken.exists():
        return False, "That username is already taken"

    return True, None


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """Return whether a username is available for registration."""
    q = request.query_params.get('q', '').strip()
    ok, reason = _validate_username(q)
    if not ok:
        return Response({"available": False, "reason": reason})
    return Response({"available": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def social_login_success(request):
    """
    Landing point after an allauth social login.

    Hands the SPA a JWT pair via the URL *fragment*, not the query string.

    Why the fragment matters: query strings are written to browser history,
    persisted by proxies, and forwarded in the ``Referer`` header to every
    third party the page then loads — Google Fonts, PostHog, avatar hosts.
    A fragment is never sent anywhere except the browser, and the SPA reads
    it and immediately clears it.

    Also stops hardcoding the frontend origin. Three different hostnames
    were previously baked into this project; they are all env-driven now.
    """
    user = request.user

    if not user.is_authenticated:
        return Response(
            {"error": "Not authenticated. Start the OAuth flow again."},
            status=401,
        )

    refresh = RefreshToken.for_user(user)
    # Carried so the SPA can skip onboarding without a second request.
    refresh["needs_onboarding"] = not (user.target_career or "").strip()

    ph_identify(user)
    ph_capture(user, "user_registered", {"method": "oauth"})

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")

    # urlencode into the fragment: a token is base64 and can contain
    # characters that need escaping.
    from urllib.parse import quote

    fragment = (
        f"access={quote(str(refresh.access_token))}"
        f"&refresh={quote(str(refresh))}"
    )

    return redirect(f"{frontend_url}/auth-callback#{fragment}")


class RegisterView(generics.CreateAPIView):
    """
    Handles creating a new user account.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # No logging of request.data: it contains the plaintext password, and
        # this used to print it to the platform log on every signup.
        response = super().create(request, *args, **kwargs)

        try:
            from core.models import User as UserModel

            user = UserModel.objects.get(username=request.data.get("username", ""))
            ph_identify(user)
            ph_capture(user, "user_registered", {"method": "email"})
        except Exception:  # noqa: BLE001 - analytics must never break signup
            logger.debug("post-signup analytics failed", exc_info=True)

        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def normalize_course(request):
    """
    Uses AI to normalize and clean university course input.
    """
    from core.ai_logic import normalize_university_course
    
    
    raw_course = request.data.get('course_name', '')
    if not raw_course or len(raw_course.strip()) == 0:
        return Response({"normalized": ""})
    
    try:
        normalized = normalize_university_course(raw_course)
        return Response({"normalized": normalized})
    except Exception as e:
        print(f"Normalization error: {e}")
        return Response({"normalized": raw_course})  # Return original if AI fails


@api_view(['GET'])
@permission_classes([AllowAny])
def list_roles(request):
    """
    Return available career roles for the onboarding dropdown.
    """
    return Response({"roles": get_available_roles()})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_role(request):
    """
    Given a university_course and chosen_role, suggest a potentially better-fitting role.
    """
    course = request.data.get('university_course', '').strip()
    chosen = request.data.get('chosen_role', '').strip()
    suggested = suggest_role_for_course(course, chosen)
    if suggested:
        tmpl = get_role_template(suggested)
        return Response({
            "suggestion": suggested,
            "title": tmpl["title"] if tmpl else suggested,
            "description": tmpl["description"] if tmpl else "",
        })
    return Response({"suggestion": None})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_username(request):
    """Update username with a 20-day cooldown."""
    from django.utils import timezone
    from datetime import timedelta

    user = request.user
    new_username = (request.data.get('username') or '').strip()

    if new_username == user.username:
        return Response({"message": "Username unchanged", "username": user.username})

    # Same rules as registration. Previously this path enforced only a
    # 150-char cap and case-sensitive uniqueness, so a user could claim
    # "Alice" over an existing "alice", and could set a username containing
    # quotes or semicolons that later broke the Content-Disposition header
    # of the portfolio export.
    ok, reason = _validate_username(new_username, exclude_user=user)
    if not ok:
        return Response({"error": reason}, status=400)

    cooldown = timedelta(days=20)
    last_changed = getattr(user, 'last_username_change_at', None)
    if last_changed:
        next_allowed = last_changed + cooldown
        if timezone.now() < next_allowed:
            return Response({
                "error": "Username can only be changed once every 20 days",
                "next_allowed_at": next_allowed.isoformat(),
            }, status=400)

    # Uniqueness is already enforced case-insensitively by
    # _validate_username above; do not re-check it case-sensitively here.

    user.username = new_username
    user.last_username_change_at = timezone.now()
    user.save(update_fields=['username', 'last_username_change_at'])

    return Response({
        "message": "Username updated",
        "username": user.username,
        "last_username_change_at": user.last_username_change_at.isoformat() if user.last_username_change_at else None,
    })


__all__ = [
    "RegisterView",
    "USERNAME_MAX_LENGTH",
    "USERNAME_MIN_LENGTH",
    "USERNAME_PATTERN",
    "_USERNAME_HEADER_UNSAFE",
    "_validate_username",
    "check_username",
    "ensure_avatar_url",
    "list_roles",
    "normalize_course",
    "social_login_success",
    "suggest_role",
    "update_username",
]
