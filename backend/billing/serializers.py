from decimal import Decimal

from rest_framework import serializers

from .models import (
    BillingAuditLog,
    Credit,
    Invoice,
    InvoiceLineItem,
    LedgerEntry,
    OrgBalance,
    Organization,
    Payment,
    PricingRule,
    UsageEvent,
)


class OrganizationSerializer(serializers.ModelSerializer):
    org_ref       = serializers.CharField(read_only=True)
    member_count  = serializers.SerializerMethodField()
    outstanding   = serializers.SerializerMethodField()

    class Meta:
        model  = Organization
        fields = [
            'id', 'org_ref', 'name', 'slug', 'plan', 'status',
            'member_count', 'outstanding', 'created_at',
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_outstanding(self, obj):
        try:
            return str(obj.balance.outstanding)
        except OrgBalance.DoesNotExist:
            return '0.00'


class PricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PricingRule
        fields = ['id', 'service', 'unit_type', 'unit_price', 'currency', 'version', 'is_active', 'effective_from']


class UsageEventSerializer(serializers.ModelSerializer):
    org_name = serializers.SerializerMethodField()

    class Meta:
        model  = UsageEvent
        fields = [
            'id', 'event_id', 'service', 'event_type',
            'org_name', 'organization_id_raw', 'project_id',
            'units', 'unit_type', 'unit_price', 'total_cost',
            'status', 'metadata', 'event_timestamp', 'received_at',
        ]

    def get_org_name(self, obj):
        return obj.organization.name if obj.organization else obj.organization_id_raw


class UsageEventIngestSerializer(serializers.Serializer):
    """Input schema for Layer 1 event ingestion endpoint."""
    event_id        = serializers.UUIDField()
    service         = serializers.CharField(max_length=30)
    event_type      = serializers.CharField(max_length=80)
    organization_id = serializers.CharField(max_length=120, required=False, allow_blank=True)
    user_id         = serializers.IntegerField(required=False, allow_null=True)
    project_id      = serializers.CharField(max_length=120, required=False, allow_blank=True)
    units           = serializers.DecimalField(max_digits=20, decimal_places=6)
    unit_type       = serializers.CharField(max_length=30)
    unit_price      = serializers.DecimalField(max_digits=12, decimal_places=6, required=False, default=Decimal('0'))
    metadata        = serializers.JSONField(required=False, default=dict)
    timestamp       = serializers.DateTimeField()


class LedgerEntrySerializer(serializers.ModelSerializer):
    org_name = serializers.SerializerMethodField()
    ref      = serializers.CharField(source='reference', read_only=True)

    class Meta:
        model  = LedgerEntry
        fields = [
            'id', 'seq', 'entry_type', 'org_name', 'service', 'unit_type',
            'units', 'unit_price', 'amount', 'running_balance', 'currency',
            'ref', 'note', 'created_at',
        ]

    def get_org_name(self, obj):
        return obj.organization.name if obj.organization else ''


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InvoiceLineItem
        fields = ['service', 'description', 'unit_type', 'units', 'unit_price', 'amount']


class InvoiceSerializer(serializers.ModelSerializer):
    org_name   = serializers.CharField(source='organization.name', read_only=True)
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Invoice
        fields = [
            'id', 'invoice_number', 'org_name', 'period_start', 'period_end',
            'subtotal', 'credits_applied', 'total', 'currency', 'status',
            'issued_at', 'due_date', 'paid_at', 'line_items', 'created_at',
        ]


class CreditSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model  = Credit
        fields = [
            'id', 'credit_number', 'org_name', 'credit_type', 'amount',
            'currency', 'reason', 'status', 'expires_at', 'created_at',
        ]


class PaymentSerializer(serializers.ModelSerializer):
    org_name       = serializers.CharField(source='organization.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)

    class Meta:
        model  = Payment
        fields = ['id', 'org_name', 'invoice_number', 'amount', 'currency', 'method', 'status', 'reference', 'paid_at', 'created_at']


class OrgBalanceSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model  = OrgBalance
        fields = ['org_name', 'total_charges', 'total_payments', 'total_credits', 'outstanding', 'currency', 'last_computed']


class BillingAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    org_name   = serializers.SerializerMethodField()

    class Meta:
        model  = BillingAuditLog
        fields = ['id', 'actor_name', 'actor_label', 'org_name', 'action', 'target', 'severity', 'ip_address', 'created_at']

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return obj.actor_label or 'system'

    def get_org_name(self, obj):
        return obj.organization.name if obj.organization else ''
