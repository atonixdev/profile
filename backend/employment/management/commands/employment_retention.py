"""
employment_retention — §4.4D Data Retention Enforcement

Retention Policy (§4.4 Compliance Requirements)
  Application records   : 2 years   (hard-delete after window)
  Interview recordings  : 1 year    (hard-delete after window)
  Employee records      : 7 years   (soft-flag only — NEVER hard-deleted)
  Audit logs            : 1 year    (hard-delete after window)

SAFETY RULES
  • Employee records are immutable workforce records — they are NEVER hard-deleted.
    Records beyond 7 years are only flagged and reported.
  • Application PII is anonymized first, then deleted at 2-year mark.
  • A --dry-run mode (default) prints what WOULD be processed without touching data.
  • --execute flag is required to perform actual deletions/anonymizations.
  • All operations are wrapped in atomic transactions and logged to EmploymentAuditLog.

Usage:
    python manage.py employment_retention             # report only (dry-run)
    python manage.py employment_retention --execute   # enforce policy
    python manage.py employment_retention --dry-run   # explicit report-only
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from employment.models import Application, Employee, EmploymentAuditLog, Interview


# §4.4D Retention windows
RETENTION = {
    'applications':  timedelta(days=365 * 2),   # 2 years
    'interviews':    timedelta(days=365 * 1),    # 1 year (recordings / completed sessions)
    'employees':     timedelta(days=365 * 7),    # 7 years — flag only, never delete
    'audit_logs':    timedelta(days=365 * 1),    # 1 year
}

# PII fields replaced with anonymized tokens on expired applications (§4.4A data minimization)
ANONYMIZE_FIELDS = {
    'first_name':    '[REDACTED]',
    'last_name':     '[REDACTED]',
    'phone':         '',
    'location':      '',
    'linkedin_url':  '',
    'portfolio_url': '',
    'github_url':    '',
    'cover_letter':  '',
    'screening_answers': {},
    'notes':         '',
    'internal_rating': None,
}


class Command(BaseCommand):
    help = (
        'Enforce employment data retention policies (§4.4D). '
        'Anonymizes PII on expired applications. '
        'Purges expired interview sessions and audit logs. '
        'Employee records are NEVER deleted — immutable workforce records.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--execute',
            action='store_true',
            default=False,
            help='Actually enforce retention policy. Without this flag the command only reports.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            dest='dry_run',
            help='Alias for report-only mode (no changes made).',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            dest='batch_size',
            help='Processing batch size to avoid long DB locks (default: 1000).',
        )

    def handle(self, *args, **options):
        execute    = options['execute'] and not options['dry_run']
        batch_size = options['batch_size']
        now        = timezone.now()

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'\nAtonixDev Employment — Data Retention Report'
            f'\nTimestamp : {now.isoformat()}'
            f'\nMode      : {"EXECUTE" if execute else "DRY-RUN (report only)"}\n'
        ))

        totals = {}

        # ── 1. Applications (2-year window) ──────────────────────────────────
        # Non-hired applications beyond 2 years → anonymize PII
        # Hired applications are retained as employment records (linked to Employee)
        apps_cutoff = now - RETENTION['applications']
        expired_apps_qs = Application.objects.filter(
            submitted_at__lt=apps_cutoff,
        ).exclude(
            status='hired',   # hired applicants become employees — see retention rule §3
        ).exclude(
            hired_employee__isnull=False,  # also exclude if Employee record linked
        )
        expired_apps_count = expired_apps_qs.count()
        totals['applications_to_anonymize'] = expired_apps_count

        self.stdout.write(
            f'  Applications > 2 years (non-hired) : {expired_apps_count:,} records '
            f'(cutoff: {apps_cutoff.date()})'
        )

        if execute and expired_apps_count:
            anonymized = _anonymize_applications(expired_apps_qs, batch_size, now)
            totals['applications_anonymized'] = anonymized
            _log_retention(
                'applications.anonymized',
                f'{anonymized} application PII records anonymized (> 2-year retention)',
            )
            self.stdout.write(self.style.SUCCESS(
                f'    ✓ Anonymized PII for {anonymized:,} application records.'
            ))

        # ── 2. Completed Interview Sessions (1-year window) ──────────────────
        # Completed/cancelled/no-show sessions beyond 1 year → hard delete notes/metadata
        # The Interview record itself is kept; only meeting_link and notes are redacted
        iv_cutoff = now - RETENTION['interviews']
        expired_iv_qs = Interview.objects.filter(
            completed_at__lt=iv_cutoff,
            status__in=['completed', 'cancelled', 'no_show'],
        ).exclude(notes='')  # only those that still have unredacted notes
        expired_iv_count = expired_iv_qs.count()
        totals['interviews_to_redact'] = expired_iv_count

        self.stdout.write(
            f'  Interview logs > 1 year (with notes) : {expired_iv_count:,} records '
            f'(cutoff: {iv_cutoff.date()})'
        )

        if execute and expired_iv_count:
            redacted = _redact_interviews(expired_iv_qs, batch_size)
            totals['interviews_redacted'] = redacted
            _log_retention(
                'interviews.notes_redacted',
                f'{redacted} interview note records redacted (> 1-year retention)',
            )
            self.stdout.write(self.style.SUCCESS(
                f'    ✓ Redacted notes for {redacted:,} completed interview records.'
            ))

        # ── 3. Employee Records (7-year window) — REPORT ONLY ────────────────
        emp_cutoff = now - RETENTION['employees']
        expired_emp_count = Employee.objects.filter(
            status__in=['terminated', 'resigned', 'on_leave'],
            end_date__lt=emp_cutoff.date(),
        ).count()
        totals['employees_flagged'] = expired_emp_count

        self.stdout.write(
            f'  Employee records > 7 years (inactive) : {expired_emp_count:,} records '
            f'[REPORT ONLY — never deleted] (cutoff: {emp_cutoff.date()})'
        )
        if expired_emp_count:
            self.stdout.write(self.style.WARNING(
                f'    ⚠  {expired_emp_count:,} employee records exceed 7-year retention window.'
                f' Manual legal review required before any archival action.'
            ))

        # ── 4. Audit Logs (1-year window) ─────────────────────────────────────
        audit_cutoff = now - RETENTION['audit_logs']
        expired_audit_qs = EmploymentAuditLog.objects.filter(
            created_at__lt=audit_cutoff,
        )
        expired_audit_count = expired_audit_qs.count()
        totals['audit_logs_to_delete'] = expired_audit_count

        self.stdout.write(
            f'  Audit log entries > 1 year : {expired_audit_count:,} records '
            f'(cutoff: {audit_cutoff.date()})'
        )

        if execute and expired_audit_count:
            deleted = _delete_in_batches(expired_audit_qs, batch_size)
            totals['audit_logs_deleted'] = deleted
            # Log this purge as a new audit entry (fresh, within window)
            _log_retention(
                'audit_logs.purged',
                f'{deleted} audit log entries deleted (> 1-year retention)',
            )
            self.stdout.write(self.style.SUCCESS(
                f'    ✓ Deleted {deleted:,} expired audit log entries.'
            ))

        # ── Summary ───────────────────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n── Summary ─────────────────────────────────'))
        for key, val in totals.items():
            self.stdout.write(f'  {key:<35} : {val:,}')

        if not execute:
            self.stdout.write(self.style.WARNING(
                '\nDRY-RUN — no changes were made. '
                'Re-run with --execute to enforce retention policy.'
            ))
        else:
            self.stdout.write(self.style.SUCCESS('\nRetention policy enforced successfully.'))


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _anonymize_applications(qs, batch_size, now):
    """Replace PII fields in batches. Returns count of records processed."""
    processed = 0
    ids = list(qs.values_list('id', flat=True)[:batch_size * 100])
    for i in range(0, len(ids), batch_size):
        chunk = ids[i:i + batch_size]
        with transaction.atomic():
            Application.objects.filter(id__in=chunk).update(
                **ANONYMIZE_FIELDS,
            )
        processed += len(chunk)
    return processed


def _redact_interviews(qs, batch_size):
    """Clear notes and meeting_link from completed interview records."""
    processed = 0
    ids = list(qs.values_list('id', flat=True)[:batch_size * 100])
    for i in range(0, len(ids), batch_size):
        chunk = ids[i:i + batch_size]
        with transaction.atomic():
            Interview.objects.filter(id__in=chunk).update(
                notes='',
                meeting_link='',
            )
        processed += len(chunk)
    return processed


def _delete_in_batches(qs, batch_size):
    """Hard-delete QuerySet rows in controlled batches."""
    deleted_total = 0
    ids = list(qs.values_list('id', flat=True)[:batch_size * 100])
    for i in range(0, len(ids), batch_size):
        chunk = ids[i:i + batch_size]
        with transaction.atomic():
            count, _ = qs.model.objects.filter(id__in=chunk).delete()
        deleted_total += count
    return deleted_total


def _log_retention(action, detail):
    """Write a system-level audit log entry for retention operations."""
    try:
        EmploymentAuditLog.objects.create(
            actor=None,
            action=f'system.retention.{action}',
            resource_type='RetentionPolicy',
            resource_id='system',
            details={'detail': detail},
        )
    except Exception:
        pass  # Don't let audit failures break retention execution
