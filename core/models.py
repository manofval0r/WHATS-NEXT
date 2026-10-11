from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
import uuid

# ==========================================
# 1. USER & PROFILE
# ==========================================

class User(AbstractUser):
    """
    Custom user model to store University data and Career Goals.
    """
    email = models.EmailField(unique=True)

    GENDER_CHOICES = [
        ('unspecified', 'Prefer not to say'),
        ('female', 'Female'),
        ('male', 'Male'),
        ('nonbinary', 'Non-binary'),
    ]

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        default='unspecified',
        help_text='Self-reported gender (used for personalization; not required).'
    )

    # Stable seed for deterministic, gender-neutral avatar generation.
    # Using a seed avoids avatars changing when the username changes.
    avatar_seed = models.UUIDField(default=uuid.uuid4, editable=False)

    # Persistent avatar URL — stored once so it never regenerates.
    avatar_url = models.URLField(
        blank=True,
        default='',
        help_text='Persisted DiceBear avatar URL. Set once from avatar_seed.'
    )

    # Username change cooldown tracking.
    last_username_change_at = models.DateTimeField(null=True, blank=True)
    university_course_raw = models.CharField(max_length=255, blank=True, help_text="User's input (e.g. 'Bsc Acctng')")
    normalized_course = models.CharField(max_length=255, blank=True, help_text="AI cleaned version (e.g. 'Accounting')")
    
    target_career = models.CharField(max_length=255, blank=True)
    budget_preference = models.CharField(max_length=10, choices=[('FREE', 'Free Only'), ('PAID', 'Can Pay')], default='FREE')
    current_level = models.CharField(max_length=50, default='Beginner')
    reputation_score = models.IntegerField(default=0)

    github_link = models.URLField(blank=True, null=True)
    linkedin_link = models.URLField(blank=True, null=True)

    twitter_link = models.URLField(blank=True, null=True)
    website_link = models.URLField(blank=True, null=True)

    PROFILE_VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('community', 'Community-only'),
        ('private', 'Private'),
    ]
    profile_visibility = models.CharField(
        max_length=20,
        choices=PROFILE_VISIBILITY_CHOICES,
        default='public',
        help_text='Who can view this profile inside the app.'
    )

    allow_indexing = models.BooleanField(
        default=True,
        help_text='Allow search engines to index this profile when public.'
    )

    activity_visibility = models.JSONField(
        default=dict,
        blank=True,
        help_text='Per-section visibility toggles for profile activity.'
    )

    email_notifications = models.BooleanField(default=True)

    # Premium & Waitlist (Phase 5 - Test Mode)
    PLAN_CHOICES = [
        ('FREE', 'Free'),
        ('PREMIUM', 'Premium')
    ]
    WAITLIST_STATUS_CHOICES = [
        ('none', 'None'),
        ('pending', 'Pending'),
        ('approved', 'Approved')
    ]

    plan_tier = models.CharField(max_length=10, choices=PLAN_CHOICES, default='FREE')
    premium_waitlist_status = models.CharField(max_length=20, choices=WAITLIST_STATUS_CHOICES, default='none')
    premium_waitlist_joined_at = models.DateTimeField(null=True, blank=True)
    premium_waitlist_source = models.CharField(max_length=100, blank=True)
    premium_waitlist_feature = models.CharField(max_length=50, blank=True)

    # CV export limits (Free: 3/month)
    cv_exports_count = models.IntegerField(default=0)
    cv_exports_reset_at = models.DateField(null=True, blank=True)

    # Phase 7: Retention & Analytics Fields
    last_active_module_id = models.ForeignKey(
        'UserRoadmapItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='last_active_for_user',
        help_text='Last module user was working on'
    )
    last_active_at = models.DateTimeField(null=True, blank=True, help_text='Last time user accessed any module')
    community_xp = models.IntegerField(default=0, help_text='Community engagement points (+10 per post, +5 per reply)')

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="core_user_set",
        related_query_name="core_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="core_user_set",
        related_query_name="core_user",
    )

    def __str__(self):
        return self.username

# ==========================================
# 2. THE PERSONALIZED ROADMAP
# ==========================================

class UserRoadmapItem(models.Model):
    """
    Stores a specific node generated by AI for a specific user.
    """
    STATUS_CHOICES = [
        ('locked', 'Locked'),
        ('active', 'Active (Learning)'),
        ('completed', 'Completed'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmap_items')
    label = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    step_order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')
    market_value = models.CharField(max_length=20, default="Med")
    project_submission_link = models.URLField(blank=True, null=True)

    # Set once, when a project is actually submitted. Previously this was
    # ``auto_now=True``, which rewrites the timestamp on EVERY save() --
    # so an upvote on someone's project re-dated their submission and
    # floated it to the top of the public community feed.
    submitted_at = models.DateTimeField(
        null=True, blank=True, db_index=True,
        help_text='When a project was submitted for verification. Null until submitted.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resources = models.JSONField(default=dict, blank=True)
    project_prompt = models.TextField(blank=True)
    verification_count = models.IntegerField(default=0)
    custom_cv_text = models.TextField(blank=True, null=True, help_text="User edited achievement text")
    
    # Phase 7: Lesson Caching (TTL Strategy)
    lesson_data = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text='Cached lesson data to avoid regenerating on every module view'
    )
    lesson_cached_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Timestamp when lesson was last cached (use for TTL expiration)'
    )
    
    # Project Verification Fields (Phase 3)
    github_score = models.IntegerField(default=0, help_text="Automated GitHub project score (0-100)")
    score_breakdown = models.JSONField(default=dict, blank=True, help_text="Detailed scoring breakdown")
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending',
        help_text="Project verification status"
    )
    
    def __str__(self):
        return f"{self.user.username} -> {self.label} ({self.status})"

    class Meta:
        # These back every hot read in the app. Previously the model had no
        # indexes at all beyond the FK, so "my roadmap" and the public
        # community feed were both sequential scans.
        indexes = [
            models.Index(fields=['user', 'step_order'], name='wn_item_user_step_idx'),
            models.Index(fields=['user', 'status'], name='wn_item_user_status_idx'),
            models.Index(fields=['status', '-submitted_at'], name='wn_item_feed_idx'),
        ]
        constraints = [
            # Guarantees one module per position per user. Without this,
            # concurrent onboarding/regeneration could interleave deletes
            # and inserts and leave duplicate step_order values.
            models.UniqueConstraint(
                fields=['user', 'step_order'],
                name='wn_item_unique_user_step',
            ),
        ]
        ordering = ['step_order']

# ==========================================
# 3. COMMUNITY MODELS
# ==========================================

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): 
        return self.name

class ProjectReview(models.Model):
    """
    Tracks which users verified which projects (for reputation).
    """
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    submission = models.ForeignKey(UserRoadmapItem, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES, default='up')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('submission', 'reviewer')

    def __str__(self):
        return f"{self.reviewer.username} verified {self.submission.label}"

class ProjectComment(models.Model):
    project = models.ForeignKey(UserRoadmapItem, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.project.label}"

# ==========================================
# 4. STREAK SYSTEM
# ==========================================

class UserActivity(models.Model):
    """
    Tracks daily contribution counts for the streak graph.

    ``count`` holds real activity events only. The daily quiz used to
    signal "done" by writing 1000 into this column, which then got summed
    as if it were 1000 contributions -- one quiz click awarded 15,000 XP
    and lit up the heatmap. That state now lives in its own field.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    date = models.DateField()
    count = models.IntegerField(default=0)
    daily_quiz_completed_at = models.DateTimeField(
        null=True, blank=True,
        help_text='Set once the user passes the daily quiz. Never counted as activity.',
    )

    class Meta:
        unique_together = ('user', 'date')
        indexes = [
            models.Index(fields=['user', '-date'], name='wn_activity_user_date_idx'),
        ]

# ==========================================
# 5. QUIZ SYSTEM
# ==========================================

class Quiz(models.Model):
    """
    AI-generated quiz for each roadmap module.
    """
    roadmap_item = models.OneToOneField(UserRoadmapItem, on_delete=models.CASCADE, related_name='quiz')
    # Had no default and was NOT NULL, so the single
    # ``Quiz.objects.get_or_create(roadmap_item=item)`` call in the codebase
    # raised IntegrityError on every module that had never been quizzed --
    # i.e. all of them.
    questions = models.JSONField(default=list, blank=True, help_text="List of question objects with answers")
    user_answers = models.JSONField(default=list, blank=True, help_text="User's submitted answers")
    score = models.IntegerField(default=0, help_text="Score out of 100")
    passed = models.BooleanField(default=False, help_text="True if score >= 70%")
    attempts = models.IntegerField(default=0, help_text="Number of times user took the quiz")
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Quiz for {self.roadmap_item.label} - Score: {self.score}%"

# ==========================================
# 6. JOB MATCHING
# ==========================================
# The employer/recruiter side (EmployerProfile, JobPosting,
# CandidateApplication) has been removed.
#
# A two-sided job marketplace needs employers on one side and candidates on
# the other, and neither side bootstraps: a board with five active job
# seekers is worth nothing to a hiring manager, and there is no honest way
# to demonstrate "employers pay later" with zero employers.
#
# What replaced it is the job matcher in core/job_matching.py. It ranks the
# real, live job feed this project already fetched (WeWorkRemotely,
# Remotive, Hacker News) against the modules a user has actually completed,
# and shows the reasoning for every match. Read-only, no counterparty, no
# seeded demo listings, and every number on screen derives from something real.

# ==========================================
# 7. COMMUNITY Q&A MODELS
# ==========================================

class CommunityPost(models.Model):
    POST_TYPES = [
        ('question', 'Question'),
        ('discussion', 'Discussion'),
        ('showcase', 'Project Showcase'),
        ('achievement', 'Achievement'),
    ]
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='question')
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    # Module attachment (optional)
    attached_module = models.ForeignKey(
        UserRoadmapItem, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='community_posts'
    )
    
    # Image upload (optional)
    image = models.ImageField(upload_to='community_images/', null=True, blank=True)
    
    # Engagement metrics
    upvotes = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    reply_count = models.IntegerField(default=0)
    
    # Status
    is_solved = models.BooleanField(default=False)  # For questions
    is_pinned = models.BooleanField(default=False)  # Admin feature

    # Declared on the post, not on the tag. Previously the M2M lived on
    # PostTag.posts, so ``post.tags`` never existed as an attribute and the
    # topic filter in the UI always matched nothing.
    tags = models.ManyToManyField("PostTag", related_name="posts", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['post_type', '-created_at']),
            models.Index(fields=['attached_module', '-created_at'])
        ]

    def __str__(self):
        return f"{self.title} by {self.author.username}"

class CommunityReply(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    
    # Optional image
    image = models.ImageField(upload_to='reply_images/', null=True, blank=True)
    
    # Engagement
    upvotes = models.IntegerField(default=0)
    is_accepted = models.BooleanField(default=False)  # Best answer (by OP)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_accepted', '-upvotes', 'created_at']

    def __str__(self):
        return f"Reply by {self.author.username} on {self.post.title}"

class PostVote(models.Model):
    VOTE_TYPES = [
        ('post', 'Post Vote'),
        ('reply', 'Reply Vote')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPES)
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, null=True, blank=True)
    reply = models.ForeignKey(CommunityReply, on_delete=models.CASCADE, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # The old ``unique_together`` was ineffective on Postgres: a row with
        # post=NULL, reply=5 has post NULL, and NULLs compare as distinct in a
        # unique index, so concurrent votes were never deduplicated and
        # ``upvotes`` could be double-incremented.
        #
        # Two partial unique indexes, one per vote target, enforce exactly
        # one vote per user per target and never overlap.
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=models.Q(post__isnull=False),
                name='wn_vote_unique_user_post',
            ),
            models.UniqueConstraint(
                fields=['user', 'reply'],
                condition=models.Q(reply__isnull=False),
                name='wn_vote_unique_user_reply',
            ),
        ]

class PostTag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

# ==========================================
# 8. CERTIFICATE SYSTEM (Phase 3)
# ==========================================

class Certificate(models.Model):
    """
    Verified project completion certificate.
    Generated on-demand when a project passes verification.
    """
    certificate_id = models.CharField(
        max_length=64,
        unique=True,
        help_text="Unique certificate ID (e.g., WN-REACT-2026-a3f2b9c1)"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    roadmap_item = models.OneToOneField(
        UserRoadmapItem, 
        on_delete=models.CASCADE, 
        related_name='certificate'
    )
    
    # Verification data at time of issuance
    github_score = models.IntegerField(help_text="Score at time of certificate issuance")
    peer_verifications = models.IntegerField(default=0, help_text="Peer verification count at issuance")
    score_breakdown = models.JSONField(default=dict, help_text="Detailed breakdown at issuance")
    
    # Metadata
    issued_at = models.DateTimeField(auto_now_add=True)
    github_repo_url = models.URLField(blank=True)
    
    class Meta:
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['certificate_id']),
            models.Index(fields=['user', '-issued_at']),
        ]
    
    def __str__(self):
        return f"{self.certificate_id} - {self.user.username}"
    
    @staticmethod
    def generate_certificate_id(module_label):
        """
        Generate a unique certificate ID.
        Format: WN-{MODULE_KEYWORD}-{YEAR}-{SHORT_UUID}
        Example: WN-REACT-2026-a3f2
        """
        from datetime import datetime
        
        # Extract first significant keyword from module label
        keywords = module_label.upper().split()
        keyword = 'MOD'
        for word in keywords:
            if len(word) >= 3 and word.isalpha():
                keyword = word[:6]  # Max 6 chars
                break
        
        year = datetime.now().year
        # 8 hex chars, not 4. With 4 there are only 65,536 ids per
        # (keyword, year) bucket, which reaches ~50% collision probability
        # at around 360 certificates and 500s the issuance endpoint.
        short_uuid = uuid.uuid4().hex[:8]

        return f"WN-{keyword}-{year}-{short_uuid}"

# ==========================================
# 9. SAVED RESOURCES (Phase 7)
# ==========================================

class SavedResource(models.Model):
    """
    Bookmarked resources (news, videos, jobs) saved by users.
    Module-independent - users can bookmark from the Resources Hub.
    """
    RESOURCE_TYPES = [
        ('news', 'Tech News'),
        ('video', 'Video'),
        ('job', 'Job Posting'),
        ('article', 'Article'),
        ('documentation', 'Documentation'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    title = models.CharField(max_length=500)
    url = models.URLField()
    source = models.CharField(max_length=100, help_text="e.g., 'Tech Crunch', 'YouTube', 'WeWorkRemotely'")
    description = models.TextField(blank=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True, help_text="List of tags for filtering")
    
    # Metadata
    published_at = models.DateTimeField(null=True, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    # Optional module association
    associated_module = models.ForeignKey(
        'UserRoadmapItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='saved_resources'
    )
    
    class Meta:
        ordering = ['-saved_at']
        unique_together = ('user', 'url')
        indexes = [
            models.Index(fields=['user', '-saved_at']),
            models.Index(fields=['resource_type', '-saved_at']),
        ]
    
    def __str__(self):
        return f"{self.title} (saved by {self.user.username})"

# ==========================================
# 10. BADGE SYSTEM (Phase 7)
# ==========================================

class Badge(models.Model):
    """
    Achievements awarded to users for reaching milestones.
    E.g., "First Module", "30-Day Streak", "5 Projects Verified"
    """
    BADGE_TYPES = [
        ('first_module', 'First Module'),
        ('streak_7', '7-Day Streak'),
        ('streak_30', '30-Day Streak'),
        ('modules_5', 'Five Modules'),
        ('modules_10', 'Ten Modules'),
        ('verified_project', 'Verified Project'),
        ('verified_5', 'Five Verified Projects'),
        ('community_contributor', 'Community Contributor'),
        ('top_contributor', 'Top Contributor This Week'),
        ('product_thinker', 'Product Thinker'),
        ('communicator', 'Strong Communicator'),
        ('soft_skills', 'Soft Skills Champion'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    icon_url = models.URLField(blank=True, help_text='SVG icon or image URL for the badge')
    title = models.CharField(max_length=100)
    description = models.TextField()
    awarded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-awarded_at']
        unique_together = ('user', 'badge_type')
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"


# ==========================================
# 11. ROLE-BASED ROADMAP TEMPLATES
# ==========================================

class RoleRoadmapTemplate(models.Model):
    """
    Pre-built, curated roadmap template for a specific career role.
    Replaces per-user AI generation with high-quality static paths.
    """
    ROLE_CHOICES = [
        ('fullstack', 'Full-Stack Developer'),
        ('frontend', 'Frontend Developer'),
        ('backend', 'Backend Developer'),
        ('data', 'Data Scientist'),
        ('devops', 'DevOps Engineer'),
        ('mobile', 'Mobile Developer'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    modules = models.JSONField(
        default=list,
        help_text='Ordered list of module dicts: label, description, market_value, project_prompt, resources, lessons, connections'
    )
    version = models.IntegerField(default=1, help_text='Bump when updating the template')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['role']

    def __str__(self):
        return f"{self.get_role_display()} v{self.version}"


# ==========================================
# 12. SOCIAL: FOLLOWING / FRIENDS
# ==========================================

class UserFollowing(models.Model):
    """
    Lightweight follow relationship so users can see friends' roadmap progress.
    """
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"


# ==========================================
# 13. WAITLIST (Loops.so sync)
# ==========================================

class Waitlist(models.Model):
    """
    Email waitlist entries synced to Loops.so via Django signals.
    """
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=50, default='landing', help_text='landing, referral, social')
    synced_to_loops = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='waitlist_entry')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.source})"


# ==========================================
# 14. TECHNICAL DEBT TRACKER
# ==========================================

class UserTechDebt(models.Model):
    """
    Tracks topics the user has been skipping or avoiding.
    JADA uses this to nudge the user proactively.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tech_debts')
    topic = models.CharField(max_length=200)
    skipped_count = models.IntegerField(default=1)
    last_skipped_at = models.DateTimeField(auto_now=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'topic')
        ordering = ['-skipped_count']

    def __str__(self):
        return f"{self.user.username}: {self.topic} (skipped {self.skipped_count}x)"


# ==========================================
# 15. LESSON PROGRESS & QUIZ GATES
# ==========================================

class LessonProgress(models.Model):
    """
    Persistent per-lesson progress tracking.
    Each lesson within a module requires passing a 5-question quiz to be marked complete.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    roadmap_item = models.ForeignKey(
        UserRoadmapItem, on_delete=models.CASCADE, related_name='lesson_progress'
    )
    lesson_id = models.CharField(max_length=100, help_text='AI-generated lesson identifier (e.g. "lesson_1")')
    lesson_title = models.CharField(max_length=300, blank=True)

    # Completion state
    is_completed = models.BooleanField(default=False)
    quiz_passed = models.BooleanField(default=False)
    quiz_questions = models.JSONField(default=list, blank=True, help_text='5 MCQ questions generated by AI')
    quiz_answers = models.JSONField(default=list, blank=True, help_text="User's submitted answers")
    quiz_score = models.IntegerField(default=0, help_text='Score out of 100')
    quiz_attempts = models.IntegerField(default=0)
    confidence_rating = models.IntegerField(null=True, blank=True, help_text='Self-assessed 0-100')
    xp_awarded = models.IntegerField(default=0)

    # Engagement tracking
    time_spent_seconds = models.IntegerField(default=0, help_text='Approximate time spent on lesson')

    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'roadmap_item', 'lesson_id')
        ordering = ['roadmap_item', 'lesson_id']

    def __str__(self):
        status = 'DONE' if self.is_completed else 'WIP'
        return f"{self.user.username} | {self.lesson_title[:40]} [{status}]"


# ==========================================
# 16. RESOURCE CLICK TRACKING
# ==========================================

class ResourceClick(models.Model):
    """
    Tracks every external resource click.
    Low CTR resources are auto-swapped by a nightly task.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_clicks')
    url = models.URLField()
    title = models.CharField(max_length=500, blank=True)
    module = models.ForeignKey(UserRoadmapItem, on_delete=models.SET_NULL, null=True, blank=True)
    clicked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['url', '-clicked_at']),
        ]

    def __str__(self):
        return f"{self.user.username} clicked {self.url[:60]}"


# ==========================================
# 16. JADA CONVERSATIONS
# ==========================================

class JadaConversation(models.Model):
    """
    A chat session between a user and JADA.
    Stores context so JADA can remember technical debt, progress, etc.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='jada_conversations',
        null=True, blank=True,
        help_text='Null for guest (pre-signup) conversations'
    )
    session_id = models.UUIDField(
        null=True, blank=True, db_index=True,
        help_text='Anonymous session ID for guest conversations'
    )
    context_module = models.ForeignKey(
        UserRoadmapItem, on_delete=models.SET_NULL, null=True, blank=True,
        help_text='Module context for this conversation'
    )
    mode = models.CharField(
        max_length=20, default='general',
        choices=[
            ('general', 'General Chat'),
            ('lesson', 'Lesson Help'),
            ('review', 'Code Review'),
            ('manager', 'Manager Mode'),
            ('architect', 'Architect Mode'),
            ('consultant', 'Career Consultant'),
        ]
    )
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_message_at']

    def __str__(self):
        name = self.user.username if self.user else f'guest-{self.session_id}'
        return f"JADA chat: {name} ({self.mode})"


class JadaMessage(models.Model):
    """
    Individual message in a JADA conversation.
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('jada', 'JADA'),
        ('system', 'System'),
    ]
    conversation = models.ForeignKey(JadaConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    model_used = models.CharField(max_length=50, blank=True, help_text='e.g. llama-3.1, deepseek-r1')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"


# ==========================================
# 17. XP LEDGER
# ==========================================

class XpEvent(models.Model):
    """
    An append-only record of every XP award.

    Previously XP was never stored: two endpoints recomputed it from live
    counters using different formulas, so /api/profile/ and /api/analytics/
    disagreed for the same user, and neither agreed with the next request.
    Lesson-quiz XP was also written into ``User.community_xp``, which is the
    leaderboard's sort key, letting a user who never posted outrank genuine
    contributors just by grinding lessons.

    One ledger, one formula, and the total is a sum rather than a guess.
    """

    REASON_CHOICES = [
        ('module_completed', 'Module completed'),
        ('lesson_completed', 'Lesson completed'),
        ('quiz_passed', 'Quiz passed'),
        ('project_verified', 'Project verified'),
        ('daily_quiz', 'Daily quiz'),
        ('streak_milestone', 'Streak milestone'),
        ('community_post', 'Community post'),
        ('community_reply', 'Community reply'),
        ('peer_review', 'Peer review given'),
        ('badge', 'Badge awarded'),
        ('adjustment', 'Manual adjustment'),
    ]

    # Which leaderboard the award counts toward.
    SCOPE_CHOICES = [
        ('learning', 'Learning'),
        ('community', 'Community'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_events')
    amount = models.IntegerField(help_text='May be negative for adjustments.')
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    scope = models.CharField(max_length=12, choices=SCOPE_CHOICES, default='learning')
    # Set when the award was for a specific thing, so a duplicate award can
    # be detected instead of silently doubling.
    reference = models.CharField(
        max_length=64, blank=True,
        help_text='e.g. roadmap item id, lesson id. Used for idempotency.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='wn_xp_user_created_idx'),
            models.Index(fields=['user', 'scope'], name='wn_xp_user_scope_idx'),
        ]
        constraints = [
            # One award per (user, reason, reference). Guards against a
            # double-clicked submit paying out twice.
            models.UniqueConstraint(
                fields=['user', 'reason', 'reference'],
                condition=~models.Q(reference=''),
                name='wn_xp_unique_award',
            ),
        ]

    def __str__(self):
        return f"{self.user.username} {self.amount:+d} XP ({self.reason})"


class SkillTransfer(models.Model):
    """
    Modules that carry across a career pivot.

    Computed by comparing what a user has completed against the target
    role's catalog. This is the real implementation of the "skill transfer"
    the settings screen used to claim and then leave as a TODO comment.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_transfers')
    from_role = models.CharField(max_length=64)
    to_role = models.CharField(max_length=64)
    carried_labels = models.JSONField(default=list, blank=True)
    gap_labels = models.JSONField(default=list, blank=True)
    overlap = models.FloatField(
        default=0.0,
        help_text='Fraction of the new role already covered, 0.0-1.0.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.from_role} -> {self.to_role} ({self.overlap:.0%})"
