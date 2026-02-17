from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import ProjectComment

# Get the Custom User model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # Credentials only — profile details collected during onboarding
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class UserBasicSerializer(serializers.ModelSerializer):
    """Minimal user info for display in comments/profiles."""
    class Meta:
        model = User
        fields = ['id', 'username', 'current_level', 'target_career']


class ProjectCommentSerializer(serializers.ModelSerializer):
    """Serializer for project comments."""
    author = UserBasicSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = ProjectComment
        fields = ['id', 'text', 'author', 'author_username', 'author_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile page."""
    completed_projects_count = serializers.SerializerMethodField()
    total_verifications = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'target_career', 'current_level',
            'gender', 'avatar_seed', 'last_username_change_at',
            'github_link', 'linkedin_link', 'twitter_link', 'website_link',
            'profile_visibility', 'allow_indexing', 'activity_visibility',
            'reputation_score',
            'completed_projects_count', 'total_verifications',
            'plan_tier', 'premium_waitlist_status'
        ]
    
    def get_completed_projects_count(self, obj):
        from .models import UserRoadmapItem
        return UserRoadmapItem.objects.filter(user=obj, status='completed').count()
    
    def get_total_verifications(self, obj):
        from .models import UserRoadmapItem
        return UserRoadmapItem.objects.filter(user=obj, status='completed').aggregate(
            total=models.Sum('verification_count')
        )['total'] or 0


class JobPostingSerializer(serializers.Serializer):
    """Serializer for job postings to be returned to candidates."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    company_name = serializers.CharField(source='employer.company_name')
    level = serializers.CharField()
    location = serializers.CharField()
    salary_range = serializers.CharField()
    required_skills = serializers.ListField()
    created_at = serializers.DateTimeField()
    match_score = serializers.SerializerMethodField()
    
    def get_match_score(self, obj):
        # Calculated at view level
        return getattr(obj, '_match_score', 0)


# ==========================================
# COMMUNITY SERIALIZERS
# ==========================================

from .models import CommunityPost, CommunityReply, PostVote

class CommunityReplySerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    is_upvoted = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityReply
        fields = ['id', 'post', 'author', 'content', 'image', 'upvotes', 'is_accepted', 'created_at', 'is_upvoted']
        read_only_fields = ['upvotes', 'is_accepted', 'created_at']

    def get_is_upvoted(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return PostVote.objects.filter(user=user, reply=obj, vote_type='reply').exists()
        return False

class CommunityPostSerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    replies = CommunityReplySerializer(many=True, read_only=True)
    is_upvoted = serializers.SerializerMethodField()
    attached_module_name = serializers.CharField(source='attached_module.label', read_only=True)
    
    class Meta:
        model = CommunityPost
        fields = [
            'id', 'author', 'post_type', 'title', 'content', 
            'attached_module', 'attached_module_name', 'image', 
            'upvotes', 'view_count', 'reply_count', 'is_solved', 
            'created_at', 'replies', 'is_upvoted'
        ]
        read_only_fields = ['upvotes', 'view_count', 'reply_count', 'created_at']

    def get_is_upvoted(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return PostVote.objects.filter(user=user, post=obj, vote_type='post').exists()
        return False


