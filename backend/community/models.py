from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator

class CommunityMember(models.Model):
    """Community member profile"""
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('contributor', 'Contributor'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='community_member')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    bio = models.TextField(blank=True, null=True)
    expertise_areas = models.CharField(max_length=500, help_text="Comma-separated list of expertise areas", blank=True)
    profile_image = models.ImageField(upload_to='community_profiles/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    website_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    joined_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contribution_points = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-contribution_points', '-joined_date']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"


class Discussion(models.Model):
    """Community discussions/forum posts"""
    CATEGORY_CHOICES = [
        ('general', 'General Discussion'),
        ('help', 'Help & Support'),
        ('showcase', 'Project Showcase'),
        ('ideas', 'Ideas & Suggestions'),
        ('cloud', 'Cloud Infrastructure'),
        ('ai-ml', 'AI & Machine Learning'),
        ('devops', 'DevOps & Automation'),
        ('security', 'Security'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    author = models.ForeignKey(CommunityMember, on_delete=models.CASCADE, related_name='discussions')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class DiscussionReply(models.Model):
    """Replies to discussions"""
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(CommunityMember, on_delete=models.CASCADE, related_name='discussion_replies')
    content = models.TextField()
    is_solution = models.BooleanField(default=False)
    like_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_solution', 'created_at']
    
    def __str__(self):
        return f"Reply by {self.author} on {self.discussion.title}"


class Event(models.Model):
    """Community events, webinars, meetups"""
    EVENT_TYPE_CHOICES = [
        ('webinar', 'Webinar'),
        ('workshop', 'Workshop'),
        ('meetup', 'Meetup'),
        ('conference', 'Conference'),
        ('hackathon', 'Hackathon'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES, default='webinar')
    organizer = models.ForeignKey(CommunityMember, on_delete=models.SET_NULL, null=True, related_name='organized_events')
    event_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    is_online = models.BooleanField(default=True)
    meeting_link = models.URLField(blank=True, null=True)
    capacity = models.IntegerField(null=True, blank=True)
    registration_link = models.URLField(blank=True, null=True)
    featured_image = models.ImageField(upload_to='event_images/', blank=True, null=True)
    tags = models.CharField(max_length=500, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    attendee_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['event_date']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class EventAttendee(models.Model):
    """Track event attendees"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    member = models.ForeignKey(CommunityMember, on_delete=models.CASCADE, related_name='event_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['event', 'member']
    
    def __str__(self):
        return f"{self.member} registered for {self.event}"


class Resource(models.Model):
    """Community resources - tutorials, guides, templates"""
    RESOURCE_TYPE_CHOICES = [
        ('tutorial', 'Tutorial'),
        ('guide', 'Guide'),
        ('template', 'Template'),
        ('tool', 'Tool'),
        ('library', 'Library'),
        ('documentation', 'Documentation'),
    ]
    
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    content = models.TextField()
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPE_CHOICES, default='tutorial')
    author = models.ForeignKey(CommunityMember, on_delete=models.CASCADE, related_name='resources')
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=500, blank=True)
    resource_url = models.URLField(blank=True, null=True, help_text="Link to external resource if applicable")
    difficulty_level = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='intermediate'
    )
    is_published = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-featured', '-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class CommunityStatistic(models.Model):
    """Track community metrics"""
    total_members = models.IntegerField(default=0)
    total_discussions = models.IntegerField(default=0)
    total_events = models.IntegerField(default=0)
    total_resources = models.IntegerField(default=0)
    weekly_active_members = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Community Statistics"
    
    def __str__(self):
        return f"Community Stats - {self.last_updated.date()}"
