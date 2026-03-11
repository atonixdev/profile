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


# ─────────────────────────────────────────────────────────────────────────────
# 6 — Tasks (Kanban) & OKRs
# ─────────────────────────────────────────────────────────────────────────────

class Task(models.Model):
    """Kanban-style task for team management."""
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review'),
        ('done', 'Done'),
    ]
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('normal', 'Normal'),
        ('low', 'Low'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo', db_index=True)
    priority    = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal', db_index=True)
    assignee    = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='portal_tasks')
    department  = models.CharField(max_length=100, blank=True)
    due_date    = models.DateField(null=True, blank=True)
    position    = models.IntegerField(default=0)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', '-created_at']
        verbose_name = 'Task'

    def __str__(self):
        return f'[{self.status}] {self.title}'


class OKR(models.Model):
    """Objectives and Key Results for performance tracking."""
    STATUS_CHOICES = [
        ('on_track', 'On Track'),
        ('at_risk', 'At Risk'),
        ('behind', 'Behind'),
        ('completed', 'Completed'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objective   = models.CharField(max_length=400)
    owner       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='okrs')
    quarter     = models.CharField(max_length=10, help_text='e.g. Q1-2026')
    status      = models.CharField(max_length=12, choices=STATUS_CHOICES, default='on_track', db_index=True)
    progress    = models.IntegerField(default=0, help_text='0-100 percent')
    key_results = models.JSONField(default=list, blank=True, help_text='List of key result dicts')
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'OKR'

    def __str__(self):
        return f'[{self.quarter}] {self.objective}'


# ─────────────────────────────────────────────────────────────────────────────
# 7 — Secure Messaging
# ─────────────────────────────────────────────────────────────────────────────

class SecureMessage(models.Model):
    """End-to-end encrypted messaging for investor communications."""
    CHANNEL_CHOICES = [
        ('investor', 'Investor Channel'),
        ('board', 'Board Channel'),
        ('executive', 'Executive Channel'),
        ('general', 'General'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel    = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='general', db_index=True)
    sender     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_portal_messages')
    subject    = models.CharField(max_length=300, blank=True)
    body       = models.TextField()
    is_read    = models.BooleanField(default=False)
    metadata   = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Secure Message'

    def __str__(self):
        return f'[{self.channel}] {self.subject or "No subject"}'


# ─────────────────────────────────────────────────────────────────────────────
# 8 — Deployments & Monitoring
# ─────────────────────────────────────────────────────────────────────────────

class Deployment(models.Model):
    """CI/CD deployment tracking."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('building', 'Building'),
        ('deploying', 'Deploying'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('rolled_back', 'Rolled Back'),
    ]
    ENV_CHOICES = [
        ('production', 'Production'),
        ('staging', 'Staging'),
        ('development', 'Development'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service       = models.CharField(max_length=100)
    version       = models.CharField(max_length=50, blank=True)
    environment   = models.CharField(max_length=20, choices=ENV_CHOICES, default='production', db_index=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    commit_sha    = models.CharField(max_length=40, blank=True)
    branch        = models.CharField(max_length=100, blank=True)
    triggered_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    duration_secs = models.IntegerField(null=True, blank=True)
    logs          = models.TextField(blank=True)
    metadata      = models.JSONField(default=dict, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Deployment'

    def __str__(self):
        return f'{self.service} → {self.environment} [{self.status}]'


class MonitoringAlert(models.Model):
    """System monitoring alerts and uptime tracking."""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    service     = models.CharField(max_length=100, db_index=True)
    severity    = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info', db_index=True)
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active', db_index=True)
    metric_name = models.CharField(max_length=100, blank=True)
    metric_value = models.CharField(max_length=50, blank=True)
    threshold   = models.CharField(max_length=50, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Monitoring Alert'

    def __str__(self):
        return f'[{self.severity.upper()}] {self.title}'


# ─────────────────────────────────────────────────────────────────────────────
# 9 — Campaign & Marketing
# ─────────────────────────────────────────────────────────────────────────────

class Campaign(models.Model):
    """Marketing campaign tracking with scheduling."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]
    CHANNEL_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter/X'),
        ('github', 'GitHub'),
        ('blog', 'Blog'),
        ('newsletter', 'Newsletter'),
        ('product_hunt', 'Product Hunt'),
        ('multi', 'Multi-Channel'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name          = models.CharField(max_length=300)
    description   = models.TextField(blank=True)
    channel       = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='multi', db_index=True)
    status        = models.CharField(max_length=12, choices=STATUS_CHOICES, default='draft', db_index=True)
    start_date    = models.DateField(null=True, blank=True)
    end_date      = models.DateField(null=True, blank=True)
    budget        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    spend         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    impressions   = models.IntegerField(default=0)
    clicks        = models.IntegerField(default=0)
    conversions   = models.IntegerField(default=0)
    revenue       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    metadata      = models.JSONField(default=dict, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Campaign'

    def __str__(self):
        return f'{self.name} [{self.channel}]'

    @property
    def roi(self):
        if self.spend and self.spend > 0:
            return float((self.revenue - self.spend) / self.spend * 100)
        return 0.0

    @property
    def ctr(self):
        if self.impressions > 0:
            return round(self.clicks / self.impressions * 100, 2)
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# 10 — Design Standards
# ─────────────────────────────────────────────────────────────────────────────

class DesignStandard(models.Model):
    """UI/UX design standards and guidelines document."""
    CATEGORY_CHOICES = [
        ('component', 'Component Guidelines'),
        ('layout', 'Layout Standards'),
        ('interaction', 'Interaction Patterns'),
        ('accessibility', 'Accessibility'),
        ('responsive', 'Responsive Design'),
        ('general', 'General'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=300)
    content     = models.TextField(help_text='Markdown content')
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general', db_index=True)
    version     = models.CharField(max_length=20, default='1.0')
    is_active   = models.BooleanField(default=True)
    figma_url   = models.URLField(max_length=600, blank=True, help_text='Link to Figma design file')
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', '-created_at']
        verbose_name = 'Design Standard'

    def __str__(self):
        return f'[{self.category}] {self.title}'


# ─────────────────────────────────────────────────────────────────────────────
# 11 — Investor Updates (Automated Emails)
# ─────────────────────────────────────────────────────────────────────────────

class InvestorUpdate(models.Model):
    """Automated investor update emails."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject      = models.CharField(max_length=300)
    body         = models.TextField(help_text='Markdown body')
    status       = models.CharField(max_length=12, choices=STATUS_CHOICES, default='draft', db_index=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at      = models.DateTimeField(null=True, blank=True)
    recipients   = models.JSONField(default=list, blank=True, help_text='List of stakeholder IDs')
    author       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Investor Update'

    def __str__(self):
        return f'[{self.status}] {self.subject}'


# ─────────────────────────────────────────────────────────────────────────────
# 12 — Integration Registry
# ─────────────────────────────────────────────────────────────────────────────

class IntegrationConfig(models.Model):
    """Third-party integration configurations."""
    PROVIDER_CHOICES = [
        ('stripe', 'Stripe'),
        ('aws', 'Amazon Web Services'),
        ('azure', 'Microsoft Azure'),
        ('figma', 'Figma'),
        ('github', 'GitHub'),
        ('linkedin', 'LinkedIn'),
        ('graphql', 'GraphQL Gateway'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider    = models.CharField(max_length=20, choices=PROVIDER_CHOICES, unique=True)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive', db_index=True)
    endpoint    = models.URLField(max_length=600, blank=True)
    config      = models.JSONField(default=dict, blank=True, help_text='Non-secret config')
    last_synced = models.DateTimeField(null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['provider']
        verbose_name = 'Integration Config'

    def __str__(self):
        return f'{self.get_provider_display()} [{self.status}]'


# ─────────────────────────────────────────────────────────────────────────────
# 16 — Working Dashboard Registry & Permissions
# ─────────────────────────────────────────────────────────────────────────────

class DashboardRegistry(models.Model):
    """Central registry of every dashboard/console in the platform."""
    CATEGORY_CHOICES = [
        ('founder',    'Founder Portal'),
        ('finance',    'Finance & Billing'),
        ('operations', 'Operations'),
        ('admin',      'Administration'),
        ('product',    'Product'),
        ('public',     'Public'),
    ]
    ACCESS_CHOICES = [
        ('founder',    'Founder Only'),
        ('staff',      'Staff'),
        ('any_auth',   'Any Authenticated'),
        ('public',     'Public'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code         = models.CharField(max_length=10, unique=True, help_text='Short code e.g. EXC, BRD')
    name         = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    url_path     = models.CharField(max_length=300, help_text='Frontend route e.g. /founder-portal/investor')
    category     = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default='founder', db_index=True)
    default_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default='staff', db_index=True)
    accent_color = models.CharField(max_length=10, default='#A81D37')
    is_active    = models.BooleanField(default=True, db_index=True)
    sort_order   = models.PositiveIntegerField(default=0, db_index=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Dashboard Registry'
        verbose_name_plural = 'Dashboard Registry'

    def __str__(self):
        return f'[{self.code}] {self.name}'


class DashboardPermission(models.Model):
    """Explicit per-user dashboard access granted by a founder."""
    ACCESS_CHOICES = [
        ('view',  'View'),
        ('edit',  'Edit'),
        ('admin', 'Admin'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dashboard   = models.ForeignKey(DashboardRegistry, on_delete=models.CASCADE, related_name='permissions')
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_permissions')
    access_level = models.CharField(max_length=6, choices=ACCESS_CHOICES, default='view')
    granted_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_permissions')
    granted_at  = models.DateTimeField(auto_now_add=True)
    notes       = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ['-granted_at']
        unique_together = [('dashboard', 'user')]
        verbose_name = 'Dashboard Permission'

    def __str__(self):
        return f'{self.user.username} → {self.dashboard.code} [{self.access_level}]'
