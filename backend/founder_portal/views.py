"""
AtonixDev — Founder Portal API Views

Dashboard + Resource endpoints for the Founder Portal.
"""

import logging
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.models import Organization, LedgerEntry, Invoice, Payment
from finance.models import Department, Budget, Vendor, ComplianceCheck

from .models import (
    FounderDirective, CulturalGuideline,
    InvestorDocument, Stakeholder,
    ResourceAllocation, BrandToken, PortalAuditLog,
    Task, OKR, SecureMessage, Deployment, MonitoringAlert,
    Campaign, DesignStandard, InvestorUpdate, IntegrationConfig,
    DashboardRegistry, DashboardPermission,
)
from .serializers import (
    FounderDirectiveSerializer, CulturalGuidelineSerializer,
    InvestorDocumentSerializer, StakeholderSerializer,
    ResourceAllocationSerializer, BrandTokenSerializer,
    PortalAuditLogSerializer,
    TaskSerializer, OKRSerializer, SecureMessageSerializer,
    DeploymentSerializer, MonitoringAlertSerializer,
    CampaignSerializer, DesignStandardSerializer,
    InvestorUpdateSerializer, IntegrationConfigSerializer,
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

        # Secure messages for investor channel
        unread_msgs = SecureMessage.objects.filter(channel='investor', is_read=False).count()

        # Investor updates
        updates = InvestorUpdate.objects.all()[:10]

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
            'messaging': {
                'unread_count': unread_msgs,
            },
            'investor_updates': InvestorUpdateSerializer(updates, many=True).data,
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

        # Task summary for kanban
        task_counts = {
            'backlog': Task.objects.filter(status='backlog').count(),
            'todo': Task.objects.filter(status='todo').count(),
            'in_progress': Task.objects.filter(status='in_progress').count(),
            'review': Task.objects.filter(status='review').count(),
            'done': Task.objects.filter(status='done').count(),
        }

        # OKR summary
        now = timezone.now()
        quarter = f"Q{(now.month - 1) // 3 + 1} {now.year}"
        okrs = OKR.objects.filter(quarter=quarter)
        okr_summary = {
            'total': okrs.count(),
            'avg_progress': okrs.aggregate(a=Avg('progress'))['a'] or 0,
            'on_track': okrs.filter(status='on_track').count(),
            'at_risk': okrs.filter(status='at_risk').count(),
            'behind': okrs.filter(status='behind').count(),
            'completed': okrs.filter(status='completed').count(),
        }

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
            'tasks': task_counts,
            'okr_summary': okr_summary,
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

        # Deployment summary
        recent_deploys = Deployment.objects.all()[:20]
        deploy_stats = {
            'total': Deployment.objects.count(),
            'success': Deployment.objects.filter(status='success').count(),
            'failed': Deployment.objects.filter(status='failed').count(),
            'in_progress': Deployment.objects.filter(status__in=['pending', 'building', 'deploying']).count(),
        }

        # Active alerts
        active_alerts = MonitoringAlert.objects.filter(status='active').count()
        acknowledged_alerts = MonitoringAlert.objects.filter(status='acknowledged').count()

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
            'deployments': DeploymentSerializer(recent_deploys, many=True).data,
            'deployment_stats': deploy_stats,
            'alerts': {
                'active': active_alerts,
                'acknowledged': acknowledged_alerts,
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

        # Campaign data
        campaigns = Campaign.objects.all()
        active_campaigns = campaigns.filter(status='active')
        total_spend = campaigns.aggregate(s=Sum('spend'))['s'] or Decimal('0')
        total_revenue = campaigns.aggregate(s=Sum('revenue'))['s'] or Decimal('0')

        return Response({
            'header': {
                'title': 'Marketing Dashboard',
                'subtitle': 'Social hub, engagement analytics, and campaign tracking',
            },
            'social': social_data,
            'campaigns': CampaignSerializer(campaigns, many=True).data,
            'campaign_summary': {
                'total': campaigns.count(),
                'active': active_campaigns.count(),
                'total_spend': str(total_spend),
                'total_revenue': str(total_revenue),
                'overall_roi': str(round(((total_revenue - total_spend) / total_spend * 100) if total_spend > 0 else 0, 2)),
            },
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

        # Design standards
        standards = DesignStandard.objects.filter(is_active=True)
        standards_by_cat = {}
        for s in standards:
            standards_by_cat.setdefault(s.category, 0)
            standards_by_cat[s.category] += 1

        # Integrations (Figma specifically)
        figma_config = IntegrationConfig.objects.filter(provider='figma').first()

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
            'design_standards': DesignStandardSerializer(standards, many=True).data,
            'standards_summary': standards_by_cat,
            'figma_integration': IntegrationConfigSerializer(figma_config).data if figma_config else None,
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


# ─────────────────────────────────────────────────────────────────────────────
# DIRECTIVE CRUD
# ─────────────────────────────────────────────────────────────────────────────

class DirectiveCRUDView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data.copy()
        data['author'] = request.user.id
        ser = FounderDirectiveSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        PortalAuditLog.objects.create(
            actor=request.user, event_type='create', severity='info',
            module='directive', description=f"Created directive: {ser.data.get('title', '')}"
        )
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pk = request.data.get('id')
        try:
            obj = FounderDirective.objects.get(pk=pk)
        except FounderDirective.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = FounderDirectiveSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request):
        pk = request.query_params.get('id')
        try:
            obj = FounderDirective.objects.get(pk=pk)
        except FounderDirective.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# CULTURAL GUIDELINE CRUD
# ─────────────────────────────────────────────────────────────────────────────

class GuidelineCRUDView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(CulturalGuidelineSerializer(
            CulturalGuideline.objects.all(), many=True
        ).data)

    def post(self, request):
        ser = CulturalGuidelineSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pk = request.data.get('id')
        try:
            obj = CulturalGuideline.objects.get(pk=pk)
        except CulturalGuideline.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = CulturalGuidelineSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request):
        pk = request.query_params.get('id')
        try:
            obj = CulturalGuideline.objects.get(pk=pk)
        except CulturalGuideline.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# TASK CRUD (Kanban)
# ─────────────────────────────────────────────────────────────────────────────

class TaskListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        dept = request.query_params.get('department')
        assignee = request.query_params.get('assignee')
        qs = Task.objects.all()
        if dept:
            qs = qs.filter(department=dept)
        if assignee:
            qs = qs.filter(assignee_id=assignee)
        return Response(TaskSerializer(qs, many=True).data)

    def post(self, request):
        ser = TaskSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = TaskSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        try:
            obj = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# OKR CRUD
# ─────────────────────────────────────────────────────────────────────────────

class OKRListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        quarter = request.query_params.get('quarter')
        qs = OKR.objects.all()
        if quarter:
            qs = qs.filter(quarter=quarter)
        return Response(OKRSerializer(qs, many=True).data)

    def post(self, request):
        ser = OKRSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class OKRDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = OKR.objects.get(pk=pk)
        except OKR.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = OKRSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        try:
            obj = OKR.objects.get(pk=pk)
        except OKR.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# SECURE MESSAGING
# ─────────────────────────────────────────────────────────────────────────────

class MessageListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        channel = request.query_params.get('channel', 'general')
        qs = SecureMessage.objects.filter(channel=channel)
        return Response(SecureMessageSerializer(qs, many=True).data)

    def post(self, request):
        data = request.data.copy()
        data['sender'] = request.user.id
        ser = SecureMessageSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class MessageReadView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            msg = SecureMessage.objects.get(pk=pk)
        except SecureMessage.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        msg.is_read = True
        msg.save(update_fields=['is_read'])
        return Response({'status': 'read'})


# ─────────────────────────────────────────────────────────────────────────────
# DEPLOYMENT PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

class DeploymentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        env = request.query_params.get('environment')
        qs = Deployment.objects.all()[:100]
        if env:
            qs = Deployment.objects.filter(environment=env)[:100]
        return Response(DeploymentSerializer(qs, many=True).data)

    def post(self, request):
        data = request.data.copy()
        data['triggered_by'] = request.user.id
        ser = DeploymentSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class DeploymentDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = Deployment.objects.get(pk=pk)
        except Deployment.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = DeploymentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


# ─────────────────────────────────────────────────────────────────────────────
# MONITORING ALERTS
# ─────────────────────────────────────────────────────────────────────────────

class AlertListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stat = request.query_params.get('status')
        qs = MonitoringAlert.objects.all()[:200]
        if stat:
            qs = MonitoringAlert.objects.filter(status=stat)[:200]
        return Response(MonitoringAlertSerializer(qs, many=True).data)

    def post(self, request):
        ser = MonitoringAlertSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AlertActionView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = MonitoringAlert.objects.get(pk=pk)
        except MonitoringAlert.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        action = request.data.get('action')
        if action == 'acknowledge':
            obj.status = 'acknowledged'
        elif action == 'resolve':
            obj.status = 'resolved'
            obj.resolved_at = timezone.now()
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        obj.save()
        return Response(MonitoringAlertSerializer(obj).data)


# ─────────────────────────────────────────────────────────────────────────────
# CAMPAIGN CRUD
# ─────────────────────────────────────────────────────────────────────────────

class CampaignListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(CampaignSerializer(Campaign.objects.all(), many=True).data)

    def post(self, request):
        ser = CampaignSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class CampaignDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = CampaignSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        try:
            obj = Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# DESIGN STANDARDS
# ─────────────────────────────────────────────────────────────────────────────

class DesignStandardListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        category = request.query_params.get('category')
        qs = DesignStandard.objects.filter(is_active=True)
        if category:
            qs = qs.filter(category=category)
        return Response(DesignStandardSerializer(qs, many=True).data)

    def post(self, request):
        ser = DesignStandardSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pk = request.data.get('id')
        try:
            obj = DesignStandard.objects.get(pk=pk)
        except DesignStandard.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = DesignStandardSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


# ─────────────────────────────────────────────────────────────────────────────
# INVESTOR UPDATE EMAILS
# ─────────────────────────────────────────────────────────────────────────────

class InvestorUpdateListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(InvestorUpdateSerializer(
            InvestorUpdate.objects.all(), many=True
        ).data)

    def post(self, request):
        data = request.data.copy()
        data['author'] = request.user.id
        ser = InvestorUpdateSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class InvestorUpdateDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            obj = InvestorUpdate.objects.get(pk=pk)
        except InvestorUpdate.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = InvestorUpdateSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        try:
            obj = InvestorUpdate.objects.get(pk=pk)
        except InvestorUpdate.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InvestorUpdateSendView(APIView):
    """Simulate sending an investor update email."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            obj = InvestorUpdate.objects.get(pk=pk)
        except InvestorUpdate.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if obj.status == 'sent':
            return Response({'error': 'Already sent'}, status=status.HTTP_400_BAD_REQUEST)
        obj.status = 'sent'
        obj.sent_at = timezone.now()
        obj.save(update_fields=['status', 'sent_at'])
        PortalAuditLog.objects.create(
            actor=request.user, event_type='action', severity='info',
            module='investor_update', description=f"Sent investor update: {obj.subject}"
        )
        return Response(InvestorUpdateSerializer(obj).data)


# ─────────────────────────────────────────────────────────────────────────────
# INTEGRATION CONFIG
# ─────────────────────────────────────────────────────────────────────────────

class IntegrationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(IntegrationConfigSerializer(
            IntegrationConfig.objects.all(), many=True
        ).data)

    def post(self, request):
        ser = IntegrationConfigSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        pk = request.data.get('id')
        try:
            obj = IntegrationConfig.objects.get(pk=pk)
        except IntegrationConfig.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = IntegrationConfigSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


# ─────────────────────────────────────────────────────────────────────────────
# WORKING DASHBOARD — REGISTRY & PERMISSIONS
# ─────────────────────────────────────────────────────────────────────────────

class WorkingDashboardView(APIView):
    """GET /api/portal/working-dashboard/ — Full registry, user permissions, audit log"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        is_founder = request.user.is_superuser
        registries = DashboardRegistry.objects.filter(is_active=True).order_by('sort_order', 'name')

        # For founders: all. For staff: only default_access='staff' or explicit grant
        if is_founder:
            visible = registries
        else:
            from django.db.models import Q
            granted_ids = DashboardPermission.objects.filter(user=request.user).values_list('dashboard_id', flat=True)
            visible = registries.filter(
                Q(default_access__in=['any_auth', 'staff']) | Q(id__in=granted_ids)
            )

        # Build permission map: dashboard_id -> [permissions]
        perm_map = {}
        for p in DashboardPermission.objects.filter(dashboard__in=registries).select_related('user', 'granted_by', 'dashboard'):
            key = str(p.dashboard_id)
            perm_map.setdefault(key, []).append({
                'id': str(p.id),
                'user_id': str(p.user_id),
                'username': p.user.username,
                'full_name': f'{p.user.first_name} {p.user.last_name}'.strip() or p.user.username,
                'access_level': p.access_level,
                'granted_by': p.granted_by.username if p.granted_by else None,
                'granted_at': p.granted_at.isoformat() if p.granted_at else None,
            })

        # Staff users for permission grant modal
        staff_users = User.objects.filter(is_staff=True, is_active=True).values('id', 'username', 'first_name', 'last_name', 'is_superuser')

        # Recent audit log (working_dashboard module)
        recent_logs = PortalAuditLog.objects.filter(module='working_dashboard').order_by('-created_at')[:20]
        audit_data = [{
            'event': l.event_type,
            'description': l.description,
            'actor': l.actor.username if l.actor else 'system',
            'severity': l.severity,
            'created_at': l.created_at.isoformat(),
        } for l in recent_logs]

        return Response({
            'is_founder': is_founder,
            'dashboards': [{
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'description': d.description,
                'url_path': d.url_path,
                'category': d.category,
                'default_access': d.default_access,
                'accent_color': d.accent_color,
                'sort_order': d.sort_order,
                'permissions': perm_map.get(str(d.id), []),
            } for d in visible],
            'all_dashboards_for_founder': [{
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'description': d.description,
                'url_path': d.url_path,
                'category': d.category,
                'default_access': d.default_access,
                'accent_color': d.accent_color,
                'sort_order': d.sort_order,
                'permissions': perm_map.get(str(d.id), []),
            } for d in registries] if is_founder else None,
            'staff_users': list(staff_users),
            'audit_log': audit_data,
        })


class DashboardPermissionView(APIView):
    """POST /api/portal/dashboard-permissions/ (grant) | DELETE /api/portal/dashboard-permissions/<uuid>/ (revoke)"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Only superusers (founders) can grant permissions
        if not request.user.is_superuser:
            return Response({'error': 'Only founders can grant permissions.'}, status=status.HTTP_403_FORBIDDEN)

        dashboard_id = request.data.get('dashboard_id')
        user_id = request.data.get('user_id')
        access_level = request.data.get('access_level', 'view')
        notes = request.data.get('notes', '')

        try:
            dashboard = DashboardRegistry.objects.get(id=dashboard_id)
            target_user = User.objects.get(id=user_id)
        except (DashboardRegistry.DoesNotExist, User.DoesNotExist) as e:
            return Response({'error': f'Not found: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

        perm, created = DashboardPermission.objects.update_or_create(
            dashboard=dashboard,
            user=target_user,
            defaults={
                'access_level': access_level,
                'granted_by': request.user,
                'notes': notes,
            }
        )

        event_type = 'grant_permission' if created else 'update_permission'
        PortalAuditLog.objects.create(
            actor=request.user,
            event_type=event_type,
            severity='info',
            module='working_dashboard',
            description=f"{'Granted' if created else 'Updated'} {access_level} access for {target_user.username} on {dashboard.code}"
        )

        return Response({
            'id': str(perm.id),
            'created': created,
            'dashboard_code': dashboard.code,
            'username': target_user.username,
            'access_level': perm.access_level,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, pk=None):
        if not request.user.is_superuser:
            return Response({'error': 'Only founders can revoke permissions.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            perm = DashboardPermission.objects.select_related('dashboard', 'user').get(pk=pk)
        except DashboardPermission.DoesNotExist:
            return Response({'error': 'Permission not found.'}, status=status.HTTP_404_NOT_FOUND)

        dashboard_code = perm.dashboard.code
        username = perm.user.username
        perm.delete()

        PortalAuditLog.objects.create(
            actor=request.user,
            event_type='revoke_permission',
            severity='warning',
            module='working_dashboard',
            description=f"Revoked access for {username} on {dashboard_code}"
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
