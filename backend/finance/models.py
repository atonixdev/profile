"""
AtonixCorp — Financial Dashboard Models

Extends the billing ledger with enterprise financial intelligence:
  - Department / Team cost tracking
  - Budget & Forecasting
  - Vendor & Procurement
  - Multi-currency exchange rates
  - Compliance & Audit enrichment
"""

import uuid
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# 1 — Currency & Exchange Rates
# ─────────────────────────────────────────────────────────────────────────────

class CurrencyRate(models.Model):
    """Daily exchange rates for multi-currency support."""
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    base_currency = models.CharField(max_length=3, default='USD', db_index=True)
    target_currency = models.CharField(max_length=3, db_index=True)
    rate          = models.DecimalField(max_digits=16, decimal_places=8)
    effective_date = models.DateField(db_index=True)
    source        = models.CharField(max_length=60, default='manual')
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date']
        unique_together = [('base_currency', 'target_currency', 'effective_date')]
        verbose_name = 'Currency Rate'

    def __str__(self):
        return f'{self.base_currency}/{self.target_currency} = {self.rate} ({self.effective_date})'


# ─────────────────────────────────────────────────────────────────────────────
# 2 — Department & Team Financial Tracking
# ─────────────────────────────────────────────────────────────────────────────

class Department(models.Model):
    """Internal departments for cost allocation."""
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=200, unique=True)
    code        = models.CharField(max_length=20, unique=True, db_index=True)
    head        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    parent      = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_departments')
    is_active   = models.BooleanField(default=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Department'

    def __str__(self):
        return f'{self.code} — {self.name}'


class DepartmentExpense(models.Model):
    """Expense entries for departments."""
    CATEGORY_CHOICES = [
        ('payroll',       'Payroll'),
        ('cloud',         'Cloud Infrastructure'),
        ('software',      'Software Licenses'),
        ('marketing',     'Marketing'),
        ('operations',    'Operations'),
        ('support',       'Support'),
        ('travel',        'Travel'),
        ('equipment',     'Equipment'),
        ('consulting',    'Consulting'),
        ('other',         'Other'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department  = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='expenses')
    category    = models.CharField(max_length=30, choices=CATEGORY_CHOICES, db_index=True)
    description = models.CharField(max_length=500)
    amount      = models.DecimalField(max_digits=16, decimal_places=2)
    currency    = models.CharField(max_length=3, default='USD')
    period_start = models.DateField(db_index=True)
    period_end  = models.DateField()
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_start']
        verbose_name = 'Department Expense'
        indexes = [
            models.Index(fields=['department', 'category', '-period_start']),
        ]

    def __str__(self):
        return f'{self.department.code} — {self.category} — ${self.amount}'


# ─────────────────────────────────────────────────────────────────────────────
# 3 — Budget & Forecasting
# ─────────────────────────────────────────────────────────────────────────────

class Budget(models.Model):
    """Annual/quarterly budget allocations."""
    PERIOD_CHOICES = [
        ('annual',  'Annual'),
        ('q1',      'Q1'),
        ('q2',      'Q2'),
        ('q3',      'Q3'),
        ('q4',      'Q4'),
        ('monthly', 'Monthly'),
    ]
    STATUS_CHOICES = [
        ('draft',    'Draft'),
        ('approved', 'Approved'),
        ('active',   'Active'),
        ('closed',   'Closed'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name         = models.CharField(max_length=300)
    department   = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, related_name='budgets')
    fiscal_year  = models.IntegerField(db_index=True)
    period       = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='annual')
    allocated    = models.DecimalField(max_digits=16, decimal_places=2, help_text='Total budget allocated')
    spent        = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'), help_text='Amount spent so far')
    currency     = models.CharField(max_length=3, default='USD')
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', db_index=True)
    notes        = models.TextField(blank=True)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fiscal_year', 'period']
        verbose_name = 'Budget'
        indexes = [
            models.Index(fields=['fiscal_year', 'status']),
        ]

    @property
    def remaining(self):
        return self.allocated - self.spent

    @property
    def utilization_pct(self):
        if self.allocated == 0:
            return Decimal('0')
        return round((self.spent / self.allocated) * 100, 2)

    def __str__(self):
        return f'{self.name} — FY{self.fiscal_year} {self.period.upper()} — ${self.allocated}'


class Forecast(models.Model):
    """Financial forecasts and scenario models."""
    SCENARIO_CHOICES = [
        ('baseline',    'Baseline'),
        ('optimistic',  'Optimistic'),
        ('pessimistic', 'Pessimistic'),
        ('stretch',     'Stretch'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name            = models.CharField(max_length=300)
    fiscal_year     = models.IntegerField(db_index=True)
    scenario        = models.CharField(max_length=20, choices=SCENARIO_CHOICES, default='baseline')
    projected_revenue = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    projected_cost  = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    projected_profit = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0'))
    assumptions     = models.TextField(blank=True)
    currency        = models.CharField(max_length=3, default='USD')
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata        = models.JSONField(default=dict, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fiscal_year', 'scenario']
        verbose_name = 'Forecast'

    def __str__(self):
        return f'{self.name} — FY{self.fiscal_year} [{self.scenario.upper()}]'


# ─────────────────────────────────────────────────────────────────────────────
# 4 — Vendor & Procurement
# ─────────────────────────────────────────────────────────────────────────────

class Vendor(models.Model):
    """External vendor registry."""
    STATUS_CHOICES = [
        ('active',    'Active'),
        ('inactive',  'Inactive'),
        ('suspended', 'Suspended'),
        ('pending',   'Pending Review'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name          = models.CharField(max_length=300, db_index=True)
    code          = models.CharField(max_length=20, unique=True, db_index=True)
    category      = models.CharField(max_length=100, blank=True)
    contact_name  = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    risk_score    = models.IntegerField(default=0, help_text='0-100, higher = more risk')
    metadata      = models.JSONField(default=dict, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Vendor'

    def __str__(self):
        return f'{self.code} — {self.name}'


class VendorContract(models.Model):
    """Vendor contracts and agreements."""
    STATUS_CHOICES = [
        ('draft',    'Draft'),
        ('active',   'Active'),
        ('expired',  'Expired'),
        ('terminated', 'Terminated'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor          = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='contracts')
    contract_number = models.CharField(max_length=60, unique=True, db_index=True)
    title           = models.CharField(max_length=300)
    total_value     = models.DecimalField(max_digits=16, decimal_places=2)
    currency        = models.CharField(max_length=3, default='USD')
    start_date      = models.DateField()
    end_date        = models.DateField()
    payment_terms   = models.CharField(max_length=100, blank=True)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    notes           = models.TextField(blank=True)
    metadata        = models.JSONField(default=dict, blank=True)
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Vendor Contract'

    def __str__(self):
        return f'{self.contract_number} — {self.vendor.name} — ${self.total_value}'


class ProcurementRequest(models.Model):
    """Procurement requests and approvals."""
    STATUS_CHOICES = [
        ('draft',      'Draft'),
        ('submitted',  'Submitted'),
        ('approved',   'Approved'),
        ('rejected',   'Rejected'),
        ('ordered',    'Ordered'),
        ('received',   'Received'),
        ('cancelled',  'Cancelled'),
    ]
    PRIORITY_CHOICES = [
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
        ('urgent', 'Urgent'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_number  = models.CharField(max_length=30, unique=True, db_index=True)
    vendor          = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='procurement_requests')
    department      = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='procurement_requests')
    title           = models.CharField(max_length=300)
    description     = models.TextField(blank=True)
    amount          = models.DecimalField(max_digits=16, decimal_places=2)
    currency        = models.CharField(max_length=3, default='USD')
    priority        = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    requested_by    = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='procurement_requests')
    approved_by     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_procurements')
    metadata        = models.JSONField(default=dict, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Procurement Request'
        indexes = [
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f'{self.request_number} — {self.title} — ${self.amount}'


# ─────────────────────────────────────────────────────────────────────────────
# 5 — Compliance & Audit Extensions
# ─────────────────────────────────────────────────────────────────────────────

class ComplianceCheck(models.Model):
    """Compliance check records against regulatory frameworks."""
    FRAMEWORK_CHOICES = [
        ('pci_dss', 'PCI-DSS'),
        ('soc2',    'SOC 2'),
        ('gdpr',    'GDPR'),
        ('popia',   'POPIA'),
        ('internal', 'Internal Policy'),
    ]
    STATUS_CHOICES = [
        ('compliant',     'Compliant'),
        ('non_compliant', 'Non-Compliant'),
        ('in_review',     'In Review'),
        ('remediation',   'Remediation'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    framework   = models.CharField(max_length=20, choices=FRAMEWORK_CHOICES, db_index=True)
    check_name  = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_review', db_index=True)
    risk_level  = models.IntegerField(default=0, help_text='0-100 risk score')
    findings    = models.TextField(blank=True)
    remediation = models.TextField(blank=True)
    checked_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    checked_at  = models.DateTimeField(null=True, blank=True)
    next_review = models.DateField(null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Compliance Check'
        indexes = [
            models.Index(fields=['framework', 'status']),
        ]

    def __str__(self):
        return f'[{self.framework.upper()}] {self.check_name} — {self.status}'


class FinancialAuditLog(models.Model):
    """Immutable financial audit log — extends billing audit with finance-specific entries."""
    SEVERITY_CHOICES = [
        ('info',     'Info'),
        ('low',      'Low'),
        ('medium',   'Medium'),
        ('high',     'High'),
        ('critical', 'Critical'),
    ]
    CATEGORY_CHOICES = [
        ('budget',       'Budget'),
        ('forecast',     'Forecast'),
        ('department',   'Department'),
        ('vendor',       'Vendor'),
        ('procurement',  'Procurement'),
        ('compliance',   'Compliance'),
        ('currency',     'Currency'),
        ('reconciliation', 'Reconciliation'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    actor_label = models.CharField(max_length=200, blank=True)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    action      = models.CharField(max_length=120, db_index=True)
    target      = models.CharField(max_length=300, blank=True)
    severity    = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info', db_index=True)
    details     = models.TextField(blank=True)
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Financial Audit Log'
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['severity', '-created_at']),
        ]

    def save(self, *args, **kwargs):
        if self.pk and FinancialAuditLog.objects.filter(pk=self.pk).exists():
            raise ValueError('FinancialAuditLog is immutable.')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.severity.upper()}] {self.category}/{self.action} — {self.target}'
