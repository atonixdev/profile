from django.contrib import admin
from .models import Inquiry, AdminReply, Event


class AdminReplyInline(admin.TabularInline):
    model = AdminReply
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['admin_user', 'message', 'sent_via_email', 'email_sent_at', 'created_at']


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'country', 'inquiry_type', 'subject', 'status', 'assigned_to', 'created_at']
    list_filter = ['status', 'inquiry_type', 'country', 'created_at', 'assigned_to']
    search_fields = ['name', 'email', 'subject', 'message', 'country']
    list_editable = ['status', 'assigned_to']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'country', 'country_code']
    inlines = [AdminReplyInline]
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'company')
        }),
        ('Inquiry Details', {
            'fields': ('inquiry_type', 'subject', 'message', 'budget')
        }),
        ('Management', {
            'fields': ('status', 'assigned_to', 'notes')
        }),
        ('Metadata', {
            'fields': ('country', 'country_code', 'ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AdminReply)
class AdminReplyAdmin(admin.ModelAdmin):
    list_display = ['inquiry', 'admin_user', 'sent_via_email', 'created_at']
    list_filter = ['sent_via_email', 'created_at', 'admin_user']
    search_fields = ['inquiry__name', 'inquiry__email', 'message']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('inquiry', 'admin_user', 'message')
        }),
        ('Email Status', {
            'fields': ('sent_via_email', 'email_sent_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'priority', 'status', 'assigned_to', 'due_date', 'created_at']
    list_filter = ['event_type', 'priority', 'status', 'created_at', 'assigned_to']
    search_fields = ['title', 'description', 'notes']
    list_editable = ['status', 'priority', 'assigned_to']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'completed_at']
    
    fieldsets = (
        ('Event Details', {
            'fields': ('title', 'description', 'event_type', 'priority', 'status')
        }),
        ('Assignment', {
            'fields': ('created_by', 'assigned_to', 'transferred_from')
        }),
        ('Dates', {
            'fields': ('due_date', 'completed_at', 'created_at', 'updated_at')
        }),
        ('Related', {
            'fields': ('related_inquiry', 'notes')
        }),
    )
