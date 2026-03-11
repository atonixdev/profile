from rest_framework import serializers
from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
    Task, OKR, SecureMessage, Deployment, MonitoringAlert,
    Campaign, DesignStandard, InvestorUpdate, IntegrationConfig,
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


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = '__all__'
    def get_assignee_name(self, obj):
        if obj.assignee:
            return f'{obj.assignee.first_name} {obj.assignee.last_name}'.strip() or obj.assignee.username
        return None


class OKRSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    class Meta:
        model = OKR
        fields = '__all__'
    def get_owner_name(self, obj):
        if obj.owner:
            return f'{obj.owner.first_name} {obj.owner.last_name}'.strip() or obj.owner.username
        return None


class SecureMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    class Meta:
        model = SecureMessage
        fields = '__all__'
    def get_sender_name(self, obj):
        if obj.sender:
            return f'{obj.sender.first_name} {obj.sender.last_name}'.strip() or obj.sender.username
        return None


class DeploymentSerializer(serializers.ModelSerializer):
    triggered_by_name = serializers.SerializerMethodField()
    class Meta:
        model = Deployment
        fields = '__all__'
    def get_triggered_by_name(self, obj):
        if obj.triggered_by:
            return f'{obj.triggered_by.first_name} {obj.triggered_by.last_name}'.strip() or obj.triggered_by.username
        return None


class MonitoringAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringAlert
        fields = '__all__'


class CampaignSerializer(serializers.ModelSerializer):
    roi = serializers.ReadOnlyField()
    ctr = serializers.ReadOnlyField()
    class Meta:
        model = Campaign
        fields = '__all__'


class DesignStandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignStandard
        fields = '__all__'


class InvestorUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    class Meta:
        model = InvestorUpdate
        fields = '__all__'
    def get_author_name(self, obj):
        if obj.author:
            return f'{obj.author.first_name} {obj.author.last_name}'.strip() or obj.author.username
        return None


class IntegrationConfigSerializer(serializers.ModelSerializer):
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    class Meta:
        model = IntegrationConfig
        fields = '__all__'
