from django.contrib import admin
from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
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
