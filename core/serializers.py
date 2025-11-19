from rest_framework import serializers
from .models import User, Roadmap, RoadmapNode, Skill, UserSkillProgress
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'university_course_raw', 'target_career', 'budget_preference']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            university_course_raw=validated_data.get('university_course_raw', ''),
            target_career=validated_data.get('target_career', ''),
            budget_preference=validated_data.get('budget_preference', 'FREE')
        )
        return user
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'normalized_course', 'uni_skills_tags', 'reputation_score']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug', 'icon_url']

class RoadmapNodeSerializer(serializers.ModelSerializer):
    skill = SkillSerializer() # Nest the skill details
    class Meta:
        model = RoadmapNode
        fields = ['id', 'skill', 'step_order', 'project_prompt', 'is_project_mandatory']

class RoadmapSerializer(serializers.ModelSerializer):
    nodes = RoadmapNodeSerializer(many=True, read_only=True)
    class Meta:
        model = Roadmap
        fields = ['id', 'title', 'description', 'nodes']