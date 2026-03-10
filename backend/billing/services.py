"""
AtonixDev Billing & Usage Dashboard
Layer 2 — Billing Aggregation Layer

Components:
  EventConsumer       — validate, deduplicate, enforce idempotency
  UsageNormalizer     — convert raw event units to billing units
  CostCalculator      — apply versioned pricing rules
  LedgerWriter        — write immutable ledger entries
  BalanceEngine       — recompute OrgBalance snapshots
  InvoiceGenerator    — aggregate ledger entries into invoices
"""

import uuid
import logging
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction, models
from django.utils import timezone

from .models import (
    BillingAuditLog,
    Credit,
    Invoice,
    InvoiceLineItem,
    LedgerEntry,
    OrgBalance,
    Organization,
    Payment,
    PricingRule,
    UsageEvent,
)

log = logging.getLogger('billing')

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

_CENT = Decimal('0.01')


def _round(value: Decimal) -> Decimal:
    return value.quantize(_CENT, rounding=ROUND_HALF_UP)


def _next_seq() -> int:
    last = LedgerEntry.objects.order_by('-seq').values_list('seq', flat=True).first()
    return (last or 0) + 1


def _next_invoice_number() -> str:
    last = Invoice.objects.order_by('-created_at').values_list('invoice_number', flat=True).first()
    if last:
        try:
            n = int(last.split('-')[1]) + 1
        except (IndexError, ValueError):
            n = 1001
    else:
        n = 1001
    return f'INV-{n}'


def _next_credit_number() -> str:
    last = Credit.objects.order_by('-created_at').values_list('credit_number', flat=True).first()
    if last:
        try:
            n = int(last.split('-')[1]) + 1
        except (IndexError, ValueError):
            n = 100
    else:
        n = 100
    return f'CRD-{n:04d}'


# ─────────────────────────────────────────────────────────────────────────────
# A — Event Consumer (Layer 2)
# ─────────────────────────────────────────────────────────────────────────────

class EventConsumer:
    """
    Validate schema, deduplicate events, enforce idempotency.
    Callers supply a payload dict matching the UsageEvent schema.
    Returns the (UsageEvent, created) tuple.
    """

    REQUIRED_FIELDS = {
        'event_id', 'service', 'event_type',
        'units', 'unit_type', 'timestamp',
    }
    VALID_SERVICES = {c[0] for c in PricingRule.SERVICE_CHOICES}

    @classmethod
    def ingest(cls, payload: dict, source_ip: str = None) -> tuple:
        """
        Ingest a usage event payload.
        Returns (UsageEvent, created: bool).
        Raises ValueError on schema violation.
        """
        cls._validate(payload)

        event_id = uuid.UUID(str(payload['event_id']))

        # Idempotency check — replay-safe
        existing = UsageEvent.objects.filter(event_id=event_id).first()
        if existing:
            log.info('Duplicate event ignored: %s', event_id)
            existing.status = 'duplicate'
            existing.save(update_fields=['status'])
            return existing, False

        # Resolve org
        org = None
        org_raw = str(payload.get('organization_id', ''))
        if org_raw:
            org = Organization.objects.filter(
                models.Q(id=org_raw) | models.Q(slug=org_raw)
            ).first() if cls._is_uuid(org_raw) else Organization.objects.filter(slug=org_raw).first()

        event = UsageEvent(
            event_id            = event_id,
            service             = payload['service'],
            event_type          = payload['event_type'],
            organization        = org,
            organization_id_raw = org_raw,
            user_id             = payload.get('user_id'),
            project_id          = payload.get('project_id', ''),
            units               = Decimal(str(payload['units'])),
            unit_type           = payload['unit_type'],
            metadata            = payload.get('metadata', {}),
            source_ip           = source_ip,
            event_timestamp     = payload['timestamp'],
            status              = 'pending',
        )
        event.save()
        return event, True

    @classmethod
    def _validate(cls, payload: dict):
        missing = cls.REQUIRED_FIELDS - set(payload.keys())
        if missing:
            raise ValueError(f'Missing required fields: {missing}')
        if payload['service'] not in cls.VALID_SERVICES:
            raise ValueError(f"Unknown service: {payload['service']}")
        try:
            Decimal(str(payload['units']))
        except Exception:
            raise ValueError('units must be numeric')

    @staticmethod
    def _is_uuid(s: str) -> bool:
        try:
            uuid.UUID(s)
            return True
        except ValueError:
            return False


# ─────────────────────────────────────────────────────────────────────────────
# B — Usage Normalizer (Layer 2)
# ─────────────────────────────────────────────────────────────────────────────

# Conversion table: (service, raw_unit_type) → (billing_unit_type, divisor)
NORMALIZATION_TABLE = {
    ('compute', 'seconds'):      ('vm_hour',  Decimal('3600')),
    ('compute', 'minutes'):      ('vm_hour',  Decimal('60')),
    ('compute', 'vm_hour'):      ('vm_hour',  Decimal('1')),
    ('storage', 'bytes'):        ('gb',       Decimal('1073741824')),
    ('storage', 'kb'):           ('gb',       Decimal('1048576')),
    ('storage', 'mb'):           ('gb',       Decimal('1024')),
    ('storage', 'gb'):           ('gb',       Decimal('1')),
    ('email',   'email'):        ('email',    Decimal('1')),
    ('email',   'message'):      ('email',    Decimal('1')),
    ('domain',  'domain'):       ('domain',   Decimal('1')),
    ('pipeline','run'):          ('pipeline_run', Decimal('1')),
    ('pipeline','pipeline_run'): ('pipeline_run', Decimal('1')),
    ('networking', 'bytes'):     ('gb_transfer', Decimal('1073741824')),
    ('networking', 'gb'):        ('gb_transfer', Decimal('1')),
    ('networking', 'gb_transfer'): ('gb_transfer', Decimal('1')),
    ('monitoring', 'seconds'):   ('agent_hour', Decimal('3600')),
    ('monitoring', 'agent_hour'): ('agent_hour', Decimal('1')),
    ('auth',    'api_call'):     ('api_call', Decimal('1')),
    ('secrets', 'key'):          ('key',      Decimal('1')),
}


class UsageNormalizer:
    @staticmethod
    def normalize(service: str, raw_unit_type: str, raw_units: Decimal) -> tuple:
        """
        Returns (billing_unit_type: str, billing_units: Decimal).
        Falls back to identity if no rule is found.
        """
        key = (service, raw_unit_type.lower())
        if key in NORMALIZATION_TABLE:
            billing_unit, divisor = NORMALIZATION_TABLE[key]
            return billing_unit, (raw_units / divisor).quantize(Decimal('0.000001'))
        # Identity fallback
        return raw_unit_type, raw_units


# ─────────────────────────────────────────────────────────────────────────────
# C — Cost Calculator (Layer 2)
# ─────────────────────────────────────────────────────────────────────────────

class CostCalculator:
    @staticmethod
    def get_active_rule(service: str, unit_type: str) -> PricingRule | None:
        """Return the most recent active pricing rule for a service/unit pair."""
        return (
            PricingRule.objects.filter(service=service, unit_type=unit_type, is_active=True)
            .order_by('-version')
            .first()
        )

    @classmethod
    def calculate(cls, service: str, unit_type: str, units: Decimal) -> tuple:
        """
        Returns (unit_price: Decimal, total_cost: Decimal, rule: PricingRule|None).
        """
        rule = cls.get_active_rule(service, unit_type)
        if not rule:
            return Decimal('0'), Decimal('0'), None
        total = _round(rule.unit_price * units)
        return rule.unit_price, total, rule


# ─────────────────────────────────────────────────────────────────────────────
# D — Ledger Writer (Layer 2 → Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class LedgerWriter:
    @staticmethod
    @transaction.atomic
    def write_charge(
        organization: Organization,
        amount: Decimal,
        service: str = '',
        unit_type: str = '',
        units: Decimal = Decimal('0'),
        unit_price: Decimal = Decimal('0'),
        event: UsageEvent = None,
        note: str = '',
        reference: str = '',
        metadata: dict = None,
        actor=None,
    ) -> LedgerEntry:
        return LedgerWriter._write(
            organization=organization,
            entry_type='charge',
            amount=amount,
            service=service,
            unit_type=unit_type,
            units=units,
            unit_price=unit_price,
            event=event,
            note=note,
            reference=reference,
            metadata=metadata or {},
            actor=actor,
        )

    @staticmethod
    @transaction.atomic
    def write_payment(
        organization: Organization,
        amount: Decimal,
        reference: str = '',
        note: str = '',
        actor=None,
    ) -> LedgerEntry:
        return LedgerWriter._write(
            organization=organization,
            entry_type='payment',
            amount=-amount,  # negative = org owes less
            note=note,
            reference=reference,
            actor=actor,
        )

    @staticmethod
    @transaction.atomic
    def write_credit(
        organization: Organization,
        amount: Decimal,
        credit_type: str = 'credit',
        reference: str = '',
        note: str = '',
        actor=None,
    ) -> LedgerEntry:
        entry_type_map = {
            'credit':     'credit',
            'adjustment': 'adjustment',
            'refund':     'refund',
            'promo':      'promo',
        }
        return LedgerWriter._write(
            organization=organization,
            entry_type=entry_type_map.get(credit_type, 'credit'),
            amount=-amount,
            note=note,
            reference=reference,
            actor=actor,
        )

    @staticmethod
    def _write(
        organization: Organization,
        entry_type: str,
        amount: Decimal,
        service: str = '',
        unit_type: str = '',
        units: Decimal = Decimal('0'),
        unit_price: Decimal = Decimal('0'),
        event: UsageEvent = None,
        note: str = '',
        reference: str = '',
        metadata: dict = None,
        actor=None,
    ) -> LedgerEntry:
        # Compute running balance from last entry for this org
        last = (
            LedgerEntry.objects.filter(organization=organization)
            .order_by('-created_at', '-seq')
            .values_list('running_balance', flat=True)
            .first()
        )
        running = (last or Decimal('0')) + amount

        entry = LedgerEntry(
            seq             = _next_seq(),
            event           = event,
            organization    = organization,
            entry_type      = entry_type,
            service         = service,
            unit_type       = unit_type,
            units           = units,
            unit_price      = unit_price,
            amount          = _round(amount),
            running_balance = _round(running),
            reference       = reference,
            note            = note,
            metadata        = metadata or {},
            created_by      = actor,
        )
        entry.save()
        return entry


# ─────────────────────────────────────────────────────────────────────────────
# E — Balance Engine (Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class BalanceEngine:
    @staticmethod
    @transaction.atomic
    def recompute(organization: Organization) -> OrgBalance:
        """
        Recompute the OrgBalance snapshot from ledger entries.
        Called after every ledger write.
        """
        from django.db.models import Sum

        entries = LedgerEntry.objects.filter(organization=organization)

        charges = (
            entries.filter(entry_type='charge')
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        payments = (
            entries.filter(entry_type='payment')
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        credits = (
            entries.filter(entry_type__in=['credit', 'refund', 'adjustment', 'promo'])
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        outstanding = _round(charges + payments + credits)  # payments / credits are negative

        balance, _ = OrgBalance.objects.get_or_create(organization=organization)
        balance.total_charges  = _round(charges)
        balance.total_payments = _round(abs(payments))
        balance.total_credits  = _round(abs(credits))
        balance.outstanding    = outstanding
        balance.save()
        return balance


# ─────────────────────────────────────────────────────────────────────────────
# F — Invoice Generator (Layer 2 → Layer 3)
# ─────────────────────────────────────────────────────────────────────────────

class InvoiceGenerator:
    @staticmethod
    @transaction.atomic
    def generate_for_period(
        organization: Organization,
        period_start: date,
        period_end: date,
        actor=None,
    ) -> Invoice:
        """
        Aggregate all charge ledger entries in the period into a new Invoice.
        Applies any active credits automatically.
        """
        from django.db.models import Sum as _Sum

        entries = LedgerEntry.objects.filter(
            organization=organization,
            entry_type='charge',
            created_at__date__gte=period_start,
            created_at__date__lte=period_end,
        )

        subtotal = entries.aggregate(s=_Sum('amount'))['s'] or Decimal('0')
        subtotal = _round(subtotal)

        # Apply outstanding active credits
        active_credits = Credit.objects.filter(
            organization=organization, status='active'
        )
        credits_total = sum(c.amount for c in active_credits) or Decimal('0')
        credits_applied = min(credits_total, subtotal)
        total = _round(subtotal - credits_applied)

        invoice_number = _next_invoice_number()
        invoice = Invoice.objects.create(
            invoice_number  = invoice_number,
            organization    = organization,
            period_start    = period_start,
            period_end      = period_end,
            subtotal        = subtotal,
            credits_applied = _round(credits_applied),
            total           = total,
            status          = 'issued',
            issued_at       = timezone.now(),
            due_date        = period_end + timedelta(days=30),
            created_by      = actor,
        )

        # Build line items grouped by service
        from django.db.models import Sum as S2
        service_totals = (
            entries.values('service', 'unit_type')
            .annotate(
                total_units  = S2('units'),
                total_amount = S2('amount'),
            )
        )
        for row in service_totals:
            unit_price = Decimal('0')
            rule = CostCalculator.get_active_rule(row['service'], row['unit_type'])
            if rule:
                unit_price = rule.unit_price
            InvoiceLineItem.objects.create(
                invoice     = invoice,
                service     = row['service'],
                description = f"{row['service'].title()} — {row['unit_type']}",
                unit_type   = row['unit_type'],
                units       = row['total_units'] or Decimal('0'),
                unit_price  = unit_price,
                amount      = _round(row['total_amount'] or Decimal('0')),
            )

        # Mark credits as applied
        remaining = credits_applied
        for credit in active_credits:
            if remaining <= 0:
                break
            credit.status     = 'applied'
            credit.applied_to = invoice
            credit.save(update_fields=['status', 'applied_to', 'updated_at'])
            remaining -= credit.amount

        # Write ledger entry for the invoice issuance
        LedgerWriter._write(
            organization = organization,
            entry_type   = 'charge',
            amount       = total,
            reference    = invoice_number,
            note         = f'Invoice {invoice_number} issued',
            actor        = actor,
        )

        BalanceEngine.recompute(organization)
        return invoice

    @staticmethod
    @transaction.atomic
    def record_payment(
        invoice: Invoice,
        amount: Decimal,
        method: str = 'card',
        reference: str = '',
        actor=None,
    ) -> Payment:
        payment = Payment.objects.create(
            organization = invoice.organization,
            invoice      = invoice,
            amount       = amount,
            method       = method,
            status       = 'cleared',
            reference    = reference,
            paid_at      = timezone.now(),
        )
        LedgerWriter.write_payment(
            organization = invoice.organization,
            amount       = amount,
            reference    = invoice.invoice_number,
            note         = f'Payment received for {invoice.invoice_number}',
            actor        = actor,
        )
        if amount >= invoice.total:
            invoice.status  = 'paid'
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=['status', 'paid_at', 'updated_at'])
        BalanceEngine.recompute(invoice.organization)
        return payment


# ─────────────────────────────────────────────────────────────────────────────
# G — Full event processing pipeline (convenience entry point)
# ─────────────────────────────────────────────────────────────────────────────

@transaction.atomic
def process_event(payload: dict, source_ip: str = None) -> UsageEvent:
    """
    Full Layer 1 → Layer 2 → Layer 3 pipeline for a single event.
    1. Consume (validate + deduplicate)
    2. Normalize units
    3. Calculate cost
    4. Write ledger entry
    5. Update balance
    Returns the processed UsageEvent.
    """
    event, created = EventConsumer.ingest(payload, source_ip=source_ip)

    if not created:
        return event  # duplicate, skip

    if not event.organization:
        event.status           = 'rejected'
        event.rejection_reason = 'Unknown organization'
        event.save(update_fields=['status', 'rejection_reason'])
        return event

    # Normalize
    billing_unit, billing_units = UsageNormalizer.normalize(
        event.service, event.unit_type, event.units
    )

    # Calculate cost
    unit_price, total_cost, rule = CostCalculator.calculate(
        event.service, billing_unit, billing_units
    )

    # Update event with computed values
    event.unit_type     = billing_unit
    event.units         = billing_units
    event.unit_price    = unit_price
    event.total_cost    = total_cost
    event.pricing_rule  = rule
    event.status        = 'processed'
    event.processed_at  = timezone.now()
    event.save(update_fields=['unit_type', 'units', 'unit_price', 'total_cost', 'pricing_rule', 'status', 'processed_at'])

    # Write ledger
    if total_cost > 0:
        LedgerWriter.write_charge(
            organization = event.organization,
            amount       = total_cost,
            service      = event.service,
            unit_type    = billing_unit,
            units        = billing_units,
            unit_price   = unit_price,
            event        = event,
            reference    = str(event.event_id),
            note         = f'{event.event_type} — auto-charged',
        )
        BalanceEngine.recompute(event.organization)

    return event
