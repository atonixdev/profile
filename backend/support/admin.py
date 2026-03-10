from django.contrib import admin
from .models import SupportTicket, TicketReply, TicketAuditLog


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display  = ('ticket_ref', 'name', 'email', 'category', 'status', 'priority', 'assigned_to', 'created_at')
    list_filter   = ('status', 'category', 'priority')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('id', 'ticket_ref', 'created_at', 'updated_at', 'ip_address', 'user_agent')


@admin.register(TicketReply)
class TicketReplyAdmin(admin.ModelAdmin):
    list_display  = ('ticket', 'sender_type', 'sender_user', 'is_internal', 'created_at')
    list_filter   = ('sender_type', 'is_internal')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(TicketAuditLog)
class TicketAuditLogAdmin(admin.ModelAdmin):
    list_display  = ('ticket', 'actor', 'action', 'created_at')
    readonly_fields = ('ticket', 'actor', 'action', 'detail', 'created_at')
