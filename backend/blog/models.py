from django.db import models
from django.utils.text import slugify

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(max_length=500)
    content = models.TextField()
    author = models.CharField(max_length=100, default='Samuel Realm')
    category = models.CharField(
        max_length=50,
        choices=[
            ('cloud', 'Cloud Architecture'),
            ('ai', 'AI & Machine Learning'),
            ('devops', 'DevOps'),
            ('infrastructure', 'Infrastructure'),
            ('security', 'Security'),
            ('tutorial', 'Tutorial'),
        ],
        default='tutorial'
    )
    featured_image = models.URLField(blank=True, null=True)
    tags = models.CharField(max_length=200, help_text='Comma-separated tags')
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read_time = models.IntegerField(default=5, help_text='Estimated read time in minutes')
    view_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_tags_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]


class BlogComment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.name} on {self.post.title}"
