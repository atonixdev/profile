from django.contrib import admin
from .models import (
    Application, ApplicationDocument, Employee, EmploymentAuditLog,
    EmploymentNotification, Evaluation, Interview, JobPosting,
)


class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 0
    readonly_fields = ('uploaded_at', 'file_size')


class InterviewInline(admin.TabularInline):
    model = Interview
    extra = 0
    readonly_fields = ('created_at',)


class EvaluationInline(admin.TabularInline):
    model = Evaluation
    extra = 0
    readonly_fields = ('created_at', 'overall_score')


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display  = ('title', 'department', 'job_type', 'experience_level', 'status', 'created_at')
    list_filter   = ('status', 'department', 'job_type', 'experience_level', 'is_remote')
    search_fields = ('title', 'description', 'requirements')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display  = ('full_name', 'email', 'job', 'status', 'internal_rating', 'submitted_at')
    list_filter   = ('status', 'job__department')
    search_fields = ('first_name', 'last_name', 'email')
    readonly_fields = ('id', 'submitted_at', 'updated_at')
    inlines       = [ApplicationDocumentInline, InterviewInline, EvaluationInline]


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display  = ('application', 'round', 'format', 'status', 'interviewer', 'scheduled_at')
    list_filter   = ('status', 'format', 'round')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display  = ('application', 'evaluator', 'recommendation', 'admin_decision', 'overall_score', 'created_at')
    list_filter   = ('recommendation', 'admin_decision')
    readonly_fields = ('id', 'overall_score', 'created_at', 'updated_at')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display  = ('employee_id', 'full_name', 'department', 'role', 'status', 'start_date')
    list_filter   = ('status', 'department', 'role', 'is_remote')
    search_fields = ('first_name', 'last_name', 'email', 'employee_id')
    readonly_fields = ('id', 'employee_id', 'created_at', 'updated_at')


@admin.register(EmploymentNotification)
class EmploymentNotificationAdmin(admin.ModelAdmin):
    list_display  = ('notification_type', 'recipient_email', 'status', 'sent_at', 'created_at')
    list_filter   = ('status', 'notification_type')
    readonly_fields = ('id', 'created_at')


@admin.register(EmploymentAuditLog)
class EmploymentAuditLogAdmin(admin.ModelAdmin):
    list_display  = ('actor', 'action', 'resource_type', 'resource_id', 'created_at')
    list_filter   = ('action', 'resource_type')
    readonly_fields = ('id', 'created_at')
