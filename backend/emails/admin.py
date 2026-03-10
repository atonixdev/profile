from django.contrib import admin
from .models import EmailLog, SecurityAuditLog, EmailTemplate, SenderIdentity, Campaign, CampaignLog


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


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display  = ('template_id', 'name', 'category', 'permission', 'version', 'is_active', 'created_by', 'updated_at')
    list_filter   = ('category', 'permission', 'is_active')
    search_fields = ('template_id', 'name', 'subject')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SenderIdentity)
class SenderIdentityAdmin(admin.ModelAdmin):
    list_display  = ('display_name', 'email', 'domain', 'usage', 'is_verified', 'spf_verified', 'dkim_verified', 'dmarc_verified')
    list_filter   = ('usage', 'is_verified')
    search_fields = ('email', 'domain', 'display_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display  = ('name', 'template', 'sender_identity', 'status', 'recipient_count', 'delivered_count', 'scheduled_at', 'sent_at')
    list_filter   = ('status',)
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'sent_at')


@admin.register(CampaignLog)
class CampaignLogAdmin(admin.ModelAdmin):
    list_display  = ('campaign', 'recipient', 'status', 'sent_at', 'created_at')
    list_filter   = ('status',)
    search_fields = ('recipient', 'campaign__name')
    readonly_fields = ('campaign', 'recipient', 'status', 'error_message', 'metadata', 'sent_at', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

