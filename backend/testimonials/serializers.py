from rest_framework import serializers
from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_title', 'client_company', 'client_avatar',
            'content', 'rating', 'project', 'is_featured', 'is_published',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
