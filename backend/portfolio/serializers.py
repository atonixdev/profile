from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'detailed_description', 'category',
            'technologies', 'live_url', 'github_url', 'thumbnail', 'images',
            'client', 'completion_date', 'is_featured', 'is_published',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
