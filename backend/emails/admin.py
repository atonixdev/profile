from django.contrib import admin
from .models import EmailLog, SecurityAuditLog


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display  = ('recipient', 'email_type', 'subject', 'status', 'ip_address', 'created_at')
    list_filter   = ('status', 'email_type', 'created_at')
    search_fields = ('recipient', 'subject', 'email_type')
    readonly_fields = ('recipient', 'subject', 'email_type', 'template_name',
                       'status', 'error_message', 'ip_address', 'metadata', 'created_at')
    ordering      = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(admin.ModelAdmin):
    list_display  = ('action', 'actor', 'target_email', 'ip_address', 'description', 'created_at')
    list_filter   = ('action', 'created_at')
    search_fields = ('actor__email', 'target_email', 'ip_address', 'description')
    readonly_fields = ('actor', 'action', 'target_user', 'target_email', 'ip_address',
                       'user_agent', 'description', 'metadata', 'email_log', 'created_at')
    ordering      = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
