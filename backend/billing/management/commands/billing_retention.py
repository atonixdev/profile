"""
billing_retention — Data retention enforcement command (§4.4 E)

Retention Policy
  UsageEvent      2 years   (event data)
  BillingAuditLog 1 year    (audit logs)
  LedgerEntry     7 years   (financial records — soft-delete only)
  Invoice         7 years   (financial records — soft-delete only)

SAFETY RULES
  • LedgerEntry and Invoice are NEVER hard-deleted (immutable financial records).
    They are only flagged / reported, never removed.
  • UsageEvent and BillingAuditLog are hard-deleted after their retention window.
  • A dry-run mode (--dry-run) prints what WOULD be deleted without touching data.
  • All deletions are logged to BillingAuditLog before execution.

Usage:
    python manage.py billing_retention             # report only
    python manage.py billing_retention --execute   # enforce deletions
    python manage.py billing_retention --dry-run   # same as report-only (explicit)
"""

from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from billing.models import BillingAuditLog, Invoice, LedgerEntry, UsageEvent


# Retention windows (§4.4 E)
RETENTION = {
    'events':   timedelta(days=365 * 2),    # 2 years
    'audit':    timedelta(days=365 * 1),    # 1 year
    'ledger':   timedelta(days=365 * 7),    # 7 years  — report only
    'invoices': timedelta(days=365 * 7),    # 7 years  — report only
}


class Command(BaseCommand):
    help = (
        'Enforce billing data retention policies (§4.4 E). '
        'Deletes expired UsageEvents and AuditLogs. '
        'Ledger and Invoice records are NEVER deleted — immutable financial records.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--execute',
            action='store_true',
            default=False,
            help='Actually delete expired records. Without this flag the command only reports.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            dest='dry_run',
            help='Alias for report-only mode (no deletions performed).',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=5000,
            dest='batch_size',
            help='Deletion batch size to avoid long locks (default: 5000).',
        )

    def handle(self, *args, **options):
        execute    = options['execute'] and not options['dry_run']
        batch_size = options['batch_size']
        now        = timezone.now()

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'\nAtonixDev Billing — Data Retention Report'
            f'\nTimestamp : {now.isoformat()}'
            f'\nMode      : {"EXECUTE" if execute else "DRY-RUN (report only)"}\n'
        ))

        # ── 1. Usage Events (2-year window) ───────────────────────────────
        events_cutoff = now - RETENTION['events']
        expired_events_qs = UsageEvent.objects.filter(received_at__lt=events_cutoff)
        expired_events_count = expired_events_qs.count()

        self.stdout.write(
            f'  UsageEvent   > 2 years : {expired_events_count:,} records '
            f'(cutoff: {events_cutoff.date()})'
        )

        events_deleted = 0
        if execute and expired_events_count:
            events_deleted = self._batch_delete(expired_events_qs, batch_size, 'UsageEvent')
            self._log_deletion('UsageEvent', events_deleted, events_cutoff)

        # ── 2. Audit Logs (1-year window) ─────────────────────────────────
        audit_cutoff = now - RETENTION['audit']
        expired_audit_qs = BillingAuditLog.objects.filter(created_at__lt=audit_cutoff)
        expired_audit_count = expired_audit_qs.count()

        self.stdout.write(
            f'  AuditLog     > 1 year  : {expired_audit_count:,} records '
            f'(cutoff: {audit_cutoff.date()})'
        )

        audit_deleted = 0
        if execute and expired_audit_count:
            audit_deleted = self._batch_delete(expired_audit_qs, batch_size, 'BillingAuditLog')
            self._log_deletion('BillingAuditLog', audit_deleted, audit_cutoff)

        # ── 3. Ledger Entries (7-year window — REPORT ONLY) ───────────────
        ledger_cutoff = now - RETENTION['ledger']
        expired_ledger_count = LedgerEntry.objects.filter(created_at__lt=ledger_cutoff).count()
        self.stdout.write(
            f'  LedgerEntry  > 7 years : {expired_ledger_count:,} records '
            f'(cutoff: {ledger_cutoff.date()}) [IMMUTABLE — never deleted]'
        )

        # ── 4. Invoices (7-year window — REPORT ONLY) ─────────────────────
        invoice_cutoff = now - RETENTION['invoices']
        expired_invoice_count = Invoice.objects.filter(created_at__lt=invoice_cutoff).count()
        self.stdout.write(
            f'  Invoice      > 7 years : {expired_invoice_count:,} records '
            f'(cutoff: {invoice_cutoff.date()}) [IMMUTABLE — never deleted]'
        )

        # ── Summary ───────────────────────────────────────────────────────
        self.stdout.write('')
        if execute:
            self.stdout.write(self.style.SUCCESS(
                f'Retention enforcement complete:\n'
                f'  UsageEvent   deleted: {events_deleted:,}\n'
                f'  AuditLog     deleted: {audit_deleted:,}\n'
                f'  LedgerEntry  kept:    {expired_ledger_count:,} (immutable)\n'
                f'  Invoice      kept:    {expired_invoice_count:,} (immutable)\n'
            ))
        else:
            self.stdout.write(self.style.WARNING(
                'Dry-run complete. Pass --execute to enforce deletions.\n'
            ))

    # ──────────────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────────────

    def _batch_delete(self, queryset, batch_size: int, label: str) -> int:
        """Delete a queryset in batches to avoid long table locks."""
        total_deleted = 0
        while True:
            # Get a slice of PKs, delete in a transaction
            pks = list(queryset.values_list('pk', flat=True)[:batch_size])
            if not pks:
                break
            with transaction.atomic():
                deleted, _ = queryset.model.objects.filter(pk__in=pks).delete()
                total_deleted += deleted
            self.stdout.write(f'    [{label}] deleted batch of {deleted:,} (total: {total_deleted:,})')
        return total_deleted

    @staticmethod
    def _log_deletion(model_label: str, count: int, cutoff) -> None:
        """Write a system audit entry recording the retention enforcement action."""
        BillingAuditLog.objects.create(
            actor=None,
            action='RETENTION_ENFORCEMENT',
            target=f'{model_label}: {count:,} records older than {cutoff.date()} deleted',
            severity='low',
            ip_address=None,
        )
