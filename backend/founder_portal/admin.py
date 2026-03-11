from django.contrib import admin
from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
    Task, OKR, SecureMessage, Deployment, MonitoringAlert,
    Campaign, DesignStandard, InvestorUpdate, IntegrationConfig,
    DashboardRegistry, DashboardPermission,
)


@admin.register(FounderDirective)
class FounderDirectiveAdmin(admin.ModelAdmin):
    list_display   = ('title', 'priority', 'status', 'pinned', 'author', 'created_at')
    list_filter    = ('priority', 'status', 'pinned')
    search_fields  = ('title', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(CulturalGuideline)
class CulturalGuidelineAdmin(admin.ModelAdmin):
    list_display   = ('title', 'category', 'pinned', 'created_at')
    list_filter    = ('category', 'pinned')
    search_fields  = ('title', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(InvestorDocument)
class InvestorDocumentAdmin(admin.ModelAdmin):
    list_display   = ('title', 'doc_type', 'version', 'confidential', 'uploaded_by', 'created_at')
    list_filter    = ('doc_type', 'confidential')
    search_fields  = ('title', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Stakeholder)
class StakeholderAdmin(admin.ModelAdmin):
    list_display   = ('name', 'role', 'company', 'investment', 'is_active')
    list_filter    = ('role', 'is_active')
    search_fields  = ('name', 'email', 'company')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(ResourceAllocation)
class ResourceAllocationAdmin(admin.ModelAdmin):
    list_display   = ('resource_type', 'hostname', 'assigned_to', 'status', 'region', 'created_at')
    list_filter    = ('resource_type', 'status', 'region')
    search_fields  = ('hostname',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(BrandToken)
class BrandTokenAdmin(admin.ModelAdmin):
    list_display   = ('name', 'token_type', 'value', 'is_active')
    list_filter    = ('token_type', 'is_active')
    search_fields  = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(PortalAuditLog)
class PortalAuditLogAdmin(admin.ModelAdmin):
    list_display   = ('event_type', 'severity', 'module', 'actor', 'created_at')
    list_filter    = ('severity', 'module', 'event_type')
    search_fields  = ('description',)
    readonly_fields = ('id', 'event_type', 'actor', 'description', 'severity', 'module', 'metadata', 'created_at')

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display   = ('title', 'status', 'priority', 'department', 'assignee', 'due_date')
    list_filter    = ('status', 'priority', 'department')
    search_fields  = ('title', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(OKR)
class OKRAdmin(admin.ModelAdmin):
    list_display   = ('objective', 'quarter', 'status', 'progress', 'owner')
    list_filter    = ('status', 'quarter')
    search_fields  = ('objective',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(SecureMessage)
class SecureMessageAdmin(admin.ModelAdmin):
    list_display   = ('subject', 'channel', 'sender', 'is_read', 'created_at')
    list_filter    = ('channel', 'is_read')
    search_fields  = ('subject', 'body')
    readonly_fields = ('id', 'created_at')


@admin.register(Deployment)
class DeploymentAdmin(admin.ModelAdmin):
    list_display   = ('service', 'version', 'environment', 'status', 'triggered_by', 'created_at')
    list_filter    = ('environment', 'status')
    search_fields  = ('service', 'commit_sha', 'branch')
    readonly_fields = ('id', 'created_at')


@admin.register(MonitoringAlert)
class MonitoringAlertAdmin(admin.ModelAdmin):
    list_display   = ('title', 'service', 'severity', 'status', 'created_at')
    list_filter    = ('severity', 'status', 'service')
    search_fields  = ('title', 'description')
    readonly_fields = ('id', 'created_at')


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display   = ('name', 'channel', 'status', 'budget', 'spend', 'revenue', 'start_date', 'end_date')
    list_filter    = ('status', 'channel')
    search_fields  = ('name',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(DesignStandard)
class DesignStandardAdmin(admin.ModelAdmin):
    list_display   = ('title', 'category', 'version', 'is_active', 'created_at')
    list_filter    = ('category', 'is_active')
    search_fields  = ('title', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(InvestorUpdate)
class InvestorUpdateAdmin(admin.ModelAdmin):
    list_display   = ('subject', 'status', 'author', 'scheduled_at', 'sent_at', 'created_at')
    list_filter    = ('status',)
    search_fields  = ('subject', 'body')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    list_display   = ('provider', 'status', 'endpoint', 'last_synced')
    list_filter    = ('provider', 'status')
    search_fields  = ('endpoint',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(DashboardRegistry)
class DashboardRegistryAdmin(admin.ModelAdmin):
    list_display   = ('code', 'name', 'category', 'default_access', 'is_active', 'sort_order')
    list_filter    = ('category', 'default_access', 'is_active')
    search_fields  = ('code', 'name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('sort_order', 'name')


@admin.register(DashboardPermission)
class DashboardPermissionAdmin(admin.ModelAdmin):
    list_display   = ('dashboard', 'user', 'access_level', 'granted_by', 'granted_at')
    list_filter    = ('access_level', 'granted_at', 'dashboard__category')
    search_fields  = ('dashboard__code', 'dashboard__name', 'user__username')
    readonly_fields = ('id', 'granted_at')
    raw_id_fields = ('dashboard', 'user', 'granted_by')
