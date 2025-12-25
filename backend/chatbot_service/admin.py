from django.contrib import admin
from .models import ChatConversation, ChatMessage


class ChatMessageInline(admin.TabularInline):
    """Inline display of messages within conversation"""
    model = ChatMessage
    extra = 0
    readonly_fields = ('message_type', 'content', 'admin_name', 'created_at')
    can_delete = False
    fields = ('message_type', 'content', 'admin_name', 'created_at')


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    """Admin interface for chat conversations"""
    list_display = ('id', 'visitor_name', 'visitor_email', 'status', 'message_count', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('visitor_name', 'visitor_email', 'service_interest', 'project_description')
    readonly_fields = ('id', 'created_at', 'updated_at', 'closed_at')
    inlines = [ChatMessageInline]
    
    fieldsets = (
        ('Visitor Information', {
            'fields': ('id', 'visitor_name', 'visitor_email', 'visitor_phone')
        }),
        ('Project Details', {
            'fields': ('service_interest', 'project_description', 'budget')
        }),
        ('Status & Timestamps', {
            'fields': ('status', 'created_at', 'updated_at', 'closed_at')
        }),
    )
    
    def message_count(self, obj):
        """Show count of messages in conversation"""
        return obj.messages.count()
    message_count.short_description = 'Messages'
    
    def get_readonly_fields(self, request, obj=None):
        """Make all fields except status and text fields read-only"""
        if obj:  # Editing existing conversation
            return self.readonly_fields + ('visitor_name', 'visitor_email', 'visitor_phone')
        return self.readonly_fields


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin interface for individual messages"""
    list_display = ('id', 'conversation_id', 'message_type', 'preview', 'admin_name', 'created_at')
    list_filter = ('message_type', 'created_at')
    search_fields = ('content', 'admin_name')
    readonly_fields = ('conversation', 'message_type', 'content', 'admin_name', 'created_at')
    
    fieldsets = (
        ('Message Info', {
            'fields': ('conversation', 'message_type', 'created_at')
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('wide',)
        }),
        ('Admin Response', {
            'fields': ('admin_name',)
        }),
    )
    
    def conversation_id(self, obj):
        """Show conversation ID as link"""
        return obj.conversation.id
    conversation_id.short_description = 'Conversation'
    
    def preview(self, obj):
        """Show preview of message content"""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    preview.short_description = 'Preview'
    
    def has_add_permission(self, request):
        """Prevent manual message creation in admin"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent message deletion"""
        return False
