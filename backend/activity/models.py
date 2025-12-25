from django.conf import settings
from django.db import models
from django.contrib.contenttypes.models import ContentType


class ActivityEvent(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('view', 'View'),
        ('api_call', 'API Call'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('error', 'Error'),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_events'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    object_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.CharField(max_length=64, null=True, blank=True)

    path = models.CharField(max_length=512)
    method = models.CharField(max_length=10)
    status_code = models.IntegerField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)

    ip_address = models.CharField(max_length=64, null=True, blank=True)
    user_agent = models.CharField(max_length=512, null=True, blank=True)
    referrer = models.CharField(max_length=512, null=True, blank=True)

    extra = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['path']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} {self.path} by {self.actor_id} @ {self.created_at}"
