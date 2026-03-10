"""
AtonixDev Billing & Usage Dashboard
Layer 1 + Layer 2 + Layer 3 Data Models

Hierarchy:
  Organization (tenant)
    ├── UsageEvent     — Layer 1: raw events from every service
    ├── LedgerEntry    — Layer 3: immutable financial ledger
    ├── Invoice        — Layer 3: aggregated invoices
    ├── InvoiceLineItem
    ├── Credit         — Layer 3: credits / adjustments / refunds
    ├── Payment        — Layer 3: recorded payments
    └── OrgBalance     — Layer 3: computed balance snapshot

  PricingRule          — Layer 2: versioned, immutable-once-applied pricing
  BillingAuditLog      — cross-cutting: admin & billing action trail
"""

import uuid
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# 0 — Organization (tenant)
# ─────────────────────────────────────────────────────────────────────────────

class Organization(models.Model):
    PLAN_CHOICES = [
        ('starter',    'Starter'),
        ('pro',        'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    STATUS_CHOICES = [
        ('active',     'Active'),
        ('trial',      'Trial'),
        ('suspended',  'Suspended'),
        ('pending',    'Pending'),
        ('closed',     'Closed'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=255, db_index=True)
    slug        = models.SlugField(max_length=120, unique=True)
    plan        = models.CharField(max_length=20, choices=PLAN_CHOICES, default='starter', db_index=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    owner       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_orgs')
    members     = models.ManyToManyField(User, blank=True, related_name='member_orgs')
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'

    @property
    def org_ref(self):
        return f'ORG-{str(self.id)[:6].upper()}'

    def __str__(self):
        return f'{self.name} [{self.plan.upper()}]'


# ─────────────────────────────────────────────────────────────────────────────
# 1 — Pricing Rules (Layer 2 — versioned, immutable once applied)
# ─────────────────────────────────────────────────────────────────────────────

class PricingRule(models.Model):
    SERVICE_CHOICES = [
        ('compute',    'Compute'),
        ('storage',    'Storage'),
        ('email',      'Email Delivery'),
        ('domain',     'Domains & DNS'),
        ('pipeline',   'CI/CD Pipelines'),
        ('networking', 'Networking'),
        ('monitoring', 'Monitoring'),
        ('auth',       'Authentication'),
        ('secrets',    'Secrets Management'),
    ]
    UNIT_CHOICES = [
        ('vm_hour',       'VM Hour'),
        ('gb',            'Gigabyte'),
        ('email',         'Email'),
        ('domain',        'Domain'),
        ('pipeline_run',  'Pipeline Run'),
        ('gb_transfer',   'GB Transfer'),
        ('agent_hour',    'Agent Hour'),
        ('api_call',      'API Call'),
        ('key',           'Secret Key'),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service        = models.CharField(max_length=30, choices=SERVICE_CHOICES, db_index=True)
    unit_type      = models.CharField(max_length=30, choices=UNIT_CHOICES)
    unit_price     = models.DecimalField(max_digits=12, decimal_places=6)
    currency       = models.CharField(max_length=3, default='USD')
    version        = models.PositiveIntegerField(default=1)
    is_active      = models.BooleanField(default=True, db_index=True)
    effective_from = models.DateTimeField(default=timezone.now)
    effective_to   = models.DateTimeField(null=True, blank=True)
    notes          = models.TextField(blank=True)
    created_by     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pricing Rule'
        unique_together = [('service', 'unit_type', 'version')]
        indexes = [
            models.Index(fields=['service', 'is_active']),
        ]

    def __str__(self):
        return f'{self.service}/{self.unit_type} @ ${self.unit_price} (v{self.version})'


# ─────────────────────────────────────────────────────────────────────────────
# 2 — UsageEvent (Layer 1 — raw event from any service)
# ─────────────────────────────────────────────────────────────────────────────

class UsageEvent(models.Model):
    SERVICE_CHOICES = PricingRule.SERVICE_CHOICES
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('processed', 'Processed'),
        ('rejected',  'Rejected'),
        ('duplicate', 'Duplicate'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Idempotency: callers supply their own event_id to prevent duplicates
    event_id            = models.UUIDField(unique=True, db_index=True)
    service             = models.CharField(max_length=30, choices=SERVICE_CHOICES, db_index=True)
    event_type          = models.CharField(max_length=80, db_index=True)
    organization        = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='usage_events', null=True, blank=True)
    organization_id_raw = models.CharField(max_length=120, blank=True)
    user                = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='usage_events')
    project_id          = models.CharField(max_length=120, blank=True, db_index=True)
    units               = models.DecimalField(max_digits=20, decimal_places=6)
    unit_type           = models.CharField(max_length=30)
    unit_price          = models.DecimalField(max_digits=12, decimal_places=6, default=Decimal('0'))
    total_cost          = models.DecimalField(max_digits=16, decimal_places=6, default=Decimal('0'))
    pricing_rule        = models.ForeignKey(PricingRule, on_delete=models.SET_NULL, null=True, blank=True)
    metadata            = models.JSONField(default=dict, blank=True)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    rejection_reason    = models.TextField(blank=True)
    source_ip           = models.GenericIPAddressField(null=True, blank=True)
    event_timestamp     = models.DateTimeField(db_index=True)
    received_at         = models.DateTimeField(auto_now_add=True)
    processed_at        = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-event_timestamp']
        verbose_name = 'Usage Event'
        indexes = [
            models.Index(fields=['organization', 'service', '-event_timestamp']),
            models.Index(fields=['status', '-received_at']),
            models.Index(fields=['service', '-event_timestamp']),
        ]

    def __str__(self):
        return f'[{self.service}] {self.event_type} — {self.organization_id_raw} @ {self.event_timestamp}'


# ─────────────────────────────────────────────────────────────────────────────
# 3 — LedgerEntry (Layer 3 — immutable financial ledger)
# ─────────────────────────────────────────────────────────────────────────────

class LedgerEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('charge',     'Charge'),
        ('payment',    'Payment'),
        ('credit',     'Credit'),
        ('refund',     'Refund'),
        ('adjustment', 'Adjustment'),
        ('promo',      'Promotional Credit'),
        ('void',       'Void'),
        ('writeoff',   'Write-Off'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seq             = models.PositiveBigIntegerField(unique=True, db_index=True, null=True, blank=True)
    event           = models.ForeignKey(UsageEvent, on_delete=models.SET_NULL, null=True, blank=True, related_name='ledger_entries')
    organization    = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='ledger_entries')
    user            = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    entry_type      = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES, db_index=True)
    service         = models.CharField(max_length=30, blank=True, db_index=True)
    unit_type       = models.CharField(max_length=30, blank=True)
    units           = models.DecimalField(max_digits=20, decimal_places=6, default=Decimal('0'))
    unit_price      = models.DecimalField(max_digits=12, decimal_places=6, default=Decimal('0'))
    # Positive = debit (org owes us), Negative = credit (we owe org)
    amount          = models.DecimalField(max_digits=16, decimal_places=2, db_index=True)
    running_balance = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    currency        = models.CharField(max_length=3, default='USD')
    reference       = models.CharField(max_length=60, blank=True, db_index=True)
    note            = models.TextField(blank=True)
    metadata        = models.JSONField(default=dict, blank=True)
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_ledger_entries')
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ledger Entry'
        indexes = [
            models.Index(fields=['organization', '-created_at']),
            models.Index(fields=['entry_type', '-created_at']),
            models.Index(fields=['service', '-created_at']),
        ]

    def save(self, *args, **kwargs):
        if self.pk and LedgerEntry.objects.filter(pk=self.pk).exists():
            raise ValueError('LedgerEntry is immutable. Create a correcting entry instead.')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.entry_type.upper()}] {self.organization} {self.amount:+} @ {self.created_at:%Y-%m-%d %H:%M}'


# ─────────────────────────────────────────────────────────────────────────────
# 4 — Invoice (Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft',       'Draft'),
        ('issued',      'Issued'),
        ('paid',        'Paid'),
        ('outstanding', 'Outstanding'),
        ('overdue',     'Overdue'),
        ('void',        'Void'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number  = models.CharField(max_length=30, unique=True, db_index=True)
    organization    = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='invoices')
    period_start    = models.DateField()
    period_end      = models.DateField()
    subtotal        = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    credits_applied = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    total           = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    currency        = models.CharField(max_length=3, default='USD')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    issued_at       = models.DateTimeField(null=True, blank=True)
    due_date        = models.DateField(null=True, blank=True)
    paid_at         = models.DateTimeField(null=True, blank=True)
    notes           = models.TextField(blank=True)
    pdf_url         = models.URLField(blank=True)
    metadata        = models.JSONField(default=dict, blank=True)
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        indexes = [
            models.Index(fields=['organization', 'status', '-created_at']),
            models.Index(fields=['status', 'due_date']),
        ]

    def __str__(self):
        return f'{self.invoice_number} — {self.organization.name} — {self.status.upper()}'


class InvoiceLineItem(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice     = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    service     = models.CharField(max_length=30)
    description = models.CharField(max_length=300)
    unit_type   = models.CharField(max_length=30)
    units       = models.DecimalField(max_digits=20, decimal_places=6)
    unit_price  = models.DecimalField(max_digits=12, decimal_places=6)
    amount      = models.DecimalField(max_digits=16, decimal_places=2)

    class Meta:
        ordering = ['service']

    def __str__(self):
        return f'{self.invoice.invoice_number} — {self.service} — {self.amount}'


# ─────────────────────────────────────────────────────────────────────────────
# 5 — Credit (Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class Credit(models.Model):
    TYPE_CHOICES = [
        ('credit',     'Service Credit'),
        ('adjustment', 'Billing Adjustment'),
        ('refund',     'Refund'),
        ('promo',      'Promotional Credit'),
    ]
    STATUS_CHOICES = [
        ('active',  'Active'),
        ('applied', 'Applied'),
        ('expired', 'Expired'),
        ('void',    'Void'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credit_number = models.CharField(max_length=30, unique=True, db_index=True)
    organization  = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='credits')
    credit_type   = models.CharField(max_length=20, choices=TYPE_CHOICES, default='credit', db_index=True)
    amount        = models.DecimalField(max_digits=16, decimal_places=2)
    currency      = models.CharField(max_length=3, default='USD')
    reason        = models.TextField()
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    applied_to    = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='applied_credits')
    expires_at    = models.DateField(null=True, blank=True)
    issued_by     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata      = models.JSONField(default=dict, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Credit'

    def __str__(self):
        return f'{self.credit_number} — {self.organization.name} — ${self.amount}'


# ─────────────────────────────────────────────────────────────────────────────
# 6 — Payment (Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class Payment(models.Model):
    METHOD_CHOICES = [
        ('card',     'Card'),
        ('wire',     'Wire Transfer'),
        ('ach',      'ACH'),
        ('crypto',   'Cryptocurrency'),
        ('internal', 'Internal Credit'),
    ]
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('cleared',  'Cleared'),
        ('failed',   'Failed'),
        ('refunded', 'Refunded'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='payments')
    invoice      = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount       = models.DecimalField(max_digits=16, decimal_places=2)
    currency     = models.CharField(max_length=3, default='USD')
    method       = models.CharField(max_length=20, choices=METHOD_CHOICES, default='card')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    reference    = models.CharField(max_length=120, blank=True)
    notes        = models.TextField(blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    paid_at      = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'

    def __str__(self):
        return f'Payment {self.organization.name} ${self.amount} [{self.status}]'


# ─────────────────────────────────────────────────────────────────────────────
# 7 — OrgBalance (Layer 3 — computed snapshot)
# ─────────────────────────────────────────────────────────────────────────────

class OrgBalance(models.Model):
    organization   = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='balance')
    total_charges  = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    total_payments = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    total_credits  = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    outstanding    = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    currency       = models.CharField(max_length=3, default='USD')
    last_computed  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Organization Balance'

    def __str__(self):
        return f'{self.organization.name} — outstanding: ${self.outstanding}'


# ─────────────────────────────────────────────────────────────────────────────
# 8 — BillingAuditLog (cross-cutting)
# ─────────────────────────────────────────────────────────────────────────────

class BillingAuditLog(models.Model):
    SEVERITY_CHOICES = [
        ('info',   'Info'),
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    actor_label  = models.CharField(max_length=200, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action       = models.CharField(max_length=80, db_index=True)
    target       = models.CharField(max_length=300, blank=True)
    severity     = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info', db_index=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Billing Audit Log'
        indexes = [
            models.Index(fields=['severity', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]

    def __str__(self):
        return f'[{self.severity.upper()}] {self.action} — {self.target}'
