from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, help_text="e.g., Full-Stack Developer, Designer")
    bio = models.TextField(help_text="Short introduction about yourself")
    about = models.TextField(help_text="Detailed background and story")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Social Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # Skills
    skills = models.JSONField(default=list, help_text="List of skills")
    
    # Settings
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.full_name
