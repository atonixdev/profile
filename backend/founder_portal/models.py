"""
AtonixDev — Founder Portal Models

Modules:
  - Founder Directive / Narrative entries
  - Investor documents & stakeholder records
  - Resource allocation records
  - Branding tokens
  - Portal audit log
"""

import uuid
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# 1 — Founder Directives & Narrative
# ─────────────────────────────────────────────────────────────────────────────

class FounderDirective(models.Model):
    """Editable markdown directives pinned by the founder."""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('normal', 'Normal'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('draft', 'Draft'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=300)
    content     = models.TextField(help_text='Markdown content')
    priority    = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal', db_index=True)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active', db_index=True)
    pinned      = models.BooleanField(default=False, db_index=True)
    author      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='directives')
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-pinned', '-created_at']
        verbose_name = 'Founder Directive'

    def __str__(self):
        return f'[{self.priority.upper()}] {self.title}'


class CulturalGuideline(models.Model):
    """Cultural guidelines and motivational notes."""
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=300)
    content     = models.TextField()
    category    = models.CharField(max_length=60, default='general', db_index=True)
    pinned      = models.BooleanField(default=False)
    author      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-pinned', '-created_at']
        verbose_name = 'Cultural Guideline'

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────────────────
# 2 — Investor & Stakeholder Hub
# ─────────────────────────────────────────────────────────────────────────────

class InvestorDocument(models.Model):
    """Secure document repository for pitch decks, compliance files."""
    DOC_TYPE_CHOICES = [
        ('pitch_deck', 'Pitch Deck'),
        ('compliance', 'Compliance Document'),
        ('financial_report', 'Financial Report'),
        ('legal', 'Legal Agreement'),
        ('update', 'Investor Update'),
        ('other', 'Other'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title        = models.CharField(max_length=300)
    doc_type     = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, db_index=True)
    description  = models.TextField(blank=True)
    file_url     = models.URLField(max_length=600, blank=True)
    version      = models.CharField(max_length=20, default='1.0')
    confidential = models.BooleanField(default=True)
    uploaded_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Investor Document'

    def __str__(self):
        return f'{self.title} (v{self.version})'


class Stakeholder(models.Model):
    """Stakeholder and investor registry."""
    ROLE_CHOICES = [
        ('investor', 'Investor'),
        ('advisor', 'Advisor'),
        ('board_member', 'Board Member'),
        ('partner', 'Partner'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=200)
    email       = models.EmailField(max_length=200, blank=True)
    role        = models.CharField(max_length=20, choices=ROLE_CHOICES, default='investor', db_index=True)
    company     = models.CharField(max_length=200, blank=True)
    investment  = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    notes       = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True, db_index=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-investment', 'name']
        verbose_name = 'Stakeholder'

    def __str__(self):
        return f'{self.name} ({self.role})'


# ─────────────────────────────────────────────────────────────────────────────
# 3 — Resource Allocation
# ─────────────────────────────────────────────────────────────────────────────

class ResourceAllocation(models.Model):
    """Developer / infrastructure resource allocation records."""
    RESOURCE_TYPE_CHOICES = [
        ('compute', 'Compute Instance'),
        ('storage', 'Storage Volume'),
        ('database', 'Database'),
        ('container', 'Container Registry'),
        ('domain', 'Domain'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('provisioning', 'Provisioning'),
        ('decommissioned', 'Decommissioned'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource_type   = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, db_index=True)
    hostname        = models.CharField(max_length=200, blank=True)
    assigned_to     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resource_allocations')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    storage_quota   = models.CharField(max_length=30, blank=True, help_text='e.g. 100GB')
    region          = models.CharField(max_length=60, blank=True)
    metadata        = models.JSONField(default=dict, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resource Allocation'

    def __str__(self):
        return f'{self.resource_type}: {self.hostname or self.id}'


# ─────────────────────────────────────────────────────────────────────────────
# 4 — Branding Tokens
# ─────────────────────────────────────────────────────────────────────────────

class BrandToken(models.Model):
    """Design system color tokens and brand assets."""
    TOKEN_TYPE_CHOICES = [
        ('color', 'Color Token'),
        ('font', 'Font Family'),
        ('spacing', 'Spacing Unit'),
        ('asset', 'Brand Asset'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=100, unique=True)
    token_type  = models.CharField(max_length=10, choices=TOKEN_TYPE_CHOICES, db_index=True)
    value       = models.CharField(max_length=200, help_text='CSS value, URL, or token value')
    description = models.CharField(max_length=300, blank=True)
    is_active   = models.BooleanField(default=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['token_type', 'name']
        verbose_name = 'Brand Token'

    def __str__(self):
        return f'{self.name}: {self.value}'


# ─────────────────────────────────────────────────────────────────────────────
# 5 — Portal Audit Log
# ─────────────────────────────────────────────────────────────────────────────

class PortalAuditLog(models.Model):
    """Immutable audit trail for portal actions."""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type    = models.CharField(max_length=60, db_index=True)
    actor         = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    description   = models.TextField()
    severity      = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info', db_index=True)
    module        = models.CharField(max_length=60, blank=True, db_index=True)
    metadata      = models.JSONField(default=dict, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Portal Audit Log'

    def save(self, *args, **kwargs):
        if self.pk and PortalAuditLog.objects.filter(pk=self.pk).exists():
            raise ValueError('Audit log entries are immutable.')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.severity.upper()}] {self.event_type} — {self.created_at}'
