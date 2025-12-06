from django.db import models


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('web', 'Web Development'),
        ('mobile', 'Mobile Development'),
        ('design', 'Design'),
        ('consulting', 'Consulting'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    detailed_description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='web')
    technologies = models.JSONField(default=list, help_text="List of technologies used")
    
    # Links
    live_url = models.URLField(blank=True, help_text="Live project URL")
    github_url = models.URLField(blank=True, help_text="GitHub repository URL")
    
    # Media
    thumbnail = models.ImageField(upload_to='projects/thumbnails/', null=True, blank=True)
    images = models.JSONField(default=list, help_text="Additional project images")
    
    # Metadata
    client = models.CharField(max_length=200, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Display order (lower numbers first)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return self.title
