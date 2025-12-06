from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'inquiry_type', 'subject', 'status', 'created_at']
    list_filter = ['status', 'inquiry_type', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'company')
        }),
        ('Inquiry Details', {
            'fields': ('inquiry_type', 'subject', 'message', 'budget')
        }),
        ('Management', {
            'fields': ('status', 'notes')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
