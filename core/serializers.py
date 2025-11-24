from rest_framework import serializers
from django.contrib.auth import get_user_model

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