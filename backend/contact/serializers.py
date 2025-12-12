from rest_framework import serializers
from .models import Inquiry


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'inquiry_type',
            'subject', 'message', 'budget', 'status', 'notes',
            'ip_address', 'country', 'country_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'status', 'ip_address', 'country', 'country_code']
        extra_kwargs = {
            'notes': {'write_only': True}
        }


class InquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inquiries (public form submission)"""
    
    class Meta:
        model = Inquiry
        fields = [
            'name', 'email', 'phone', 'company', 'inquiry_type',
            'subject', 'message', 'budget', 'country', 'country_code'
        ]
