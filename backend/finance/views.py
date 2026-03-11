"""
AtonixCorp — Financial Dashboard API Views

Endpoints:
  GET  /api/finance/dashboard/master/              — Master Finance Dashboard
  GET  /api/finance/dashboard/revenue/             — Product Revenue Dashboard
  GET  /api/finance/dashboard/cost/                — Product Cost Dashboard
  GET  /api/finance/dashboard/budget-forecast/     — Budget & Forecasting Dashboard
  GET  /api/finance/dashboard/billing-payments/    — Billing & Payments Dashboard
  GET  /api/finance/dashboard/department/          — Department & Team Financial Dashboard
  GET  /api/finance/dashboard/vendor-procurement/  — Vendor & Procurement Dashboard
  GET  /api/finance/dashboard/compliance-audit/    — Compliance & Audit Dashboard
  GET  /api/finance/departments/                   — Department list
  GET  /api/finance/departments/<id>/              — Department detail
  GET  /api/finance/budgets/                       — Budget list
  GET  /api/finance/forecasts/                     — Forecast list
  GET  /api/finance/vendors/                       — Vendor list
  GET  /api/finance/vendors/<id>/                  — Vendor detail
  GET  /api/finance/compliance/                    — Compliance checks
  GET  /api/finance/audit/                         — Financial audit log
"""

import logging
from decimal import Decimal
from datetime import datetime, timedelta

from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Organization, LedgerEntry, Invoice, UsageEvent, Payment, Credit
from billing.serializers import OrganizationSerializer

from .models import (
    Department, DepartmentExpense, Budget, Forecast,
    Vendor, VendorContract, ProcurementRequest,
    ComplianceCheck, FinancialAuditLog, CurrencyRate,
)
from .serializers import (
    DepartmentSerializer, DepartmentExpenseSerializer, BudgetSerializer, ForecastSerializer,
    VendorSerializer, VendorContractSerializer, ProcurementRequestSerializer,
    ComplianceCheckSerializer, FinancialAuditLogSerializer,
)

log = logging.getLogger('finance')


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 1: Master Finance Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class MasterFinanceDashboardView(APIView):
    """GET /api/finance/dashboard/master/ — Global financial command center"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Revenue metrics
        mtd_charges = (
            LedgerEntry.objects.filter(entry_type='charge', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        ytd_charges = (
            LedgerEntry.objects.filter(entry_type='charge', created_at__gte=year_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        mtd_payments = abs(
            LedgerEntry.objects.filter(entry_type='payment', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        # Cost metrics
        dept_expenses = (
            DepartmentExpense.objects.filter(period_start__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        # P&L calculation
        total_revenue = mtd_charges
        total_costs = dept_expenses
        profit = total_revenue - total_costs

        # Cash flow
        outstanding = (
            Invoice.objects.filter(status__in=['issued', 'outstanding', 'overdue'])
            .aggregate(s=Sum('total'))['s'] or Decimal('0')
        )

        # Health indicators
        active_orgs = Organization.objects.filter(status='active').count()
        total_vendors = Vendor.objects.filter(status='active').count()
        active_depts = Department.objects.filter(is_active=True).count()

        # Multi-currency support
        available_currencies = CurrencyRate.objects.values_list('target_currency', flat=True).distinct()

        return Response({
            'header': {
                'title': 'Master Finance Dashboard',
                'subtitle': 'Executive financial summary across all operations',
                'as_of': now.isoformat(),
            },
            'revenue': {
                'mtd': str(mtd_charges),
                'ytd': str(ytd_charges),
                'collected_mtd': str(mtd_payments),
            },
            'expenses': {
                'mtd': str(dept_expenses),
            },
            'profitability': {
                'mtd_revenue': str(total_revenue),
                'mtd_costs': str(total_costs),
                'mtd_profit': str(profit),
                'margin_pct': str(round((profit / total_revenue * 100) if total_revenue > 0 else 0, 2)),
            },
            'cash_flow': {
                'outstanding_balance': str(outstanding),
                'collections_pending': str(mtd_payments),
            },
            'health_indicators': {
                'active_organizations': active_orgs,
                'active_vendors': total_vendors,
                'active_departments': active_depts,
            },
            'multi_currency': {
                'available_currencies': list(available_currencies),
                'usd_equivalent': str(total_revenue),
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 2: Product Revenue Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class ProductRevenueView(APIView):
    """GET /api/finance/dashboard/revenue/ — Product-level revenue analytics"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # MRR / ARR analytics by service
        revenue_by_service = []
        for service in ['compute', 'storage', 'email', 'domain', 'pipeline', 'networking', 'monitoring', 'auth']:
            charges = (
                LedgerEntry.objects.filter(
                    service=service, entry_type='charge', created_at__gte=month_start
                ).aggregate(s=Sum('amount'))['s'] or Decimal('0')
            )
            orgs = UsageEvent.objects.filter(service=service, event_timestamp__gte=month_start).values(
                'organization').distinct().count()
            revenue_by_service.append({
                'service': service,
                'mtd_revenue': str(charges),
                'arr_estimated': str(charges * 12),  # MRR * 12
                'org_count': orgs,
            })

        # Refunds & credits
        refunds_mtd = abs(
            LedgerEntry.objects.filter(entry_type='refund', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        credits_mtd = abs(
            LedgerEntry.objects.filter(entry_type='credit', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        # Churn analysis
        total_orgs = Organization.objects.count()
        active_orgs = Organization.objects.filter(status='active').count()
        suspended = Organization.objects.filter(status='suspended').count()
        churn_pct = round((suspended / total_orgs * 100) if total_orgs > 0 else 0, 2)

        return Response({
            'header': {
                'title': 'Product Revenue Dashboard',
                'subtitle': 'Revenue performance by product and service',
            },
            'revenue_by_service': revenue_by_service,
            'churn_metrics': {
                'active_orgs': active_orgs,
                'suspended_orgs': suspended,
                'churn_rate_pct': str(churn_pct),
            },
            'adjustments': {
                'refunds_mtd': str(refunds_mtd),
                'credits_mtd': str(credits_mtd),
                'total_adjustments': str(refunds_mtd + credits_mtd),
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 3: Product Cost Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class ProductCostView(APIView):
    """GET /api/finance/dashboard/cost/ — Operational cost tracking by product"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Breakdown by category
        cost_breakdown = []
        categories = ['payroll', 'cloud', 'software', 'marketing', 'operations', 'support',  'travel', 'equipment']
        
        for cat in categories:
            amount = (
                DepartmentExpense.objects.filter(category=cat, period_start__gte=month_start)
                .aggregate(s=Sum('amount'))['s'] or Decimal('0')
            )
            cost_breakdown.append({
                'category': cat,
                'mtd_cost': str(amount),
            })

        # Dept-level allocation
        dept_costs = []
        for dept in Department.objects.filter(is_active=True):
            total = (
                DepartmentExpense.objects.filter(department=dept, period_start__gte=month_start)
                .aggregate(s=Sum('amount'))['s'] or Decimal('0')
            )
            dept_costs.append({
                'department': dept.code,
                'name': dept.name,
                'total': str(total),
            })

        return Response({
            'header': {
                'title': 'Product Cost Dashboard',
                'subtitle': 'Cost tracking and attribution by product and environment',
            },
            'cost_by_category': cost_breakdown,
            'cost_by_department': dept_costs,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 4: Budget & Forecasting Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class BudgetForecastingView(APIView):
    """GET /api/finance/dashboard/budget-forecast/ — Budget planning and scenarios"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        current_year = timezone.now().year

        # Active budgets
        budgets = Budget.objects.filter(
            fiscal_year=current_year, status__in=['approved', 'active']
        ).order_by('department__name')

        budget_data = []
        for b in budgets:
            budget_data.append({
                'id': str(b.id),
                'name': b.name,
                'period': b.period,
                'allocated': str(b.allocated),
                'spent': str(b.spent),
                'remaining': str(b.remaining),
                'utilization_pct': str(b.utilization_pct),
                'status': b.status,
            })

        # Forecasts by scenario
        forecasts = Forecast.objects.filter(fiscal_year=current_year)
        forecast_data = ForecastSerializer(forecasts, many=True).data

        return Response({
            'header': {
                'title': 'Budget & Forecasting Dashboard',
                'subtitle': 'Financial planning, budgets, and scenario modeling',
            },
            'budgets': budget_data,
            'forecasts': forecast_data,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 5: Billing & Payments Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class BillingPaymentsView(APIView):
    """GET /api/finance/dashboard/billing-payments/ — Real-time payment visibility"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Invoice metrics
        issued = Invoice.objects.filter(status='issued').count()
        paid_count = Invoice.objects.filter(status='paid').count()
        outstanding = Invoice.objects.filter(status__in=['outstanding', 'overdue']).count()
        overdue_count = Invoice.objects.filter(status='overdue').count()

        outstanding_balance = (
            Invoice.objects.filter(status__in=['issued', 'outstanding', 'overdue'])
            .aggregate(s=Sum('total'))['s'] or Decimal('0')
        )

        # Payment success
        total_payments = Payment.objects.count()
        successful = Payment.objects.filter(status='cleared').count()
        failed = Payment.objects.filter(status='failed').count()
        success_rate = round((successful / total_payments * 100) if total_payments > 0 else 0, 2)

        # Refunds
        refunds = abs(
            LedgerEntry.objects.filter(entry_type='refund', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        return Response({
            'header': {
                'title': 'Billing & Payments Dashboard',
                'subtitle': 'Real-time payment status, invoices, and collections',
            },
            'invoices': {
                'issued': issued,
                'paid': paid_count,
                'outstanding': outstanding,
                'overdue': overdue_count,
                'outstanding_balance': str(outstanding_balance),
            },
            'payments': {
                'total': total_payments,
                'successful': successful,
                'failed': failed,
                'success_rate_pct': str(success_rate),
            },
            'refunds': {
                'mtd_total': str(refunds),
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 6: Department & Team Financial Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class DepartmentFinancialView(APIView):
    """GET /api/finance/dashboard/department/ — Department-level financial tracking"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        depts = Department.objects.filter(is_active=True).prefetch_related('expenses')
        dept_data = DepartmentSerializer(depts, many=True).data
        return Response({
            'header': {
                'title': 'Department & Team Financial Dashboard',
                'subtitle': 'Department budgets, spending, and cost allocation',
            },
            'departments': dept_data,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 7: Vendor & Procurement Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class VendorProcurementView(APIView):
    """GET /api/finance/dashboard/vendor-procurement/ — Vendor & procurement management"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        vendors = Vendor.objects.filter(status='active')
        vendor_data = VendorSerializer(vendors, many=True).data

        # Procurement status
        pending_reqs = ProcurementRequest.objects.filter(status__in=['draft', 'submitted']).count()
        approved_reqs = ProcurementRequest.objects.filter(status='approved').count()
        ordered_reqs = ProcurementRequest.objects.filter(status='ordered').count()

        return Response({
            'header': {
                'title': 'Vendor & Procurement Dashboard',
                'subtitle': 'Vendor contracts, procurement requests, and payments',
            },
            'vendors': vendor_data,
            'procurement_status': {
                'pending': pending_reqs,
                'approved': approved_reqs,
                'ordered': ordered_reqs,
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD 8: Compliance & Audit Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class ComplianceAuditView(APIView):
    """GET /api/finance/dashboard/compliance-audit/ — Compliance and audit trails"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Compliance checks
        checks = ComplianceCheck.objects.all().order_by('-created_at')[:50]
        check_data = ComplianceCheckSerializer(checks, many=True).data

        # Compliance status summary
        compliant = ComplianceCheck.objects.filter(status='compliant').count()
        non_compliant = ComplianceCheck.objects.filter(status='non_compliant').count()
        in_review = ComplianceCheck.objects.filter(status='in_review').count()

        # Audit logs
        audit_logs = FinancialAuditLog.objects.all().order_by('-created_at')[:100]
        audit_data = FinancialAuditLogSerializer(audit_logs, many=True).data

        # High-severity items
        high_severity = FinancialAuditLog.objects.filter(
            severity__in=['high', 'critical']
        ).count()

        return Response({
            'header': {
                'title': 'Compliance & Audit Dashboard',
                'subtitle': 'Audit trails, compliance checks, risk assessment',
            },
            'compliance': {
                'compliant': compliant,
                'non_compliant': non_compliant,
                'in_review': in_review,
                'checks': check_data,
            },
            'audit': {
                'recent_logs': audit_data,
                'high_severity_count': high_severity,
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# Resource Views (CRUD + List)
# ─────────────────────────────────────────────────────────────────────────────

class DepartmentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        depts = Department.objects.all()
        serializer = DepartmentSerializer(depts, many=True)
        return Response(serializer.data)


class BudgetListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        budgets = Budget.objects.all()
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)


class ForecastListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        forecasts = Forecast.objects.all()
        serializer = ForecastSerializer(forecasts, many=True)
        return Response(serializer.data)


class VendorListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        vendors = Vendor.objects.all()
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data)


class ProcurementListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        requests = ProcurementRequest.objects.all()
        serializer = ProcurementRequestSerializer(requests, many=True)
        return Response(serializer.data)


class ComplianceListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        checks = ComplianceCheck.objects.all()
        serializer = ComplianceCheckSerializer(checks, many=True)
        return Response(serializer.data)


class AuditListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = FinancialAuditLog.objects.all()
        serializer = FinancialAuditLogSerializer(logs, many=True)
        return Response(serializer.data)
