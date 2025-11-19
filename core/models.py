from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# ==========================================
# 1. USER & PROFILE (The Identity Layer)
# ==========================================

class User(AbstractUser):
    """
    Custom user model to store University data and Reputation.
    """
    # University / Career merging data
    university_course_raw = models.CharField(max_length=255, blank=True, help_text="User's input (e.g. 'Bsc Acctng')")
    normalized_course = models.CharField(max_length=255, blank=True, help_text="AI cleaned version (e.g. 'Accounting')")
    # JSONField allows us to store a list like ['Finance', 'Math', 'Audit'] directly
    uni_skills_tags = models.JSONField(default=list, blank=True, help_text="Tags derived from the course")
    target_career = models.CharField(max_length=255, blank=True)
    budget_preference = models.CharField(
        max_length=10, 
        choices=[('FREE', 'Free Only'), ('PAID', 'Can Pay')],
        default='FREE'
    )
    current_level = models.CharField(max_length=50, default="Beginner") # For Market Readiness
    # Platform Stats
    bio = models.TextField(max_length=500, blank=True)
    reputation_score = models.IntegerField(default=0, help_text="Points gained from reviewing others")
    
    # Social Links for the Portfolio
    github_link = models.URLField(blank=True)
    linkedin_link = models.URLField(blank=True)

    def __str__(self):
        return self.username

# ==========================================
# 2. THE KNOWLEDGE GRAPH (Skills & Roadmaps)
# ==========================================

class Skill(models.Model):
    """
    A specific skill (e.g., 'Git', 'React Hooks', 'Financial Analysis').
    Independent of Roadmaps to allow XP Transfer.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Roadmap(models.Model):
    """
    A career path (e.g., 'Frontend Development', 'Fintech Specialist').
    """
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class RoadmapNode(models.Model):
    """
    Represents a step in a Roadmap. Connects a Roadmap to a Skill.
    This allows us to visualize the 'Graph'.
    """
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='nodes')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    
    # Graph Logic: Node B requires Node A
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)
    
    # Content
    step_order = models.IntegerField(help_text="General ordering for list view")
    project_prompt = models.TextField(help_text="The specific challenge for this module")
    is_project_mandatory = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.roadmap.title} -> {self.skill.name}"

class Resource(models.Model):
    """
    Learning materials linked to a specific node.
    """
    RESOURCE_TYPES = [
        ('DOC', 'Documentation'),
        ('VID', 'Video'),
        ('COURSE', 'Full Course'),
        ('Article', 'Article'),
    ]
    
    node = models.ForeignKey(RoadmapNode, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    url = models.URLField()
    type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    is_official = models.BooleanField(default=False, help_text="Is this the 'What's Next' recommended link?")

    def __str__(self):
        return self.title

# ==========================================
# 3. PROGRESS & PEER REVIEW (The Engine)
# ==========================================

class UserSkillProgress(models.Model):
    """
    Tracks if a user has conquered a SKILL.
    Linked to Skill, NOT Node. This enables 'XP Transfer' across roadmaps.
    """
    STATUS_CHOICES = [
        ('LOCKED', 'Locked'),
        ('IN_PROGRESS', 'Learning'),
        ('PENDING_REVIEW', 'Project Submitted'),
        ('VERIFIED', 'Verified Skill'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills_progress')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='LOCKED')
    project_link = models.URLField(blank=True, null=True)
    project_description = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'skill') # A user can only have one status per skill

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.status})"

class ProjectReview(models.Model):
    """
    A peer review on a user's submission.
    """
    VOTE_CHOICES = [
        (1, 'Approve'),
        (-1, 'Request Changes'),
    ]

    submission = models.ForeignKey(UserSkillProgress, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    vote = models.IntegerField(choices=VOTE_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('submission', 'reviewer') # You can only vote once per project

    def __str__(self):
        return f"Review by {self.reviewer.username} on {self.submission}"