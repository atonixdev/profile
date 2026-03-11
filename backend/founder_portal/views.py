"""
AtonixDev — Founder Portal API Views

Dashboard + Resource endpoints for the Founder Portal.
"""

import logging
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Organization, LedgerEntry, Invoice, Payment
from finance.models import Department, Budget, Vendor, ComplianceCheck

from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
)
from .serializers import (
    FounderDirectiveSerializer, CulturalGuidelineSerializer,
    InvestorDocumentSerializer, StakeholderSerializer,
    ResourceAllocationSerializer, BrandTokenSerializer,
    PortalAuditLogSerializer,
)

log = logging.getLogger('founder_portal')


# ─────────────────────────────────────────────────────────────────────────────
# EXECUTIVE DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

class ExecutiveDashboardView(APIView):
    """GET /api/portal/dashboard/executive/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Financial KPIs
        mtd_revenue = (
            LedgerEntry.objects.filter(entry_type='charge', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        ytd_revenue = (
            LedgerEntry.objects.filter(entry_type='charge', created_at__gte=year_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        outstanding = (
            Invoice.objects.filter(status__in=['issued', 'outstanding', 'overdue'])
            .aggregate(s=Sum('total'))['s'] or Decimal('0')
        )

        # Growth
        active_orgs = Organization.objects.filter(status='active').count()
        total_orgs = Organization.objects.count()
        total_users = User.objects.filter(is_active=True).count()
        staff_count = User.objects.filter(is_staff=True).count()

        # Product
        total_departments = Department.objects.filter(is_active=True).count()
        active_vendors = Vendor.objects.filter(status='active').count()
        active_budgets = Budget.objects.filter(status__in=['active', 'approved']).count()

        # Directives
        pinned_directives = FounderDirective.objects.filter(pinned=True, status='active').count()
        total_stakeholders = Stakeholder.objects.filter(is_active=True).count()

        return Response({
            'header': {
                'title': 'Executive Dashboard',
                'subtitle': 'Unified command center for AtonixDev leadership',
                'as_of': now.isoformat(),
            },
            'finance': {
                'mtd_revenue': str(mtd_revenue),
                'ytd_revenue': str(ytd_revenue),
                'outstanding_balance': str(outstanding),
            },
            'growth': {
                'active_organizations': active_orgs,
                'total_organizations': total_orgs,
                'total_users': total_users,
                'staff_count': staff_count,
            },
            'product': {
                'departments': total_departments,
                'active_vendors': active_vendors,
                'active_budgets': active_budgets,
            },
            'governance': {
                'pinned_directives': pinned_directives,
                'stakeholders': total_stakeholders,
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# INVESTOR & STAKEHOLDER HUB
# ─────────────────────────────────────────────────────────────────────────────

class InvestorHubView(APIView):
    """GET /api/portal/dashboard/investor/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        documents = InvestorDocument.objects.all()[:50]
        stakeholders = Stakeholder.objects.filter(is_active=True)

        total_investment = stakeholders.aggregate(s=Sum('investment'))['s'] or Decimal('0')

        by_role = {}
        for s in stakeholders:
            by_role.setdefault(s.role, 0)
            by_role[s.role] += 1

        by_doc_type = {}
        for d in documents:
            by_doc_type.setdefault(d.doc_type, 0)
            by_doc_type[d.doc_type] += 1

        return Response({
            'header': {
                'title': 'Investor & Stakeholder Hub',
                'subtitle': 'Secure document repository and stakeholder management',
            },
            'stakeholders': StakeholderSerializer(stakeholders, many=True).data,
            'stakeholder_summary': {
                'total': stakeholders.count(),
                'total_investment': str(total_investment),
                'by_role': by_role,
            },
            'documents': InvestorDocumentSerializer(documents, many=True).data,
            'document_summary': {
                'total': documents.count(),
                'by_type': by_doc_type,
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# TEAM & RESOURCE MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

class TeamManagementView(APIView):
    """GET /api/portal/dashboard/team/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_active=True).count()
        staff = User.objects.filter(is_staff=True, is_active=True).count()
        superusers = User.objects.filter(is_superuser=True).count()

        departments = Department.objects.filter(is_active=True)
        dept_data = []
        for d in departments:
            dept_data.append({
                'id': str(d.id),
                'name': d.name,
                'code': d.code,
                'head': f'{d.head.first_name} {d.head.last_name}'.strip() if d.head else None,
            })

        return Response({
            'header': {
                'title': 'Team & Resource Management',
                'subtitle': 'Staff allocation, departments, and organizational structure',
            },
            'workforce': {
                'total_active_users': total_users,
                'staff_members': staff,
                'superusers': superusers,
            },
            'departments': dept_data,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# FINANCIAL & COMPLIANCE MODULES
# ─────────────────────────────────────────────────────────────────────────────

class FinancialComplianceView(APIView):
    """GET /api/portal/dashboard/financial-compliance/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        current_year = now.year

        # Budgets
        budgets = Budget.objects.filter(fiscal_year=current_year, status__in=['active', 'approved'])
        total_allocated = budgets.aggregate(s=Sum('allocated'))['s'] or Decimal('0')
        total_spent = budgets.aggregate(s=Sum('spent'))['s'] or Decimal('0')

        # Compliance
        compliant = ComplianceCheck.objects.filter(status='compliant').count()
        non_compliant = ComplianceCheck.objects.filter(status='non_compliant').count()
        in_review = ComplianceCheck.objects.filter(status='in_review').count()

        # Vendors
        active_vendors = Vendor.objects.filter(status='active').count()

        # Payments
        total_payments = Payment.objects.count()
        cleared = Payment.objects.filter(status='cleared').count()

        return Response({
            'header': {
                'title': 'Financial & Compliance',
                'subtitle': 'Budgets, billing, vendor workflows, and compliance audit',
            },
            'budgets': {
                'active_count': budgets.count(),
                'total_allocated': str(total_allocated),
                'total_spent': str(total_spent),
                'remaining': str(total_allocated - total_spent),
            },
            'compliance': {
                'compliant': compliant,
                'non_compliant': non_compliant,
                'in_review': in_review,
            },
            'vendors': {
                'active': active_vendors,
            },
            'payments': {
                'total': total_payments,
                'cleared': cleared,
                'success_rate': str(round((cleared / total_payments * 100) if total_payments > 0 else 0, 2)),
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# VISION & NARRATIVE SPACE
# ─────────────────────────────────────────────────────────────────────────────

class VisionNarrativeView(APIView):
    """GET /api/portal/dashboard/vision/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        directives = FounderDirective.objects.filter(status='active')
        guidelines = CulturalGuideline.objects.all()[:20]

        return Response({
            'header': {
                'title': 'Vision & Narrative Space',
                'subtitle': 'Founder directives, motivational notes, and cultural guidelines',
            },
            'directives': FounderDirectiveSerializer(directives, many=True).data,
            'directives_summary': {
                'total': directives.count(),
                'pinned': directives.filter(pinned=True).count(),
                'by_priority': {
                    'critical': directives.filter(priority='critical').count(),
                    'high': directives.filter(priority='high').count(),
                    'normal': directives.filter(priority='normal').count(),
                },
            },
            'cultural_guidelines': CulturalGuidelineSerializer(guidelines, many=True).data,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# DEVELOPER DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

class DeveloperDashboardView(APIView):
    """GET /api/portal/dashboard/developer/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        allocations = ResourceAllocation.objects.all()
        active = allocations.filter(status='active')

        by_type = {}
        for r in active:
            by_type.setdefault(r.resource_type, 0)
            by_type[r.resource_type] += 1

        by_region = {}
        for r in active:
            region = r.region or 'unassigned'
            by_region.setdefault(region, 0)
            by_region[region] += 1

        return Response({
            'header': {
                'title': 'Developer Dashboard',
                'subtitle': 'Deployment flows, resource allocation, and infrastructure monitoring',
            },
            'resources': ResourceAllocationSerializer(active, many=True).data,
            'resource_summary': {
                'total_active': active.count(),
                'total_all': allocations.count(),
                'decommissioned': allocations.filter(status='decommissioned').count(),
                'by_type': by_type,
                'by_region': by_region,
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# MARKETING DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

class MarketingDashboardView(APIView):
    """GET /api/portal/dashboard/marketing/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Pull from social_hub if available
        from django.apps import apps
        social_data = {}
        if apps.is_installed('social_hub'):
            try:
                SocialAccount = apps.get_model('social_hub', 'SocialAccount')
                SocialPost = apps.get_model('social_hub', 'SocialPost')
                social_data = {
                    'connected_accounts': SocialAccount.objects.filter(is_active=True).count(),
                    'total_posts': SocialPost.objects.count(),
                    'scheduled_posts': SocialPost.objects.filter(status='scheduled').count(),
                    'published_posts': SocialPost.objects.filter(status='published').count(),
                }
            except Exception:
                social_data = {'connected_accounts': 0, 'total_posts': 0, 'scheduled_posts': 0, 'published_posts': 0}
        else:
            social_data = {'connected_accounts': 0, 'total_posts': 0, 'scheduled_posts': 0, 'published_posts': 0}

        return Response({
            'header': {
                'title': 'Marketing Dashboard',
                'subtitle': 'Social hub, engagement analytics, and campaign tracking',
            },
            'social': social_data,
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# BRANDING SYSTEMS
# ─────────────────────────────────────────────────────────────────────────────

class BrandingSystemsView(APIView):
    """GET /api/portal/dashboard/branding/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        tokens = BrandToken.objects.filter(is_active=True)

        by_type = {}
        for t in tokens:
            by_type.setdefault(t.token_type, [])
            by_type[t.token_type].append({
                'name': t.name,
                'value': t.value,
                'description': t.description,
            })

        return Response({
            'header': {
                'title': 'Branding Systems',
                'subtitle': 'Color tokens, typography, UI/UX standards, and design integration',
            },
            'tokens': BrandTokenSerializer(tokens, many=True).data,
            'tokens_by_type': by_type,
            'summary': {
                'total_tokens': tokens.count(),
                'colors': tokens.filter(token_type='color').count(),
                'fonts': tokens.filter(token_type='font').count(),
                'spacing': tokens.filter(token_type='spacing').count(),
                'assets': tokens.filter(token_type='asset').count(),
            },
            'status': 'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
# RESOURCE LIST VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class DirectiveListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(FounderDirectiveSerializer(
            FounderDirective.objects.all(), many=True
        ).data)


class StakeholderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(StakeholderSerializer(
            Stakeholder.objects.all(), many=True
        ).data)


class AuditLogListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(PortalAuditLogSerializer(
            PortalAuditLog.objects.all()[:200], many=True
        ).data)
