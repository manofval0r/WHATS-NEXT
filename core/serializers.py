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
        # These fields must match what is inside core/models.py
        fields = ['username', 'password', 'email', 'target_career', 'university_course_raw', 'budget_preference']

    def create(self, validated_data):
        # Create the user using the secure helper
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            target_career=validated_data.get('target_career', ''),
            university_course_raw=validated_data.get('university_course_raw', ''),
            budget_preference=validated_data.get('budget_preference', 'FREE')
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
            'id', 'username', 'email', 'target_career', 'current_level', 
            'github_link', 'linkedin_link', 'reputation_score', 
            'completed_projects_count', 'total_verifications'
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

