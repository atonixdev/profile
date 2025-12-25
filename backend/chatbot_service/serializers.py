from rest_framework import serializers
from .models import ChatConversation, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'admin_name', 'created_at']


class ChatConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'visitor_name', 'visitor_email', 'visitor_phone', 'status', 
                  'service_interest', 'project_description', 'budget', 'messages',
                  'created_at', 'updated_at', 'closed_at']
