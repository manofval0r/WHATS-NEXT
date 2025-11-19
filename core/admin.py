from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, Roadmap, RoadmapNode, Resource, UserSkillProgress, ProjectReview

# 1. Register the Custom User
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('University Info', {'fields': ('university_course_raw', 'normalized_course', 'uni_skills_tags')}),
        ('Platform Stats', {'fields': ('reputation_score',)}),
        ('Portfolio', {'fields': ('github_link', 'linkedin_link', 'bio')}),
    )
    list_display = ['username', 'normalized_course', 'reputation_score', 'is_staff']

# 2. Register the Knowledge Graph
@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']

class RoadmapNodeInline(admin.TabularInline):
    model = RoadmapNode
    extra = 1 # Allows adding nodes directly inside the Roadmap page

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active']
    inlines = [RoadmapNodeInline] # Shows nodes inside the roadmap view

# 3. Register Progress & Reviews
@admin.register(UserSkillProgress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'status', 'submitted_at']
    list_filter = ['status']

@admin.register(ProjectReview)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'submission', 'vote']