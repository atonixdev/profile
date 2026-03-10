"""
AtonixDev Employment Console — REST Serializers
"""

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Application, ApplicationDocument, Employee, EmploymentAuditLog,
    EmploymentNotification, Evaluation, Interview, JobPosting,
)


# ─────────────────────────────────────────────────────────────────────────────
# Minimal user representation (used in nested fields)
# ─────────────────────────────────────────────────────────────────────────────

class UserMinimalSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'display_name')

    def get_display_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip() or obj.username


# ─────────────────────────────────────────────────────────────────────────────
# §4.1 — Job Posting
# ─────────────────────────────────────────────────────────────────────────────

class JobPostingSerializer(serializers.ModelSerializer):
    created_by_detail  = UserMinimalSerializer(source='created_by', read_only=True)
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model  = JobPosting
        fields = (
            'id', 'title', 'department', 'job_type', 'experience_level',
            'location', 'is_remote', 'description', 'requirements',
            'responsibilities', 'salary_min', 'salary_max', 'salary_currency',
            'screening_questions', 'status', 'created_by', 'created_by_detail',
            'opens_at', 'closes_at', 'created_at', 'updated_at',
            'applications_count',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobPostingListSerializer(serializers.ModelSerializer):
    """Lightweight version for list views."""
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model  = JobPosting
        fields = (
            'id', 'title', 'department', 'job_type', 'experience_level',
            'is_remote', 'status', 'created_at', 'applications_count',
        )

    def get_applications_count(self, obj):
        return obj.applications.count()


# ─────────────────────────────────────────────────────────────────────────────
# §4.2 — Application & Documents
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ApplicationDocument
        fields = ('id', 'doc_type', 'file', 'original_name', 'file_size', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at', 'file_size')


class ApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight version for ATS list."""
    full_name       = serializers.ReadOnlyField()
    job_title       = serializers.CharField(source='job.title', read_only=True)
    job_department  = serializers.CharField(source='job.department', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = (
            'id', 'full_name', 'first_name', 'last_name', 'email',
            'job', 'job_title', 'job_department',
            'status', 'internal_rating', 'assigned_to', 'assigned_to_name',
            'submitted_at', 'updated_at',
        )

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    full_name        = serializers.ReadOnlyField()
    job_detail       = JobPostingListSerializer(source='job', read_only=True)
    assigned_to_detail = UserMinimalSerializer(source='assigned_to', read_only=True)
    documents        = ApplicationDocumentSerializer(many=True, read_only=True)

    class Meta:
        model  = Application
        fields = (
            'id', 'job', 'job_detail',
            'first_name', 'last_name', 'full_name', 'email', 'phone', 'location',
            'linkedin_url', 'portfolio_url', 'github_url',
            'cover_letter', 'screening_answers',
            'status', 'assigned_to', 'assigned_to_detail',
            'notes', 'internal_rating', 'user',
            'documents', 'submitted_at', 'updated_at',
        )
        read_only_fields = ('id', 'submitted_at', 'updated_at')


# ─────────────────────────────────────────────────────────────────────────────
# §4.4 — Interview
# ─────────────────────────────────────────────────────────────────────────────

class InterviewSerializer(serializers.ModelSerializer):
    interviewer_detail  = UserMinimalSerializer(source='interviewer', read_only=True)
    application_name    = serializers.SerializerMethodField()
    application_job     = serializers.SerializerMethodField()
    has_evaluation      = serializers.SerializerMethodField()

    class Meta:
        model  = Interview
        fields = (
            'id', 'application', 'application_name', 'application_job',
            'interviewer', 'interviewer_detail',
            'round', 'format', 'status',
            'scheduled_at', 'duration_minutes', 'meeting_link',
            'candidate_timezone',
            'notes', 'completed_at', 'has_evaluation',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_application_name(self, obj):
        return obj.application.full_name

    def get_application_job(self, obj):
        return obj.application.job.title

    def get_has_evaluation(self, obj):
        return hasattr(obj, 'evaluation') and obj.evaluation is not None


# ─────────────────────────────────────────────────────────────────────────────
# §4.5 — Evaluation
# ─────────────────────────────────────────────────────────────────────────────

class EvaluationSerializer(serializers.ModelSerializer):
    evaluator_detail    = UserMinimalSerializer(source='evaluator', read_only=True)
    admin_decided_by_detail = UserMinimalSerializer(source='admin_decided_by', read_only=True)
    overall_score       = serializers.ReadOnlyField()
    weighted_score      = serializers.ReadOnlyField()  # §3.6 — weight-aware average
    application_name    = serializers.SerializerMethodField()
    application_job     = serializers.SerializerMethodField()

    class Meta:
        model  = Evaluation
        fields = (
            'id', 'interview', 'application', 'application_name', 'application_job',
            'evaluator', 'evaluator_detail',
            'technical_score', 'communication_score', 'culture_score',
            'problem_solving_score', 'experience_score', 'overall_score',
            'score_weights', 'weighted_score',
            'strengths', 'weaknesses', 'notes', 'recommendation',
            'admin_decision', 'admin_notes',
            'admin_decided_by', 'admin_decided_by_detail', 'admin_decided_at',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'overall_score', 'weighted_score', 'created_at', 'updated_at')

    def get_application_name(self, obj):
        return obj.application.full_name

    def get_application_job(self, obj):
        return obj.application.job.title


# ─────────────────────────────────────────────────────────────────────────────
# §4.6 — Employee Directory
# ─────────────────────────────────────────────────────────────────────────────

class EmployeeSerializer(serializers.ModelSerializer):
    full_name    = serializers.ReadOnlyField()
    user_detail  = UserMinimalSerializer(source='user', read_only=True)

    class Meta:
        model  = Employee
        fields = (
            'id', 'employee_id', 'user', 'user_detail', 'application',
            'first_name', 'last_name', 'full_name', 'email', 'phone',
            'department', 'role', 'title', 'status',
            'location', 'is_remote', 'start_date', 'end_date',
            'permissions', 'metadata',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'employee_id', 'created_at', 'updated_at')


# ─────────────────────────────────────────────────────────────────────────────
# §4.7 — Notifications
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentNotificationSerializer(serializers.ModelSerializer):
    sent_by_detail = UserMinimalSerializer(source='sent_by', read_only=True)

    class Meta:
        model  = EmploymentNotification
        fields = (
            'id', 'application', 'recipient_email', 'recipient_name',
            'notification_type', 'subject', 'body', 'status',
            'sent_at', 'sent_by', 'sent_by_detail',
            'error_message', 'metadata', 'created_at',
        )
        read_only_fields = ('id', 'status', 'sent_at', 'created_at')


# ─────────────────────────────────────────────────────────────────────────────
# §3.3/§3.4 — Audit Log
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentAuditLogSerializer(serializers.ModelSerializer):
    actor_detail = UserMinimalSerializer(source='actor', read_only=True)

    class Meta:
        model  = EmploymentAuditLog
        fields = ('id', 'actor', 'actor_detail', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'created_at')
        read_only_fields = ('id', 'created_at')
