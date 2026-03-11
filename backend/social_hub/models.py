"""
AtonixDev Social Hub — data models.

Tables follow the Social Hub directive schema.  UUIDs everywhere, workspace
isolation enforced at the model level, tokens encrypted at rest via the
platform's config.crypto helpers.
"""
import uuid

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# ── Platform choices shared across models ─────────────────────────────────

class Platform(models.TextChoices):
    LINKEDIN  = 'linkedin',  'LinkedIn'
    FACEBOOK  = 'facebook',  'Facebook'
    INSTAGRAM = 'instagram', 'Instagram'
    TWITTER   = 'twitter',   'X (Twitter)'
    TIKTOK    = 'tiktok',    'TikTok'
    YOUTUBE   = 'youtube',   'YouTube'


# ── SocialAccount ──────────────────────────────────────────────────────────

class SocialAccount(models.Model):
    class AccountType(models.TextChoices):
        PERSONAL  = 'personal',  'Personal'
        PAGE      = 'page',      'Page'
        BUSINESS  = 'business',  'Business'
        CHANNEL   = 'channel',   'Channel'

    class Status(models.TextChoices):
        ACTIVE  = 'active',  'Active'
        REVOKED = 'revoked', 'Revoked'
        ERROR   = 'error',   'Error'

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Workspace linkage — FK to workspace if a proper workspace model exists,
    # otherwise stored as a plain identifier string keyed to the user's org.
    user                = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    platform            = models.CharField(max_length=20, choices=Platform.choices, db_index=True)
    account_type        = models.CharField(max_length=20, choices=AccountType.choices, default=AccountType.PERSONAL)
    account_external_id = models.CharField(max_length=255)
    account_name        = models.CharField(max_length=255)
    account_handle      = models.CharField(max_length=255, blank=True, default='')
    avatar_url          = models.URLField(blank=True, default='')
    status              = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('user', 'platform', 'account_external_id')]
        indexes = [
            models.Index(fields=['user', 'platform', 'status']),
        ]
        verbose_name = 'Social Account'

    def __str__(self):
        return f'{self.account_name} [{self.platform}]'


# ── SocialToken ────────────────────────────────────────────────────────────

class SocialToken(models.Model):
    class RefreshStatus(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAILED  = 'failed',  'Failed'
        PENDING = 'pending',  'Pending'

    id                      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    social_account          = models.OneToOneField(SocialAccount, on_delete=models.CASCADE, related_name='token')
    # Tokens stored as encrypted blobs (enc:v1:... prefix via config.crypto)
    access_token_enc        = models.TextField()
    refresh_token_enc       = models.TextField(blank=True, default='')
    expires_at              = models.DateTimeField(null=True, blank=True)
    scopes                  = models.JSONField(default=list)
    last_refresh_attempt_at = models.DateTimeField(null=True, blank=True)
    last_refresh_status     = models.CharField(
        max_length=20, choices=RefreshStatus.choices,
        default=RefreshStatus.PENDING,
    )
    created_at              = models.DateTimeField(auto_now_add=True)
    updated_at              = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Social Token'

    @property
    def is_expired(self):
        if self.expires_at is None:
            return False
        return timezone.now() >= self.expires_at


# ── Media ──────────────────────────────────────────────────────────────────

class MediaAsset(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user                = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_media_assets')
    storage_path        = models.CharField(max_length=1024)  # object-storage key / relative path
    original_filename   = models.CharField(max_length=512, blank=True, default='')
    mime_type           = models.CharField(max_length=128)
    size_bytes          = models.PositiveIntegerField(default=0)
    width               = models.PositiveIntegerField(null=True, blank=True)
    height              = models.PositiveIntegerField(null=True, blank=True)
    duration_seconds    = models.PositiveIntegerField(null=True, blank=True)
    hash                = models.CharField(max_length=64, blank=True, default='', db_index=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Media Asset'

    def __str__(self):
        return self.original_filename or str(self.id)


class MediaBundle(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_media_bundles')
    name        = models.CharField(max_length=255, blank=True, default='')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Media Bundle'


class MediaBundleAsset(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bundle       = models.ForeignKey(MediaBundle, on_delete=models.CASCADE, related_name='bundle_assets')
    asset        = models.ForeignKey(MediaAsset,  on_delete=models.CASCADE, related_name='bundle_memberships')
    position     = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['position']
        unique_together = [('bundle', 'asset')]


# ── SocialPost ─────────────────────────────────────────────────────────────

class SocialPost(models.Model):
    class Status(models.TextChoices):
        DRAFT             = 'draft',             'Draft'
        SCHEDULED         = 'scheduled',         'Scheduled'
        PUBLISHING        = 'publishing',        'Publishing'
        PUBLISHED         = 'published',         'Published'
        FAILED            = 'failed',            'Failed'
        PARTIAL_PUBLISHED = 'partial_published', 'Partial Published'

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user                = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_posts')
    title               = models.CharField(max_length=255, blank=True, default='')
    body                = models.TextField()
    media_bundle        = models.ForeignKey(
        MediaBundle, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='posts',
    )
    status              = models.CharField(
        max_length=30, choices=Status.choices,
        default=Status.DRAFT, db_index=True,
    )
    scheduled_at        = models.DateTimeField(null=True, blank=True, db_index=True)
    published_at        = models.DateTimeField(null=True, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'scheduled_at']),
        ]
        verbose_name = 'Social Post'

    def __str__(self):
        return self.title or str(self.id)


class SocialPostTarget(models.Model):
    class Status(models.TextChoices):
        PENDING    = 'pending',    'Pending'
        QUEUED     = 'queued',     'Queued'
        PUBLISHING = 'publishing', 'Publishing'
        PUBLISHED  = 'published',  'Published'
        FAILED     = 'failed',     'Failed'

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    social_post      = models.ForeignKey(SocialPost,    on_delete=models.CASCADE, related_name='targets')
    social_account   = models.ForeignKey(SocialAccount, on_delete=models.CASCADE, related_name='post_targets')
    platform         = models.CharField(max_length=20, choices=Platform.choices)
    platform_post_id = models.CharField(max_length=512, blank=True, default='')
    status           = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    error_code       = models.CharField(max_length=64, blank=True, default='')
    error_message    = models.TextField(blank=True, default='')
    published_at     = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post Target'


# ── Analytics ──────────────────────────────────────────────────────────────

class SocialAnalyticsSnapshot(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post_target         = models.ForeignKey(SocialPostTarget, on_delete=models.CASCADE, related_name='analytics')
    platform            = models.CharField(max_length=20, choices=Platform.choices)
    snapshot_date       = models.DateField(db_index=True)
    impressions         = models.PositiveIntegerField(null=True, blank=True)
    reach               = models.PositiveIntegerField(null=True, blank=True)
    clicks              = models.PositiveIntegerField(null=True, blank=True)
    likes               = models.PositiveIntegerField(null=True, blank=True)
    comments            = models.PositiveIntegerField(null=True, blank=True)
    shares              = models.PositiveIntegerField(null=True, blank=True)
    saves               = models.PositiveIntegerField(null=True, blank=True)
    video_views         = models.PositiveIntegerField(null=True, blank=True)
    raw_payload         = models.JSONField(default=dict)
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-snapshot_date']
        unique_together = [('post_target', 'snapshot_date')]
        verbose_name = 'Analytics Snapshot'


# ── Audit Log ──────────────────────────────────────────────────────────────

class SocialAuditLog(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='social_audit_logs')
    action      = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, blank=True, default='')
    entity_id   = models.UUIDField(null=True, blank=True)
    metadata    = models.JSONField(default=dict)
    ip_address  = models.CharField(max_length=64, blank=True, default='')
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]
        verbose_name = 'Social Audit Log'

    def __str__(self):
        return f'{self.action} by {self.user_id} @ {self.created_at}'
