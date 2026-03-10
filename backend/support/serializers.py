from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SupportTicket, TicketReply, TicketAuditLog


class TicketReplySerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()

    class Meta:
        model = TicketReply
        fields = [
            'id', 'sender_type', 'sender_user', 'sender_username',
            'sender_name', 'message', 'is_internal', 'attachment', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'sender_username']

    def get_sender_username(self, obj):
        if obj.sender_user:
            return obj.sender_user.get_full_name() or obj.sender_user.username
        return obj.sender_name or 'User'


class TicketAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketAuditLog
        fields = ['id', 'actor', 'actor_name', 'action', 'detail', 'created_at']
        read_only_fields = fields

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return 'System'


class SupportTicketListSerializer(serializers.ModelSerializer):
    ticket_ref     = serializers.ReadOnlyField()
    reply_count    = serializers.SerializerMethodField()
    assigned_name  = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_ref', 'name', 'email', 'category', 'subject',
            'status', 'priority', 'assigned_to', 'assigned_name',
            'reply_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'ticket_ref', 'created_at', 'updated_at']

    def get_reply_count(self, obj):
        return obj.replies.filter(is_internal=False).count()

    def get_assigned_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None


class SupportTicketDetailSerializer(SupportTicketListSerializer):
    replies    = serializers.SerializerMethodField()
    audit_logs = TicketAuditLogSerializer(many=True, read_only=True)

    class Meta(SupportTicketListSerializer.Meta):
        fields = SupportTicketListSerializer.Meta.fields + [
            'message', 'attachment', 'internal_notes', 'ip_address',
            'replies', 'audit_logs',
        ]

    def get_replies(self, obj):
        request = self.context.get('request')
        # Staff see all replies (including internal); users see only non-internal
        qs = obj.replies.all()
        if not (request and request.user and request.user.is_staff):
            qs = qs.filter(is_internal=False)
        return TicketReplySerializer(qs, many=True, context=self.context).data


class SupportTicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['name', 'email', 'category', 'subject', 'message', 'attachment', 'priority']

    def validate_attachment(self, value):
        if value:
            from django.conf import settings
            max_mb = getattr(settings, 'SUPPORT_ATTACHMENT_MAX_MB', 10)
            if value.size > max_mb * 1024 * 1024:
                raise serializers.ValidationError(f'Attachment must be ≤ {max_mb} MB.')
            allowed = {'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
                       'text/plain', 'application/zip'}
            if value.content_type not in allowed:
                raise serializers.ValidationError('Unsupported file type.')
        return value


class ReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketReply
        fields = ['message', 'is_internal', 'attachment']

    def validate(self, attrs):
        request = self.context.get('request')
        if attrs.get('is_internal') and not (request and request.user and request.user.is_staff):
            raise serializers.ValidationError('Only staff can create internal notes.')
        return attrs
