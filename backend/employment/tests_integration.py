"""
AtonixDev Employment Console — §4.2 Integration Test Suite

Tests end-to-end workflows across multiple subsystems:
  - Full hiring pipeline: submit → ATS stages → interview → evaluate → hire
  - Rejection pipeline
  - GDPR data export (§4.4A)
  - GDPR anonymization with guard clauses (§4.4A)
  - Employment metrics endpoint (§4.5)
  - Audit log JSON (paginated/filtered) (§4.4C)
  - Audit log CSV export streaming (§4.4C)
  - Data retention dry-run management command (§4.4D)
  - RBAC: non-admin cannot access compliance endpoints
"""

from io import StringIO

from django.core.management import call_command
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Application, Employee, EmploymentAuditLog, JobPosting


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_superuser(username='admin_int', password='testpass'):
    return User.objects.create_superuser(
        username=username, password=password, email=f'{username}@test.com'
    )


def make_staff(username='staff_int', password='testpass'):
    return User.objects.create_user(
        username=username, password=password, email=f'{username}@test.com', is_staff=True
    )


def make_plain_user(username='plain_int', password='testpass'):
    return User.objects.create_user(
        username=username, password=password, email=f'{username}@test.com'
    )


_JOB_PAYLOAD = {
    'title': 'Integration Test Engineer',
    'department': 'engineering',
    'description': 'Full pipeline test',
    'requirements': 'Python, Django',
    'type': 'full_time',
    'experience_level': 'mid',
    'status': 'open',
}


class _BaseIntegration(TestCase):
    """Shared setup: admin client + one open job."""

    def setUp(self):
        self.admin = make_superuser()
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        self.anon_client = APIClient()

        # Create the shared job
        resp = self.admin_client.post('/api/employment/jobs/', _JOB_PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.job_id = resp.data['id']

    def _submit_app(self, email='cand@example.com', first='Jane', last='Doe'):
        """Anon-submit an application and return its ID."""
        resp = self.anon_client.post('/api/employment/applications/', {
            'job': self.job_id,
            'first_name': first,
            'last_name': last,
            'email': email,
            'phone': '555-0000',
            'cover_letter': 'Test cover letter.',
            'linkedin_url': 'https://linkedin.com/in/test',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        return resp.data['id']

    def _move(self, app_id, new_status):
        resp = self.admin_client.post(
            f'/api/employment/applications/{app_id}/move_to_stage/',
            {'status': new_status},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        return resp

    def _schedule_interview(self, app_id):
        resp = self.admin_client.post('/api/employment/interviews/', {
            'application': app_id,
            'interviewer': self.admin.id,
            'round': 1,
            'format': 'video',
            'status': 'scheduled',
            'duration_minutes': 60,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        return resp.data['id']

    def _evaluate(self, interview_id, app_id, recommendation='hire'):
        resp = self.admin_client.post('/api/employment/evaluations/', {
            'interview': interview_id,
            'application': app_id,
            'technical_score': 8,
            'communication_score': 8,
            'culture_score': 8,
            'problem_solving_score': 8,
            'experience_score': 8,
            'recommendation': recommendation,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        return resp.data['id']


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.1 — Full Hiring Pipeline Integration Test
# ─────────────────────────────────────────────────────────────────────────────

class FullHiringPipelineTest(_BaseIntegration):
    """
    End-to-end: Application → screening → interview → evaluate → admin_approve
    → offer → convert_to_employee → Employee record.
    """

    def test_full_pipeline(self):
        # 1. Submit application
        app_id = self._submit_app()

        # 2. Move through early stages
        self._move(app_id, 'screening')
        self._move(app_id, 'shortlisted')
        self._move(app_id, 'interview')

        # 3. Schedule and complete interview
        iv_id = self._schedule_interview(app_id)
        complete = self.admin_client.post(f'/api/employment/interviews/{iv_id}/mark_completed/')
        self.assertEqual(complete.status_code, status.HTTP_200_OK)

        # 4. Submit evaluation and approve
        ev_id = self._evaluate(iv_id, app_id)
        approve = self.admin_client.post(f'/api/employment/evaluations/{ev_id}/admin_approve/')
        self.assertEqual(approve.status_code, status.HTTP_200_OK)

        # 5. Verify application now in offer stage
        app_resp = self.admin_client.get(f'/api/employment/applications/{app_id}/')
        self.assertEqual(app_resp.data['status'], 'offer')

        # 6. Convert to employee
        hire = self.admin_client.post(
            f'/api/employment/applications/{app_id}/convert_to_employee/',
            {'department': 'Engineering', 'role': 'Integration Test Engineer'},
            format='json',
        )
        self.assertEqual(hire.status_code, status.HTTP_201_CREATED)
        self.assertIn('employee_id', hire.data)
        self.assertTrue(hire.data['employee_id'].startswith('EMP-'))

        # 7. Verify final application status
        final = self.admin_client.get(f'/api/employment/applications/{app_id}/')
        self.assertEqual(final.data['status'], 'hired')

        # 8. Verify Employee record exists
        emp = Employee.objects.get(application_id=app_id)
        self.assertEqual(emp.status, 'active')


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.2 — Rejection Pipeline
# ─────────────────────────────────────────────────────────────────────────────

class RejectionPipelineTest(_BaseIntegration):
    """Application → interview → evaluate (no_hire) → admin_reject → rejected."""

    def test_rejection_pipeline(self):
        app_id = self._submit_app(email='rejected@example.com', first='Rob', last='Jones')
        self._move(app_id, 'interview')

        iv_id = self._schedule_interview(app_id)
        ev_id = self._evaluate(iv_id, app_id, recommendation='no_hire')

        reject = self.admin_client.post(f'/api/employment/evaluations/{ev_id}/admin_reject/')
        self.assertEqual(reject.status_code, status.HTTP_200_OK)
        self.assertEqual(reject.data['admin_decision'], 'rejected')

        # Application must be rejected
        app_resp = self.admin_client.get(f'/api/employment/applications/{app_id}/')
        self.assertEqual(app_resp.data['status'], 'rejected')


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.3 — GDPR Data Export (§4.4A)
# ─────────────────────────────────────────────────────────────────────────────

class GDPRDataExportTest(_BaseIntegration):
    """GET /api/employment/applications/<id>/export_data/ — verify structure."""

    def test_export_returns_full_structure(self):
        app_id = self._submit_app(email='export@example.com')
        iv_id = self._schedule_interview(app_id)

        resp = self.admin_client.get(f'/api/employment/applications/{app_id}/export_data/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Top-level keys
        for key in ('export_generated_at', 'export_format', 'application',
                    'evaluations', 'audit_trail'):
            self.assertIn(key, resp.data, f'Missing key: {key}')

        # Application fields
        self.assertEqual(str(resp.data['application']['id']), str(app_id))
        self.assertEqual(resp.data['application']['email'], 'export@example.com')

    def test_export_creates_audit_log_entry(self):
        app_id = self._submit_app(email='exportaudit@example.com')
        before = EmploymentAuditLog.objects.filter(action='compliance.data_exported').count()
        self.admin_client.get(f'/api/employment/applications/{app_id}/export_data/')
        after = EmploymentAuditLog.objects.filter(action='compliance.data_exported').count()
        self.assertEqual(after, before + 1)

    def test_export_requires_authentication(self):
        app_id = self._submit_app(email='exportanon@example.com')
        resp = self.anon_client.get(f'/api/employment/applications/{app_id}/export_data/')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_export_404_for_missing_application(self):
        import uuid
        fake_id = str(uuid.uuid4())
        resp = self.admin_client.get(f'/api/employment/applications/{fake_id}/export_data/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.4 — GDPR Anonymization (§4.4A Right to Erasure)
# ─────────────────────────────────────────────────────────────────────────────

class GDPRAnonymizationTest(_BaseIntegration):
    """POST /api/employment/applications/<id>/anonymize/ — verify PII removal."""

    def test_anonymize_replaces_pii(self):
        app_id = self._submit_app(email='pii@example.com', first='Alice', last='PII')

        resp = self.admin_client.post(
            f'/api/employment/applications/{app_id}/anonymize/',
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'anonymized')

        # Verify PII is gone
        app = Application.objects.get(pk=app_id)
        self.assertEqual(app.first_name, '[REDACTED]')
        self.assertEqual(app.last_name, '[REDACTED]')
        self.assertEqual(app.email, 'redacted@atonixdev.invalid')
        self.assertEqual(app.phone, '')

    def test_anonymize_blocks_hired_applications(self):
        """Cannot anonymize an application that has been converted to an employee."""
        app_id = self._submit_app(email='hired@example.com', first='Hired', last='Person')
        # Promote to offer and convert
        self._move(app_id, 'offer')
        self.admin_client.post(
            f'/api/employment/applications/{app_id}/convert_to_employee/',
            {'department': 'HR', 'role': 'Hired Role'},
            format='json',
        )

        resp = self.admin_client.post(
            f'/api/employment/applications/{app_id}/anonymize/',
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_anonymize_requires_admin(self):
        """Non-admin staff should NOT be able to anonymize."""
        staff = make_staff()
        staff_client = APIClient()
        staff_client.force_authenticate(user=staff)

        app_id = self._submit_app(email='staffanon@example.com')
        resp = staff_client.post(f'/api/employment/applications/{app_id}/anonymize/', format='json')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_anonymize_creates_audit_log_entry(self):
        app_id = self._submit_app(email='anonaudit@example.com')
        before = EmploymentAuditLog.objects.filter(action='compliance.application_anonymized').count()
        self.admin_client.post(f'/api/employment/applications/{app_id}/anonymize/', format='json')
        after = EmploymentAuditLog.objects.filter(action='compliance.application_anonymized').count()
        self.assertEqual(after, before + 1)


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.5 — Employment Metrics Endpoint (§4.5)
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentMetricsTest(_BaseIntegration):
    """GET /api/employment/metrics/ — verify structure and semantics."""

    def test_metrics_returns_required_keys(self):
        resp = self.admin_client.get('/api/employment/metrics/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        for key in ('generated_at', 'totals', 'pipeline_stages', 'conversion_rates',
                    'daily_applications_30d', 'interview_health_30d',
                    'open_jobs_by_department', 'activity_7d'):
            self.assertIn(key, resp.data, f'Missing top-level key: {key}')

    def test_metrics_totals_reflect_seeded_data(self):
        # Submit a couple of applications so totals > 0
        self._submit_app(email='m1@example.com')
        self._submit_app(email='m2@example.com')

        resp = self.admin_client.get('/api/employment/metrics/')
        self.assertGreaterEqual(resp.data['totals']['applications'], 2)
        self.assertGreaterEqual(resp.data['totals']['open_jobs'], 1)

    def test_metrics_conversion_rate_is_float(self):
        resp = self.admin_client.get('/api/employment/metrics/')
        rates = resp.data['conversion_rates']
        for key, val in rates.items():
            self.assertIsInstance(val, float, f'{key} should be a float')

    def test_metrics_requires_authentication(self):
        resp = self.anon_client.get('/api/employment/metrics/')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_metrics_requires_hr_or_admin(self):
        plain = make_plain_user()
        plain_client = APIClient()
        plain_client.force_authenticate(user=plain)
        resp = plain_client.get('/api/employment/metrics/')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.6 — Audit Log JSON Endpoint
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogAPITest(_BaseIntegration):
    """GET /api/employment/audit/ — pagination + filtering."""

    def _seed_audit_entries(self, n=5):
        for i in range(n):
            EmploymentAuditLog.objects.create(
                actor=self.admin,
                action=f'test.action_{i}',
                resource_type='Application',
                resource_id='fake-id',
                ip_address='127.0.0.1',
            )

    def test_audit_returns_paginated_structure(self):
        self._seed_audit_entries(3)
        resp = self.admin_client.get('/api/employment/audit/?page_size=2&page=1')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for key in ('count', 'page', 'page_size', 'results'):
            self.assertIn(key, resp.data)
        self.assertEqual(resp.data['page'], 1)
        self.assertLessEqual(len(resp.data['results']), 2)

    def test_audit_filter_by_resource_type(self):
        EmploymentAuditLog.objects.create(
            actor=self.admin, action='xyz.created', resource_type='JobPosting',
            resource_id='jp-1', ip_address='10.0.0.1',
        )
        resp = self.admin_client.get('/api/employment/audit/?resource_type=JobPosting')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for entry in resp.data['results']:
            self.assertEqual(entry['resource_type'], 'JobPosting')

    def test_audit_filter_by_action(self):
        EmploymentAuditLog.objects.create(
            actor=self.admin, action='stage.moved', resource_type='Application',
            resource_id='app-1',
        )
        resp = self.admin_client.get('/api/employment/audit/?action=stage')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for entry in resp.data['results']:
            self.assertIn('stage', entry['action'].lower())

    def test_audit_requires_admin(self):
        resp = self.anon_client.get('/api/employment/audit/')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.7 — Audit Log CSV Export (§4.4C)
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogCSVExportTest(_BaseIntegration):
    """GET /api/employment/audit/export/ — streaming CSV response."""

    def _seed_one_entry(self):
        EmploymentAuditLog.objects.create(
            actor=self.admin,
            action='test.csv_export',
            resource_type='Application',
            resource_id='csv-test',
            ip_address='127.0.0.1',
        )

    def test_csv_export_returns_text_csv(self):
        self._seed_one_entry()
        resp = self.admin_client.get('/api/employment/audit/export/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('text/csv', resp.get('Content-Type', ''))

    def test_csv_export_has_content_disposition(self):
        self._seed_one_entry()
        resp = self.admin_client.get('/api/employment/audit/export/')
        disposition = resp.get('Content-Disposition', '')
        self.assertIn('attachment', disposition)
        self.assertIn('.csv', disposition)

    def test_csv_export_has_header_row(self):
        self._seed_one_entry()
        resp = self.admin_client.get('/api/employment/audit/export/')
        # StreamingHttpResponse — collect content
        content = b''.join(resp.streaming_content).decode('utf-8')
        header_line = content.splitlines()[0]
        for col in ('Timestamp', 'Actor', 'Action', 'Resource Type', 'Resource ID'):
            self.assertIn(col, header_line)

    def test_csv_export_date_range_filter(self):
        self._seed_one_entry()
        resp = self.admin_client.get('/api/employment/audit/export/?since=2000-01-01&until=2099-12-31')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_csv_export_requires_admin(self):
        resp = self.anon_client.get('/api/employment/audit/export/')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ─────────────────────────────────────────────────────────────────────────────
# §4.2.8 — Data Retention Command (§4.4D) — Dry-Run
# ─────────────────────────────────────────────────────────────────────────────

class DataRetentionCommandTest(_BaseIntegration):
    """Management command employment_retention runs without error (dry-run)."""

    def test_retention_dryrun_no_errors(self):
        out = StringIO()
        try:
            call_command('employment_retention', stdout=out, stderr=StringIO())
        except SystemExit:
            pass
        output = out.getvalue()
        # Dry-run should print a summary without executing deletes
        self.assertIn('DRY-RUN', output.upper())

    def test_retention_execute_flag_processes_records(self):
        """Run with --execute on a fresh DB — should complete without error."""
        out = StringIO()
        call_command('employment_retention', '--execute', '--batch-size', '5',
                     stdout=out, stderr=StringIO())
        output = out.getvalue()
        # Should contain each retention section
        for section in ('Application', 'Interview', 'Employee', 'Audit'):
            self.assertIn(section, output)
