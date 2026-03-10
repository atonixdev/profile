"""AtonixDev Employment Console — REST API Views
Founder Directive §5.2 — API-Driven Design

Part 1-3 Endpoints:
  POST   /api/employment/jobs/                                 — Create posting
  GET    /api/employment/jobs/                                 — List postings
  PATCH  /api/employment/jobs/<id>/                            — Update posting
  POST   /api/employment/jobs/<id>/close/                      — Close posting
  POST   /api/employment/applications/                         — Submit application (public)
  GET    /api/employment/applications/                         — List applications (ATS)
  GET    /api/employment/applications/track/                   — Public status tracker
  POST   /api/employment/applications/<id>/move_to_stage/      — ATS stage move
  POST   /api/employment/applications/<id>/assign_to/          — Assign interviewer
  POST   /api/employment/applications/<id>/convert_to_employee/ — Convert to employee
  POST   /api/employment/interviews/                           — Schedule interview
  GET    /api/employment/interviews/                           — List interviews
  POST   /api/employment/interviews/<id>/mark_completed/       — Complete interview
  POST   /api/employment/evaluations/                          — Submit evaluation
  GET    /api/employment/evaluations/by_applicant/             — Evaluations by application
  POST   /api/employment/evaluations/<id>/admin_approve/       — Admin approval
  POST   /api/employment/evaluations/<id>/admin_reject/        — Admin rejection
  GET    /api/employment/employees/                            — Employee directory
  GET    /api/employment/notifications/                        — List notifications
  POST   /api/employment/notifications/send/                   — Send notification
  GET    /api/employment/audit/                                — Audit log

Part 4 Governance & Compliance Endpoints:
  GET    /api/employment/applications/<id>/export_data/        — GDPR/CCPA data export
  POST   /api/employment/applications/<id>/anonymize/          — GDPR anonymize PII
  GET    /api/employment/metrics/                              — Pipeline metrics (§4.5)
  GET    /api/employment/audit/                                — Audit log (paginated)
  GET    /api/employment/audit/export/                         — Audit log CSV export
"""

import csv
import io
import logging

from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView

from .models import (
    Application, ApplicationDocument, Employee, EmploymentAuditLog,
    EmploymentNotification, Evaluation, Interview, JobPosting,
)
from .permissions import IsEmploymentAdmin, IsHROrAdmin, IsInterviewerOrAbove, IsAuthenticatedEmployee, IsSuperuserOnly
from .notifications import (
    notify_application_received, notify_interview_invite,
    notify_rejection, notify_offer_letter, notify_hire_confirmed,
    notify_status_changed,
)
from .serializers import (
    ApplicationDocumentSerializer, ApplicationListSerializer, ApplicationSerializer,
    EmployeeSerializer, EmploymentAuditLogSerializer, EmploymentNotificationSerializer,
    EvaluationSerializer, InterviewSerializer, JobPostingListSerializer, JobPostingSerializer,
)

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def log_audit(actor, action, resource_type, resource_id, details=None, request=None):
    """Log an action to audit trail."""
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    
    EmploymentAuditLog.objects.create(
        actor=actor,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip,
    )


# ─────────────────────────────────────────────────────────────────────────────
# §4.1 — Job Posting ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class JobPostingViewSet(ModelViewSet):
    """
    Job Postings CRUD.
    
    Public (GET) — list, retrieve
    HR/Admin (POST, PATCH, DELETE) — create, update, delete
    """
    queryset = JobPosting.objects.all()
    permission_classes = [IsHROrAdmin]

    def get_serializer_class(self):
        if self.action in ['list']:
            return JobPostingListSerializer
        return JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Public
        return [IsHROrAdmin()]

    def perform_create(self, serializer):
        job = serializer.save(created_by=self.request.user)
        log_audit(
            self.request.user, 'job_posting.created',
            'JobPosting', str(job.id),
            {'title': job.title, 'department': job.department},
            self.request,
        )

    def perform_update(self, serializer):
        job = serializer.save()
        log_audit(
            self.request.user, 'job_posting.updated',
            'JobPosting', str(job.id),
            {'changed_fields': list(serializer.validated_data.keys())},
            self.request,
        )

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a job posting."""
        job = self.get_object()
        job.status = 'closed'
        job.closed_at = timezone.now()
        job.save()
        log_audit(request.user, 'job_posting.closed', 'JobPosting', str(job.id), {}, request)
        return Response({'status': 'closed'})


# ─────────────────────────────────────────────────────────────────────────────
# §4.2 — Application ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationViewSet(ModelViewSet):
    """
    Application Management (ATS).
    
    Public (POST) — submit application
    Admin/Interviewer (GET, PATCH) — manage applications
    """
    queryset = Application.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return ApplicationListSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [AllowAny()]  # Public endpoints
        if self.action == 'convert_to_employee':
            return [IsHROrAdmin()]
        if self.action in ['list', 'retrieve', 'assign_to', 'move_to_stage']:
            return [IsInterviewerOrAbove()]
        return [IsHROrAdmin()]

    def get_queryset(self):
        """Filter by user permissions."""
        if self.request.user.is_staff:
            return Application.objects.all()
        return Application.objects.filter(assigned_to=self.request.user)

    def perform_create(self, serializer):
        app = serializer.save()
        log_audit(
            None, 'application.submitted',
            'Application', str(app.id),
            {'applicant': app.email, 'job': str(app.job.id)},
            self.request,
        )
        notify_application_received(app)

    def perform_update(self, serializer):
        app = serializer.save()
        log_audit(
            self.request.user, 'application.updated',
            'Application', str(app.id),
            {'status': app.status},
            self.request,
        )

    @action(detail=True, methods=['post'])
    def move_to_stage(self, request, pk=None):
        """Move application to next stage."""
        app = self.get_object()
        new_status = request.data.get('status')
        if new_status and new_status in dict(Application.STATUS_CHOICES):
            old_status = app.status
            app.status = new_status
            app.save()
            log_audit(request.user, 'application.stage_changed', 'Application', str(app.id), {'new_status': new_status}, request)
            notify_status_changed(app, old_status, new_status)
            if new_status == 'rejected':
                notify_rejection(app)
            elif new_status == 'offer':
                notify_offer_letter(app)
            return Response(ApplicationSerializer(app).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def assign_to(self, request, pk=None):
        """Assign application to interviewer."""
        app = self.get_object()
        user_id = request.data.get('interviewer_id')
        user = User.objects.filter(id=user_id).first()
        if user:
            app.assigned_to = user
            app.save()
            log_audit(request.user, 'application.assigned', 'Application', str(app.id), {'assigned_to_id': user_id}, request)
            return Response(ApplicationSerializer(app).data)
        return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsHROrAdmin])
    def convert_to_employee(self, request, pk=None):
        """§3.7 — Convert accepted application to Employee record.

        POST /api/employment/applications/:id/convert_to_employee/
        """
        app = self.get_object()

        if Employee.objects.filter(application=app).exists():
            return Response(
                {'error': 'An Employee record already exists for this application'},
                status=status.HTTP_409_CONFLICT,
            )

        if app.status != 'offer':
            return Response(
                {'error': "Application must be in 'offer' status to convert"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine the Django User to link (may not exist yet)
        user = User.objects.filter(email=app.email).first()

        department = request.data.get('department', '')
        role = request.data.get('role', '')
        start_date = request.data.get('start_date') or timezone.localdate()

        employee = Employee.objects.create(
            user=user,
            application=app,
            first_name=app.first_name,
            last_name=app.last_name,
            email=app.email,
            department=department,
            role=role,
            start_date=start_date,
            status='active',
        )

        app.status = 'hired'
        app.save()

        notify_hire_confirmed(app, employee)
        log_audit(
            request.user, 'employee.created',
            'Employee', str(employee.id),
            {'employee_id': employee.employee_id, 'from_application': str(app.id)},
            request,
        )
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='track')
    def track(self, request):
        """§3.10 — Public candidate status tracker.

        GET /api/employment/applications/track/?email=xxx&job_id=yyy
        Returns: status, job title, submitted_at, updated_at only.
        """
        email = request.query_params.get('email', '').strip().lower()
        job_id = request.query_params.get('job_id', '').strip()

        if not email or not job_id:
            return Response(
                {'error': 'Both email and job_id are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        app = Application.objects.filter(
            email__iexact=email,
            job_id=job_id,
        ).select_related('job').first()

        if not app:
            return Response({'error': 'No application found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'status': app.status,
            'job_title': app.job.title,
            'submitted_at': app.submitted_at,
            'updated_at': app.updated_at,
        })


# ─────────────────────────────────────────────────────────────────────────────
# §4.4 — Interview ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class InterviewViewSet(ModelViewSet):
    """Interview scheduling and management."""
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [IsInterviewerOrAbove]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHROrAdmin()]
        return [IsInterviewerOrAbove()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Interview.objects.all()
        return Interview.objects.filter(interviewer=self.request.user)

    def perform_create(self, serializer):
        interview = serializer.save()
        log_audit(
            self.request.user, 'interview.scheduled',
            'Interview', str(interview.id),
            {'round': interview.round, 'format': interview.format},
            self.request,
        )
        notify_interview_invite(interview)

    def perform_update(self, serializer):
        interview = serializer.save()
        log_audit(
            self.request.user, 'interview.updated',
            'Interview', str(interview.id),
            {'status': interview.status},
            self.request,
        )

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark interview as completed."""
        interview = self.get_object()
        interview.status = 'completed'
        interview.completed_at = timezone.now()
        interview.save()
        log_audit(request.user, 'interview.completed', 'Interview', str(interview.id), {}, request)
        return Response(InterviewSerializer(interview).data)


# ─────────────────────────────────────────────────────────────────────────────
# §4.5 — Evaluation ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class EvaluationViewSet(ModelViewSet):
    """Candidate evaluations and admin decisions."""
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsInterviewerOrAbove]

    def get_permissions(self):
        if self.action in ['admin_approve', 'admin_reject']:
            return [IsEmploymentAdmin()]
        return [IsInterviewerOrAbove()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Evaluation.objects.all()
        return Evaluation.objects.filter(evaluator=self.request.user)

    def perform_create(self, serializer):
        evaluation = serializer.save(evaluator=self.request.user)
        log_audit(
            self.request.user, 'evaluation.submitted',
            'Evaluation', str(evaluation.id),
            {'recommendation': evaluation.recommendation},
            self.request,
        )

    @action(detail=False, methods=['get'], url_path='by_applicant')
    def by_applicant(self, request):
        """§3.6 — Get all evaluations for a given application.

        GET /api/employment/evaluations/by_applicant/?application_id=xxx
        Requires IsInterviewerOrAbove.
        """
        application_id = request.query_params.get('application_id', '').strip()
        if not application_id:
            return Response({'error': 'application_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        evaluations = Evaluation.objects.filter(application_id=application_id)
        return Response(EvaluationSerializer(evaluations, many=True).data)

    @action(detail=True, methods=['post'])
    def admin_approve(self, request, pk=None):
        """Admin approval of candidate."""
        evaluation = self.get_object()
        evaluation.admin_decision = 'approved'
        evaluation.admin_decided_by = request.user
        evaluation.admin_decided_at = timezone.now()
        evaluation.save()
        
        # Update application status + notify
        app = evaluation.application
        app.status = 'offer'
        app.save()
        notify_offer_letter(app)
        notify_status_changed(app, 'evaluation', 'offer')
        
        log_audit(request.user, 'evaluation.approved', 'Evaluation', str(evaluation.id), {}, request)
        return Response(EvaluationSerializer(evaluation).data)

    @action(detail=True, methods=['post'])
    def admin_reject(self, request, pk=None):
        """Admin rejection of candidate."""
        evaluation = self.get_object()
        evaluation.admin_decision = 'rejected'
        evaluation.admin_decided_by = request.user
        evaluation.admin_decided_at = timezone.now()
        evaluation.save()
        
        # Update application status + notify
        app = evaluation.application
        app.status = 'rejected'
        app.save()
        notify_rejection(app)
        notify_status_changed(app, 'evaluation', 'rejected')
        
        log_audit(request.user, 'evaluation.rejected', 'Evaluation', str(evaluation.id), {}, request)
        return Response(EvaluationSerializer(evaluation).data)


# ─────────────────────────────────────────────────────────────────────────────
# §4.6 — Employee Directory ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class EmployeeViewSet(ModelViewSet):
    """Employee directory (authenticated employees can read, admin can write)."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticatedEmployee]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticatedEmployee()]
        return [IsEmploymentAdmin()]


# ─────────────────────────────────────────────────────────────────────────────
# §4.7 — Notification View
# ─────────────────────────────────────────────────────────────────────────────

class NotificationListView(APIView):
    """List notifications (admin)."""
    permission_classes = [IsHROrAdmin]

    def get(self, request):
        notifications = EmploymentNotification.objects.all()
        serializer = EmploymentNotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class SendNotificationView(APIView):
    """Send notification (admin)."""
    permission_classes = [IsHROrAdmin]

    def post(self, request):
        data = request.data
        notification = EmploymentNotification.objects.create(
            application_id=data.get('application_id'),
            recipient_email=data['recipient_email'],
            recipient_name=data['recipient_name'],
            notification_type=data['notification_type'],
            subject=data['subject'],
            body=data['body'],
            sent_by=request.user,
        )
        
        # TODO: Send email via email service
        notification.status = 'sent'
        notification.sent_at = timezone.now()
        notification.save()
        
        log_audit(request.user, 'notification.sent', 'EmploymentNotification', str(notification.id), {}, request)
        return Response(EmploymentNotificationSerializer(notification).data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# §3.3/§3.4 — Audit Log View
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogView(APIView):
    """§4.4C — Paginated, filterable audit log.

    GET /api/employment/audit/
    Query params:
      - resource_type   (exact)
      - action          (case-insensitive contains)
      - since / until   (YYYY-MM-DD)
      - page / page_size (default 100)
    """
    permission_classes = [IsEmploymentAdmin]

    def get(self, request):
        qs = EmploymentAuditLog.objects.select_related('actor').order_by('-created_at')

        resource_type = request.query_params.get('resource_type', '')
        action_filter = request.query_params.get('action', '')
        since         = request.query_params.get('since', '')
        until         = request.query_params.get('until', '')

        if resource_type:
            qs = qs.filter(resource_type=resource_type)
        if action_filter:
            qs = qs.filter(action__icontains=action_filter)
        if since:
            qs = qs.filter(created_at__date__gte=since)
        if until:
            qs = qs.filter(created_at__date__lte=until)

        page_size = max(1, min(int(request.query_params.get('page_size', 100)), 1000))
        page      = max(1, int(request.query_params.get('page', 1)))
        total     = qs.count()
        offset    = (page - 1) * page_size

        logs = qs[offset: offset + page_size]
        serializer = EmploymentAuditLogSerializer(logs, many=True)
        return Response({
            'count':     total,
            'page':      page,
            'page_size': page_size,
            'results':   serializer.data,
        })


# ─────────────────────────────────────────────────────────────────────────────
# §4.4 — GDPR / CCPA Compliance Actions on ApplicationViewSet
# ─────────────────────────────────────────────────────────────────────────────

# These are @actions attached to ApplicationViewSet — appended post-class here
# via monkey-patching is messy; the actions are defined inline in the class above.
# The views below are standalone APIViews for non-standard compliance paths.


class ApplicationDataExportView(APIView):
    """§4.4A — GDPR/CCPA Subject Data Export.

    GET /api/employment/applications/<id>/export_data/
    Returns a full JSON export of all data held for this applicant.
    Requires superuser only (sensitive data operation).
    """
    permission_classes = [IsSuperuserOnly]

    def get(self, request, pk=None):
        app = Application.objects.filter(pk=pk).select_related('job').prefetch_related('documents', 'interviews__evaluation').first()
        if not app:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        from .serializers import ApplicationSerializer
        app_data = ApplicationSerializer(app).data

        # Gather evaluations
        evals = []
        for iv in app.interviews.all():
            if hasattr(iv, 'evaluation') and iv.evaluation:
                from .serializers import EvaluationSerializer
                evals.append(EvaluationSerializer(iv.evaluation).data)

        # Gather audit trail entries for this resource
        audit_entries = list(
            EmploymentAuditLog.objects.filter(
                resource_type='Application',
                resource_id=str(app.id),
            ).values('action', 'created_at', 'ip_address')
        )

        export = {
            'export_generated_at': timezone.now().isoformat(),
            'export_format': 'GDPR Subject Data Export v1.0',
            'application': app_data,
            'evaluations': evals,
            'audit_trail': audit_entries,
        }

        log_audit(
            request.user, 'compliance.data_exported',
            'Application', str(app.id),
            {'requested_by': request.user.username},
            request,
        )
        return Response(export)


class ApplicationAnonymizeView(APIView):
    """§4.4A — GDPR/CCPA Right to Erasure / Data Minimization.

    POST /api/employment/applications/<id>/anonymize/
    Replaces all PII with [REDACTED] tokens.
    Irreversible. Requires superuser only (sensitive operation).
    """
    permission_classes = [IsSuperuserOnly]

    _PII_OVERRIDES = {
        'first_name':       '[REDACTED]',
        'last_name':        '[REDACTED]',
        'email':            'redacted@atonixdev.invalid',
        'phone':            '',
        'location':         '',
        'linkedin_url':     '',
        'portfolio_url':    '',
        'github_url':       '',
        'cover_letter':     '',
        'screening_answers': {},
        'notes':            '',
        'internal_rating':  None,
    }

    def post(self, request, pk=None):
        app = Application.objects.filter(pk=pk).first()
        if not app:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        if app.status == 'hired':
            return Response(
                {'error': 'Cannot anonymize a hired applicant — Employee record exists'},
                status=status.HTTP_409_CONFLICT,
            )

        original_name = app.full_name
        for field, value in self._PII_OVERRIDES.items():
            setattr(app, field, value)
        app.save(update_fields=list(self._PII_OVERRIDES.keys()))

        # Also delete uploaded documents (data minimization)
        docs_deleted, _ = app.documents.all().delete()

        log_audit(
            request.user, 'compliance.application_anonymized',
            'Application', str(app.id),
            {
                'original_name': original_name,
                'documents_deleted': docs_deleted,
                'requested_by': request.user.username,
            },
            request,
        )
        return Response({
            'status': 'anonymized',
            'application_id': str(app.id),
            'documents_deleted': docs_deleted,
        })


# ─────────────────────────────────────────────────────────────────────────────
# §4.5 — Employment Pipeline Metrics (Observability)
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentMetricsView(APIView):
    """§4.5 — Employment Pipeline Metrics.

    GET /api/employment/metrics/
    Returns pipeline conversion rates, daily application volume,
    interview success rates, and stage breakdown.
    Requires IsHROrAdmin.
    """
    permission_classes = [IsHROrAdmin]

    def get(self, request):
        from django.db.models.functions import TruncDate
        from .models import Interview, JobPosting

        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        seven_days_ago  = now - timezone.timedelta(days=7)

        # ── Pipeline stage summary ────────────────────────────────────────────
        stage_counts = dict(
            Application.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )

        # ── Applications per day (last 30 days) ──────────────────────────────
        daily_apps = list(
            Application.objects.filter(submitted_at__gte=thirty_days_ago)
            .annotate(day=TruncDate('submitted_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
            .values_list('day', 'count')
        )
        daily_apps_serialized = [
            {'date': str(d), 'count': c} for d, c in daily_apps
        ]

        # ── Conversion rates ─────────────────────────────────────────────────
        total_apps   = Application.objects.count()
        shortlisted  = Application.objects.filter(status__in=['shortlisted', 'interview', 'evaluation', 'offer', 'hired']).count()
        interviewed  = Application.objects.filter(status__in=['interview', 'evaluation', 'offer', 'hired']).count()
        evaluated    = Application.objects.filter(status__in=['evaluation', 'offer', 'hired']).count()
        offered      = Application.objects.filter(status__in=['offer', 'hired']).count()
        hired_count  = Application.objects.filter(status='hired').count()

        def rate(a, b):
            return round(a / b * 100, 1) if b else 0.0

        conversion = {
            'applied_to_shortlisted':     rate(shortlisted, total_apps),
            'shortlisted_to_interviewed': rate(interviewed, shortlisted),
            'interviewed_to_evaluated':   rate(evaluated, interviewed),
            'evaluated_to_offered':       rate(offered, evaluated),
            'offered_to_hired':           rate(hired_count, offered),
            'overall_hire_rate':          rate(hired_count, total_apps),
        }

        # ── Interview engine health (last 30 days) ───────────────────────────
        recent_interviews = Interview.objects.filter(created_at__gte=thirty_days_ago)
        iv_total    = recent_interviews.count()
        iv_complete = recent_interviews.filter(status='completed').count()
        iv_no_show  = recent_interviews.filter(status='no_show').count()

        # ── Open jobs ────────────────────────────────────────────────────────
        open_jobs = JobPosting.objects.filter(status='open').count()
        jobs_by_dept = list(
            JobPosting.objects.filter(status='open')
            .values('department')
            .annotate(count=Count('id'))
            .values_list('department', 'count')
        )

        # ── Recent activity (7 days) ─────────────────────────────────────────
        recent_apps    = Application.objects.filter(submitted_at__gte=seven_days_ago).count()
        recent_hires   = Application.objects.filter(status='hired', updated_at__gte=seven_days_ago).count()
        recent_offers  = Application.objects.filter(status='offer',  updated_at__gte=seven_days_ago).count()

        return Response({
            'generated_at':    now.isoformat(),
            'totals': {
                'applications':  total_apps,
                'open_jobs':     open_jobs,
                'employees':     Employee.objects.filter(status='active').count(),
            },
            'pipeline_stages': stage_counts,
            'conversion_rates': conversion,
            'daily_applications_30d': daily_apps_serialized,
            'interview_health_30d': {
                'total':      iv_total,
                'completed':  iv_complete,
                'no_shows':   iv_no_show,
                'success_rate': rate(iv_complete, iv_total),
            },
            'open_jobs_by_department': [
                {'department': d, 'count': c} for d, c in jobs_by_dept
            ],
            'activity_7d': {
                'new_applications': recent_apps,
                'offers_extended':  recent_offers,
                'new_hires':        recent_hires,
            },
        })


# ─────────────────────────────────────────────────────────────────────────────
# §4.4C — Audit Log CSV Export
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogExportView(APIView):
    """§4.4C — Export full audit log as CSV.

    GET /api/employment/audit/export/
    Streams a CSV file. Requires IsEmploymentAdmin.
    """
    permission_classes = [IsEmploymentAdmin]

    FIELDS = [
        'created_at', 'actor__username', 'action',
        'resource_type', 'resource_id', 'ip_address',
    ]
    HEADERS = [
        'Timestamp', 'Actor', 'Action',
        'Resource Type', 'Resource ID', 'IP Address',
    ]

    def get(self, request):
        qs = EmploymentAuditLog.objects.select_related('actor').order_by('created_at')

        # Optional date range filter
        since = request.query_params.get('since')
        until = request.query_params.get('until')
        if since:
            qs = qs.filter(created_at__date__gte=since)
        if until:
            qs = qs.filter(created_at__date__lte=until)

        log_audit(
            request.user, 'compliance.audit_exported',
            'AuditLog', 'bulk',
            {'since': since, 'until': until, 'exported_by': request.user.username},
            request,
        )

        def stream_csv():
            buf = io.StringIO()
            writer = csv.writer(buf)
            writer.writerow(self.HEADERS)
            yield buf.getvalue()

            rows = qs.values_list(
                'created_at', 'actor__username', 'action',
                'resource_type', 'resource_id', 'ip_address',
            )
            for row in rows.iterator(chunk_size=500):
                buf = io.StringIO()
                writer = csv.writer(buf)
                writer.writerow(row)
                yield buf.getvalue()

        filename = f'employment_audit_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv'
        response = StreamingHttpResponse(stream_csv(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
