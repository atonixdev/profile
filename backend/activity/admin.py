from django.contrib import admin
from .models import ActivityEvent


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'action', 'actor', 'path', 'method', 'status_code', 'duration_ms')
    list_filter = ('action', 'method', 'status_code', 'created_at')
    search_fields = ('path', 'user_agent', 'referrer', 'object_id')
    readonly_fields = ('created_at',)
