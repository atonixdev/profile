from rest_framework import serializers
from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
)


class FounderDirectiveSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = FounderDirective
        fields = '__all__'

    def get_author_name(self, obj):
        if obj.author:
            return f'{obj.author.first_name} {obj.author.last_name}'.strip() or obj.author.username
        return None


class CulturalGuidelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CulturalGuideline
        fields = '__all__'


class InvestorDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = InvestorDocument
        fields = '__all__'

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f'{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}'.strip() or obj.uploaded_by.username
        return None


class StakeholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stakeholder
        fields = '__all__'


class ResourceAllocationSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = ResourceAllocation
        fields = '__all__'

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None


class BrandTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandToken
        fields = '__all__'


class PortalAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = PortalAuditLog
        fields = '__all__'

    def get_actor_name(self, obj):
        if obj.actor:
            return f'{obj.actor.first_name} {obj.actor.last_name}'.strip() or obj.actor.username
        return None
