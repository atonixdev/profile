from django.db import models
from django.contrib.auth.models import User


class UserSSHKey(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_EXPIRED = 'expired'
    STATUS_REVOKED = 'revoked'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_EXPIRED, 'Expired'),
        (STATUS_REVOKED, 'Revoked'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ssh_keys')
    title = models.CharField(max_length=255)
    public_key = models.TextField()
    fingerprint = models.CharField(max_length=255, db_index=True)
    algorithm = models.CharField(max_length=64)  # e.g. ssh-ed25519, ssh-rsa
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    class Meta:
        unique_together = [('user', 'fingerprint')]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title}"


class UserGPGKey(models.Model):
    STATUS_UNVERIFIED = 'unverified'
    STATUS_VERIFIED = 'verified'
    STATUS_REVOKED = 'revoked'
    STATUS_EXPIRED = 'expired'

    STATUS_CHOICES = [
        (STATUS_UNVERIFIED, 'Unverified'),
        (STATUS_VERIFIED, 'Verified'),
        (STATUS_REVOKED, 'Revoked'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gpg_keys')
    public_key = models.TextField()
    key_id = models.CharField(max_length=32, db_index=True)   # e.g. 0xABCDEF1234567890
    fingerprint = models.CharField(max_length=255, db_index=True)
    primary_user_id = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_UNVERIFIED)

    class Meta:
        unique_together = [('user', 'fingerprint')]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.key_id}"


class AuditEvent(models.Model):
    """Immutable audit log for security-sensitive operations."""

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='audit_events'
    )
    event_type = models.CharField(max_length=64, db_index=True)   # e.g. ssh_key_created
    resource_type = models.CharField(max_length=32, db_index=True) # ssh_key | gpg_key
    resource_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict)  # fingerprint, title, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_id} — {self.event_type} at {self.created_at}"
