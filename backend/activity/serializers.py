from rest_framework import serializers
from .models import ActivityEvent


class ActivityEventSerializer(serializers.ModelSerializer):
    actor_username = serializers.SerializerMethodField()
    object_type_label = serializers.SerializerMethodField()

    class Meta:
        model = ActivityEvent
        fields = [
            'id', 'created_at', 'action', 'actor', 'actor_username',
            'object_type', 'object_type_label', 'object_id',
            'path', 'method', 'status_code', 'duration_ms',
            'ip_address', 'user_agent', 'referrer', 'extra'
        ]

    def get_actor_username(self, obj):
        return getattr(obj.actor, 'username', None)

    def get_object_type_label(self, obj):
        return getattr(obj.object_type, 'model', None)
