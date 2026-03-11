"""
AtonixCorp — Financial Dashboard Serializers
"""

from decimal import Decimal
from rest_framework import serializers
from .models import (
    CurrencyRate, Department, DepartmentExpense,
    Budget, Forecast,
    Vendor, VendorContract, ProcurementRequest,
    ComplianceCheck, FinancialAuditLog,
)


class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()
    budget_allocated = serializers.SerializerMethodField()
    budget_spent = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_head_name(self, obj):
        if obj.head:
            return f'{obj.head.first_name} {obj.head.last_name}'.strip() or obj.head.username
        return None

    def get_total_expenses(self, obj):
        return str(obj.expenses.aggregate(total=serializers.models.Sum('amount'))['total'] or Decimal('0'))

    def get_budget_allocated(self, obj):
        return str(obj.budgets.filter(status__in=['approved', 'active']).aggregate(
            total=serializers.models.Sum('allocated'))['total'] or Decimal('0'))

    def get_budget_spent(self, obj):
        return str(obj.budgets.filter(status__in=['approved', 'active']).aggregate(
            total=serializers.models.Sum('spent'))['total'] or Decimal('0'))


class DepartmentExpenseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = DepartmentExpense
        fields = '__all__'


class BudgetSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()
    remaining = serializers.DecimalField(max_digits=16, decimal_places=2, read_only=True)
    utilization_pct = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = Budget
        fields = '__all__'

    def get_department_name(self, obj):
        return obj.department.name if obj.department else 'Company-wide'


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = '__all__'


class VendorSerializer(serializers.ModelSerializer):
    active_contracts = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = '__all__'

    def get_active_contracts(self, obj):
        return obj.contracts.filter(status='active').count()

    def get_total_contract_value(self, obj):
        return str(obj.contracts.filter(status='active').aggregate(
            total=serializers.models.Sum('total_value'))['total'] or Decimal('0'))


class VendorContractSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)

    class Meta:
        model = VendorContract
        fields = '__all__'


class ProcurementRequestSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    requested_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProcurementRequest
        fields = '__all__'

    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f'{obj.requested_by.first_name} {obj.requested_by.last_name}'.strip() or obj.requested_by.username
        return None


class ComplianceCheckSerializer(serializers.ModelSerializer):
    checked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplianceCheck
        fields = '__all__'

    def get_checked_by_name(self, obj):
        if obj.checked_by:
            return f'{obj.checked_by.first_name} {obj.checked_by.last_name}'.strip() or obj.checked_by.username
        return None


class FinancialAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAuditLog
        fields = '__all__'
