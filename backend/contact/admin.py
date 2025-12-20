from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'country', 'inquiry_type', 'subject', 'status', 'created_at']
    list_filter = ['status', 'inquiry_type', 'country', 'created_at']
    search_fields = ['name', 'email', 'phone', 'subject', 'message', 'country', 'company']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'country', 'country_code', 'contact_info']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('contact_info', 'name', 'email', 'phone', 'company'),
            'description': 'Use this information to contact the user back'
        }),
        ('Inquiry Details', {
            'fields': ('inquiry_type', 'subject', 'message', 'budget')
        }),
        ('Management', {
            'fields': ('status', 'notes')
        }),
        ('Metadata', {
            'fields': ('country', 'country_code', 'ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def contact_info(self, obj):
        """Display contact information prominently"""
        if obj.email or obj.phone:
            info = "<strong>Ways to contact this user:</strong><br>"
            if obj.email:
                info += f"Email: <a href='mailto:{obj.email}'>{obj.email}</a><br>"
            if obj.phone:
                info += f"Phone: <a href='tel:{obj.phone}'>{obj.phone}</a>"
            return info
        return "No contact information provided"
    
    contact_info.short_description = "Contact Information"
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields read-only when viewing"""
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing object
            readonly.extend(['created_at', 'updated_at'])
        return readonly
