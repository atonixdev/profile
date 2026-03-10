from django.contrib import admin
from .models import (
    Organization, PricingRule, UsageEvent, LedgerEntry,
    Invoice, InvoiceLineItem, Credit, Payment, OrgBalance, BillingAuditLog,
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'plan', 'status', 'created_at')
    list_filter   = ('plan', 'status')
    search_fields = ('name', 'slug')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display  = ('service', 'unit_type', 'unit_price', 'version', 'is_active', 'effective_from')
    list_filter   = ('service', 'is_active')
    readonly_fields = ('id', 'created_at')


@admin.register(UsageEvent)
class UsageEventAdmin(admin.ModelAdmin):
    list_display  = ('event_id', 'service', 'event_type', 'organization', 'units', 'unit_type', 'status', 'event_timestamp')
    list_filter   = ('service', 'status')
    search_fields = ('event_id',)
    readonly_fields = ('id', 'event_id', 'received_at')


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display  = ('seq', 'organization', 'entry_type', 'amount', 'running_balance', 'created_at')
    list_filter   = ('entry_type',)
    readonly_fields = ('id', 'seq', 'created_at')  # immutable

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class InvoiceLineItemInline(admin.TabularInline):
    model   = InvoiceLineItem
    extra   = 0
    readonly_fields = ('id',)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display  = ('invoice_number', 'organization', 'period_start', 'period_end', 'total', 'status')
    list_filter   = ('status',)
    search_fields = ('invoice_number',)
    inlines       = [InvoiceLineItemInline]
    readonly_fields = ('id', 'invoice_number', 'created_at', 'updated_at')


@admin.register(Credit)
class CreditAdmin(admin.ModelAdmin):
    list_display  = ('credit_number', 'organization', 'credit_type', 'amount', 'status', 'created_at')
    list_filter   = ('credit_type', 'status')
    readonly_fields = ('id', 'credit_number', 'created_at', 'updated_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('organization', 'invoice', 'amount', 'method', 'status', 'created_at')
    list_filter   = ('method', 'status')
    readonly_fields = ('id', 'created_at')


@admin.register(OrgBalance)
class OrgBalanceAdmin(admin.ModelAdmin):
    list_display  = ('organization', 'total_charges', 'total_payments', 'total_credits', 'outstanding', 'last_computed')
    readonly_fields = ('id', 'last_computed')


@admin.register(BillingAuditLog)
class BillingAuditLogAdmin(admin.ModelAdmin):
    list_display  = ('created_at', 'actor_label', 'action', 'target', 'severity')
    list_filter   = ('severity', 'action')
    readonly_fields = ('id', 'created_at')

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
