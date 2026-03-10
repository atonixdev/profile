"""
AtonixDev Employment Console — §3.12 Unit Test Suite

Tests:
  - JobPosting CRUD (create, list, retrieve, update, close)
  - Application submission (public POST + notify)
  - ATS stage movement (move_to_stage)
  - Interview scheduling
  - Evaluation submit + weighted scoring
  - Admin decision (approve / reject)
  - convert_to_employee action
  - Public track endpoint
  - by_applicant endpoint
  - RBAC: InterviewerOrAbove vs HROrAdmin vs AllowAny
"""
import uuid

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import (
    Application, Employee, Evaluation, Interview, JobPosting,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_superuser(username='admin', password='adminpass'):
    u = User.objects.create_superuser(username=username, password=password, email=f'{username}@test.com')
    return u


def make_staff(username='staff', password='staffpass'):
    u = User.objects.create_user(username=username, password=password, email=f'{username}@test.com', is_staff=True)
    return u


def make_user(username='user', password='userpass'):
    u = User.objects.create_user(username=username, password=password, email=f'{username}@test.com')
    return u


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.1 — Job Posting Tests
# ─────────────────────────────────────────────────────────────────────────────

class JobPostingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_superuser()
        self.anon_client = APIClient()

    def _make_job_payload(self, **overrides):
        data = {
            'title': 'Backend Engineer',
            'department': 'engineering',
            'description': 'Build APIs',
            'requirements': '3+ years Python',
            'type': 'full_time',
            'experience_level': 'mid',
            'status': 'open',
        }
        data.update(overrides)
        return data

    def test_public_can_list_jobs(self):
        """Unauthenticated users can list open jobs."""
        resp = self.anon_client.get('/api/employment/jobs/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_admin_can_create_job(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/employment/jobs/', self._make_job_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['title'], 'Backend Engineer')

    def test_anon_cannot_create_job(self):
        resp = self.anon_client.post('/api/employment/jobs/', self._make_job_payload(), format='json')
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_admin_can_update_job(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/employment/jobs/', self._make_job_payload(), format='json')
        job_id = resp.data['id']
        patch = self.client.patch(f'/api/employment/jobs/{job_id}/', {'title': 'Senior Backend Engineer'}, format='json')
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(patch.data['title'], 'Senior Backend Engineer')

    def test_close_job_action(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/employment/jobs/', self._make_job_payload(), format='json')
        job_id = resp.data['id']
        close = self.client.post(f'/api/employment/jobs/{job_id}/close/')
        self.assertEqual(close.status_code, status.HTTP_200_OK)
        self.assertEqual(close.data['status'], 'closed')


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.2 — Application Tests
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_superuser()
        self.anon = APIClient()

        # Create a job posting
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/employment/jobs/', {
            'title': 'DevOps Engineer',
            'department': 'engineering',
            'description': 'Manage infra',
            'requirements': 'K8s experience',
            'type': 'full_time',
            'experience_level': 'senior',
            'status': 'open',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.job_id = resp.data['id']
        self.client.force_authenticate(user=None)

    def _application_payload(self):
        return {
            'job': self.job_id,
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': 'jane@example.com',
            'phone': '555-1234',
            'cover_letter': 'I am great.',
        }

    def test_public_can_submit_application(self):
        resp = self.anon.post('/api/employment/applications/', self._application_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['email'], 'jane@example.com')

    def test_admin_can_list_applications(self):
        self.anon.post('/api/employment/applications/', self._application_payload(), format='json')
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/employment/applications/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        count = resp.data.get('count', len(resp.data.get('results', resp.data)))
        self.assertGreaterEqual(count, 1)

    def test_move_to_stage(self):
        self.anon.post('/api/employment/applications/', self._application_payload(), format='json')
        self.client.force_authenticate(user=self.admin)
        apps = self.client.get('/api/employment/applications/')
        app_id = apps.data['results'][0]['id']
        resp = self.client.post(
            f'/api/employment/applications/{app_id}/move_to_stage/',
            {'status': 'interview'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'interview')

    def test_move_to_stage_invalid_status(self):
        self.anon.post('/api/employment/applications/', self._application_payload(), format='json')
        self.client.force_authenticate(user=self.admin)
        apps = self.client.get('/api/employment/applications/')
        app_id = apps.data['results'][0]['id']
        resp = self.client.post(
            f'/api/employment/applications/{app_id}/move_to_stage/',
            {'status': 'invalid_xyz'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.3 — Public Track Endpoint Tests
# ─────────────────────────────────────────────────────────────────────────────

class TrackApplicationTests(TestCase):
    def setUp(self):
        self.admin_client = APIClient()
        self.admin = make_superuser('trackadmin')
        self.anon = APIClient()

        # Create job + application
        self.admin_client.force_authenticate(user=self.admin)
        job_resp = self.admin_client.post('/api/employment/jobs/', {
            'title': 'QA Engineer',
            'department': 'engineering',
            'description': 'Test everything',
            'requirements': 'Selenium',
            'type': 'contract',
            'experience_level': 'entry',
            'status': 'open',
        }, format='json')
        self.job_id = job_resp.data['id']
        self.admin_client.force_authenticate(user=None)

        app_resp = self.anon.post('/api/employment/applications/', {
            'job': self.job_id,
            'first_name': 'Bob',
            'last_name': 'Smith',
            'email': 'bob@example.com',
            'phone': '555-9999',
        }, format='json')
        self.app_email = 'bob@example.com'

    def test_track_returns_status(self):
        resp = self.anon.get(f'/api/employment/applications/track/?email={self.app_email}&job_id={self.job_id}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('status', resp.data)
        self.assertIn('job_title', resp.data)
        self.assertIn('submitted_at', resp.data)

    def test_track_missing_params(self):
        resp = self.anon.get('/api/employment/applications/track/?email=bob@example.com')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_track_not_found(self):
        resp = self.anon.get('/api/employment/applications/track/?email=nobody@example.com&job_id=' + str(self.job_id))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_track_does_not_expose_sensitive_data(self):
        resp = self.anon.get(f'/api/employment/applications/track/?email={self.app_email}&job_id={self.job_id}')
        self.assertNotIn('phone', resp.data)
        self.assertNotIn('cover_letter', resp.data)
        self.assertNotIn('documents', resp.data)


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.4 — Interview Tests
# ─────────────────────────────────────────────────────────────────────────────

class InterviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_superuser('interviewadmin')
        self.client.force_authenticate(user=self.admin)

        job_resp = self.client.post('/api/employment/jobs/', {
            'title': 'ML Engineer', 'department': 'engineering', 'description': 'ML stuff',
            'requirements': 'PyTorch', 'type': 'full_time', 'experience_level': 'senior', 'status': 'open',
        }, format='json')
        self.job_id = job_resp.data['id']

        app_resp = self.client.post('/api/employment/applications/', {
            'job': self.job_id, 'first_name': 'Alice', 'last_name': 'Wang',
            'email': 'alice@example.com', 'phone': '555-5555',
        }, format='json')
        self.app_id = app_resp.data['id']

    def test_schedule_interview(self):
        resp = self.client.post('/api/employment/interviews/', {
            'application': self.app_id,
            'interviewer': self.admin.id,
            'round': 1,
            'format': 'video',
            'status': 'scheduled',
            'duration_minutes': 60,
            'candidate_timezone': 'America/New_York',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['candidate_timezone'], 'America/New_York')

    def test_mark_interview_completed(self):
        create = self.client.post('/api/employment/interviews/', {
            'application': self.app_id,
            'interviewer': self.admin.id,
            'round': 1, 'format': 'phone', 'status': 'scheduled', 'duration_minutes': 30,
        }, format='json')
        ivid = create.data['id']
        resp = self.client.post(f'/api/employment/interviews/{ivid}/mark_completed/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'completed')


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.5 — Evaluation + Weighted Scoring Tests
# ─────────────────────────────────────────────────────────────────────────────

class EvaluationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_superuser('evaladmin')
        self.client.force_authenticate(user=self.admin)

        job_resp = self.client.post('/api/employment/jobs/', {
            'title': 'Data Analyst', 'department': 'engineering', 'description': 'Analyse data',
            'requirements': 'SQL', 'type': 'full_time', 'experience_level': 'entry', 'status': 'open',
        }, format='json')
        self.job_id = job_resp.data['id']

        app_resp = self.client.post('/api/employment/applications/', {
            'job': self.job_id, 'first_name': 'Carlos', 'last_name': 'Rivera',
            'email': 'carlos@example.com', 'phone': '555-0000',
        }, format='json')
        self.app_id = app_resp.data['id']

        iv_resp = self.client.post('/api/employment/interviews/', {
            'application': self.app_id, 'interviewer': self.admin.id,
            'round': 1, 'format': 'in_person', 'status': 'completed', 'duration_minutes': 60,
        }, format='json')
        self.iv_id = iv_resp.data['id']

    def test_submit_evaluation(self):
        resp = self.client.post('/api/employment/evaluations/', {
            'interview': self.iv_id,
            'application': self.app_id,
            'technical_score': 8,
            'communication_score': 7,
            'culture_score': 9,
            'problem_solving_score': 8,
            'experience_score': 6,
            'recommendation': 'hire',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('overall_score', resp.data)
        self.assertIn('weighted_score', resp.data)
        self.assertIsNotNone(resp.data['overall_score'])

    def test_weighted_score_calculation(self):
        """Weighted score = weighted avg using score_weights field."""
        resp = self.client.post('/api/employment/evaluations/', {
            'interview': self.iv_id,
            'application': self.app_id,
            'technical_score': 10,
            'communication_score': 5,
            'culture_score': 5,
            'problem_solving_score': 5,
            'experience_score': 5,
            'score_weights': {'technical': 4, 'communication': 1, 'culture': 1, 'problem_solving': 1, 'experience': 1},
            'recommendation': 'hire',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # technical (weight 4) = 10, others (weight 1 each) = 5
        # weighted_score = (10*4 + 5*1 + 5*1 + 5*1 + 5*1) / (4+1+1+1+1) = 60/8 = 7.5
        self.assertEqual(float(resp.data['weighted_score']), 7.5)

    def test_admin_approve_sets_offer(self):
        ev_resp = self.client.post('/api/employment/evaluations/', {
            'interview': self.iv_id, 'application': self.app_id,
            'technical_score': 9, 'recommendation': 'hire',
        }, format='json')
        ev_id = ev_resp.data['id']
        resp = self.client.post(f'/api/employment/evaluations/{ev_id}/admin_approve/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['admin_decision'], 'approved')
        # Application status should be updated to 'offer'
        app = self.client.get(f'/api/employment/applications/{self.app_id}/')
        self.assertEqual(app.data['status'], 'offer')

    def test_admin_reject_sets_rejected(self):
        ev_resp = self.client.post('/api/employment/evaluations/', {
            'interview': self.iv_id, 'application': self.app_id,
            'technical_score': 3, 'recommendation': 'no_hire',
        }, format='json')
        ev_id = ev_resp.data['id']
        resp = self.client.post(f'/api/employment/evaluations/{ev_id}/admin_reject/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['admin_decision'], 'rejected')

    def test_by_applicant_endpoint(self):
        self.client.post('/api/employment/evaluations/', {
            'interview': self.iv_id, 'application': self.app_id,
            'technical_score': 7, 'recommendation': 'hire',
        }, format='json')
        resp = self.client.get(f'/api/employment/evaluations/by_applicant/?application_id={self.app_id}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_by_applicant_missing_param(self):
        resp = self.client.get('/api/employment/evaluations/by_applicant/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# §3.12.6 — convert_to_employee Tests
# ─────────────────────────────────────────────────────────────────────────────

class ConvertToEmployeeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_superuser('hreadmin')
        self.client.force_authenticate(user=self.admin)

        job_resp = self.client.post('/api/employment/jobs/', {
            'title': 'Product Manager', 'department': 'product', 'description': 'Manage products',
            'requirements': 'PM experience', 'type': 'full_time', 'experience_level': 'senior', 'status': 'open',
        }, format='json')
        self.job_id = job_resp.data['id']

        app_resp = self.client.post('/api/employment/applications/', {
            'job': self.job_id, 'first_name': 'Diana', 'last_name': 'Prince',
            'email': 'diana@example.com', 'phone': '555-7777',
        }, format='json')
        self.app_id = app_resp.data['id']

    def _set_status(self, app_id, new_status):
        return self.client.post(
            f'/api/employment/applications/{app_id}/move_to_stage/',
            {'status': new_status}, format='json',
        )

    def test_convert_requires_offer_status(self):
        # Application is still in 'submitted' state — should fail
        resp = self.client.post(f'/api/employment/applications/{self.app_id}/convert_to_employee/', {
            'department': 'product', 'role': 'Senior PM',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_convert_to_employee_success(self):
        # Move to offer first
        self._set_status(self.app_id, 'offer')
        resp = self.client.post(f'/api/employment/applications/{self.app_id}/convert_to_employee/', {
            'department': 'Product',
            'role': 'Senior PM',
            'salary': '120000',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('employee_id', resp.data)
        self.assertTrue(resp.data['employee_id'].startswith('EMP-'))

    def test_convert_twice_fails(self):
        self._set_status(self.app_id, 'offer')
        self.client.post(f'/api/employment/applications/{self.app_id}/convert_to_employee/', {
            'department': 'product', 'role': 'PM',
        }, format='json')
        # Second attempt should return 409 Conflict
        resp = self.client.post(f'/api/employment/applications/{self.app_id}/convert_to_employee/', {
            'department': 'product', 'role': 'PM',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_converted_application_has_hired_status(self):
        self._set_status(self.app_id, 'offer')
        self.client.post(f'/api/employment/applications/{self.app_id}/convert_to_employee/', {
            'department': 'product', 'role': 'PM',
        }, format='json')
        app_resp = self.client.get(f'/api/employment/applications/{self.app_id}/')
        self.assertEqual(app_resp.data['status'], 'hired')
