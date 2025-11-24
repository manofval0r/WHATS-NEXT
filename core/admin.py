from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserRoadmapItem, Skill

# 1. Register the Custom User
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Career Targets', {'fields': ('target_career', 'budget_preference', 'current_level')}),
        ('University Info', {'fields': ('university_course_raw', 'normalized_course')}),
        ('Platform Stats', {'fields': ('reputation_score',)}),
    )
    list_display = ['username', 'target_career', 'budget_preference', 'date_joined']

# 2. Register the User's Personal Roadmap Items
@admin.register(UserRoadmapItem)
class UserRoadmapItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'step_order', 'label', 'status', 'market_value']
    list_filter = ['status', 'market_value']
    search_fields = ['user__username', 'label']
    ordering = ['user', 'step_order']

# 3. Register Skills (Generic)
@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name']