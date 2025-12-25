from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Inquiry, AdminReply, Event


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class AdminReplySerializer(serializers.ModelSerializer):
    """Serializer for admin replies"""
    admin_user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminReply
        fields = [
            'id', 'inquiry', 'admin_user', 'message', 'sent_via_email',
            'email_sent_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'admin_user']


class InquirySerializer(serializers.ModelSerializer):
    replies = AdminReplySerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'inquiry_type',
            'subject', 'message', 'budget', 'status', 'notes', 'assigned_to',
            'ip_address', 'country', 'country_code', 'replies', 'reply_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'ip_address', 'country', 'country_code']
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class InquiryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for inquiry lists"""
    assigned_to = UserSerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'name', 'email', 'inquiry_type', 'subject',
            'status', 'assigned_to', 'reply_count', 'created_at', 'updated_at'
        ]
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class InquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inquiries (public form submission)"""
    
    class Meta:
        model = Inquiry
        fields = [
            'name', 'email', 'phone', 'company', 'inquiry_type',
            'subject', 'message', 'budget', 'country', 'country_code'
        ]


class InquiryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin updating inquiry"""
    
    class Meta:
        model = Inquiry
        fields = ['status', 'notes', 'assigned_to']


class EventSerializer(serializers.ModelSerializer):
    """Serializer for events"""
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    transferred_from = UserSerializer(read_only=True)
    related_inquiry = InquiryListSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'priority', 'status',
            'created_by', 'assigned_to', 'transferred_from', 'related_inquiry',
            'due_date', 'completed_at', 'created_at', 'updated_at', 'notes'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event lists"""
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'event_type', 'priority', 'status',
            'created_by', 'assigned_to', 'due_date', 'created_at'
        ]


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating events"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'priority', 'status',
            'assigned_to', 'due_date', 'notes', 'related_inquiry'
        ]
