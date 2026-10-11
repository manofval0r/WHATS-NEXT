from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import serializers

from .models import CommunityPost, CommunityReply, PostTag, PostVote, ProjectComment

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Credentials only. Profile details are collected during onboarding."""

    password = serializers.CharField(write_only=True, min_length=10, trim_whitespace=False)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "password", "email"]

    def validate_password(self, value):
        # The model's AUTH_PASSWORD_VALIDATORS only run on forms, so without
        # this a one-character password is accepted over the API.
        from django.contrib.auth.password_validation import validate_password

        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class UserBasicSerializer(serializers.ModelSerializer):
    """Minimal user info for display in comments and profiles."""

    class Meta:
        model = User
        fields = ["id", "username", "current_level", "target_career"]


class ProjectCommentSerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = ProjectComment
        fields = ["id", "text", "author", "author_username", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Public profile payload.

    Deliberately excludes plan_tier and premium_waitlist_status: both were
    previously returned to anonymous callers, which leaked other users'
    subscription state through a public endpoint.
    """

    completed_projects_count = serializers.SerializerMethodField()
    total_verifications = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "target_career",
            "current_level",
            "avatar_url",
            "avatar_seed",
            "github_link",
            "linkedin_link",
            "twitter_link",
            "website_link",
            "reputation_score",
            "completed_projects_count",
            "total_verifications",
            "profile_visibility",
        ]

    def get_completed_projects_count(self, obj):
        return obj.roadmap_items.filter(status="completed").count()

    def get_total_verifications(self, obj):
        return (
            obj.roadmap_items.filter(status="completed").aggregate(
                total=models.Sum("verification_count")
            )["total"]
            or 0
        )


# ==========================================
# COMMUNITY SERIALIZERS
# ==========================================


class CommunityReplySerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    is_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = CommunityReply
        fields = [
            "id",
            "post",
            "author",
            "content",
            "image",
            "upvotes",
            "is_accepted",
            "created_at",
            "is_upvoted",
        ]
        read_only_fields = ["upvotes", "is_accepted", "created_at", "author", "post"]

    def get_is_upvoted(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            return PostVote.objects.filter(
                user=user, reply=obj, vote_type="reply"
            ).exists()
        return False


class CommunityPostSerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    replies = CommunityReplySerializer(many=True, read_only=True)
    is_upvoted = serializers.SerializerMethodField()
    attached_module_name = serializers.CharField(
        source="attached_module.label", read_only=True, default=None
    )
    # Writeable by slug. Previously the serializer had no tags field at all,
    # so the topic selector in the composer silently dropped the selection.
    tags = serializers.SlugRelatedField(
        many=True,
        read_only=False,
        required=False,
        slug_field="name",
        queryset=PostTag.objects.all(),
    )

    class Meta:
        model = CommunityPost
        fields = [
            "id",
            "author",
            "post_type",
            "title",
            "content",
            "attached_module",
            "attached_module_name",
            "tags",
            "image",
            "upvotes",
            "view_count",
            "reply_count",
            "is_solved",
            "created_at",
            "replies",
            "is_upvoted",
        ]
        read_only_fields = [
            "upvotes",
            "view_count",
            "reply_count",
            "created_at",
            "author",
            "attached_module_name",
        ]

    def validate_attached_module(self, value):
        """
        A post must not be attachable to another user's private roadmap
        module -- that renders its label publicly.
        """
        if value is None:
            return value
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            if value.user_id != user.pk:
                raise serializers.ValidationError(
                    "You can only attach a module from your own roadmap."
                )
        return value

    def get_is_upvoted(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            return PostVote.objects.filter(
                user=user, post=obj, vote_type="post"
            ).exists()
        return False