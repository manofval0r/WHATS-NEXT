"""
Employer-facing API models and views for talent search and recruitment.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EmployerProfile(models.Model):
    """
    Profile for employers/recruiters using the platform.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    company_logo_url = models.URLField(blank=True)
    company_website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.company_name} - {self.user.username}"

class JobPosting(models.Model):
    """
    Job postings created by employers.
    """
    LEVEL_CHOICES = [
        ('intern', 'Internship'),
        ('entry', 'Entry-Level'),
        ('junior', 'Junior'),
    ]
    
    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=list, help_text="List of required skill keywords")
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='entry')
    location = models.CharField(max_length=255, default='Remote')
    salary_range = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"

class CandidateApplication(models.Model):
    """
    Tracks applications of learners to job postings.
    """
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]
    
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    match_score = models.IntegerField(default=0, help_text="Skill match percentage 0-100")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('job_posting', 'candidate')
    
    def __str__(self):
        return f"{self.candidate.username} -> {self.job_posting.title}"
