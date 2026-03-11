from django.contrib import admin
from .models import (
    CurrencyRate, Department, DepartmentExpense,
    Budget, Forecast,
    Vendor, VendorContract, ProcurementRequest,
    ComplianceCheck, FinancialAuditLog,
)


@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    list_display = ('base_currency', 'target_currency', 'rate', 'effective_date')
    list_filter = ('base_currency', 'target_currency')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'head', 'is_active')
    list_filter = ('is_active',)


@admin.register(DepartmentExpense)
class DepartmentExpenseAdmin(admin.ModelAdmin):
    list_display = ('department', 'category', 'amount', 'period_start')
    list_filter = ('category', 'department')


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'fiscal_year', 'period', 'allocated', 'spent', 'status')
    list_filter = ('fiscal_year', 'period', 'status')


@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
    list_display = ('name', 'fiscal_year', 'scenario', 'projected_revenue', 'projected_profit')
    list_filter = ('fiscal_year', 'scenario')


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'status', 'risk_score')
    list_filter = ('status',)


@admin.register(VendorContract)
class VendorContractAdmin(admin.ModelAdmin):
    list_display = ('contract_number', 'vendor', 'total_value', 'start_date', 'end_date', 'status')
    list_filter = ('status',)


@admin.register(ProcurementRequest)
class ProcurementRequestAdmin(admin.ModelAdmin):
    list_display = ('request_number', 'title', 'amount', 'priority', 'status')
    list_filter = ('status', 'priority')


@admin.register(ComplianceCheck)
class ComplianceCheckAdmin(admin.ModelAdmin):
    list_display = ('framework', 'check_name', 'status', 'risk_level')
    list_filter = ('framework', 'status')


@admin.register(FinancialAuditLog)
class FinancialAuditLogAdmin(admin.ModelAdmin):
    list_display = ('category', 'action', 'severity', 'actor_label', 'created_at')
    list_filter = ('category', 'severity')
    readonly_fields = ('id', 'created_at')
