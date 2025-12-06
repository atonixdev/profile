from django.db import models


class Testimonial(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    
    client_name = models.CharField(max_length=200)
    client_title = models.CharField(max_length=200, blank=True, help_text="e.g., CEO at Company")
    client_company = models.CharField(max_length=200, blank=True)
    client_avatar = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    
    content = models.TextField(help_text="Testimonial text")
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    
    project = models.CharField(max_length=200, blank=True, help_text="Associated project")
    
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.client_name} - {self.rating} stars"
