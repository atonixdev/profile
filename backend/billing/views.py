"""
AtonixDev Billing & Usage Dashboard
Layer 4 — Dashboard API & Visualization Layer

Endpoints:
  GET  /api/billing/summary/platform/
  GET  /api/billing/summary/usage/
  GET  /api/billing/events/
  POST /api/billing/events/ingest/
  GET  /api/billing/organizations/
  GET  /api/billing/organizations/:id/
  GET  /api/billing/organizations/:id/usage/
  GET  /api/billing/organizations/:id/invoices/
  GET  /api/billing/invoices/
  GET  /api/billing/invoices/:id/
  POST /api/billing/invoices/generate/
  POST /api/billing/invoices/:id/payment/
  GET  /api/billing/credits/
  POST /api/billing/credits/issue/
  GET  /api/billing/ledger/
  GET  /api/billing/audit/
  GET  /api/billing/pricing/
  GET  /api/billing/metrics/                  (§4.5 Monitoring)
  GET  /api/billing/users/<id>/usage/         (§3.7 User-Level)
  GET  /api/billing/users/<id>/billing/       (§3.7 User-Level)
  GET  /api/billing/services/<s>/usage/       (§3.7 Service-Level)
  GET  /api/billing/services/<s>/billing/     (§3.7 Service-Level)
"""

import logging
from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import (
    BillingAuditLog,
    Credit,
    Invoice,
    LedgerEntry,
    OrgBalance,
    Organization,
    Payment,
    PricingRule,
    UsageEvent,
)
from .serializers import (
    BillingAuditLogSerializer,
    CreditSerializer,
    InvoiceSerializer,
    LedgerEntrySerializer,
    OrgBalanceSerializer,
    OrganizationSerializer,
    PricingRuleSerializer,
    UsageEventIngestSerializer,
    UsageEventSerializer,
)
from .services import (
    BalanceEngine,
    CostCalculator,
    InvoiceGenerator,
    LedgerWriter,
    _next_credit_number,
    process_event,
)

log = logging.getLogger('billing')


# ─────────────────────────────────────────────────────────────────────────────
# Platform Summary (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class PlatformSummaryView(APIView):
    """GET /api/billing/summary/platform/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        mtd_charges = (
            LedgerEntry.objects.filter(entry_type='charge', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )
        mtd_payments = (
            LedgerEntry.objects.filter(entry_type='payment', created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        total_orgs  = Organization.objects.count()
        active_orgs = Organization.objects.filter(status='active').count()
        new_orgs    = Organization.objects.filter(created_at__gte=month_start).count()

        from django.contrib.auth.models import User
        total_users = User.objects.filter(is_active=True).count()

        outstanding_invoices = Invoice.objects.filter(status__in=['issued', 'outstanding']).count()
        overdue_invoices     = Invoice.objects.filter(status='overdue').count()
        outstanding_balance  = (
            Invoice.objects.filter(status__in=['issued', 'outstanding', 'overdue'])
            .aggregate(s=Sum('total'))['s'] or Decimal('0')
        )
        failed_payments = Payment.objects.filter(status='failed').count()

        credits_issued = (
            Credit.objects.filter(created_at__gte=month_start)
            .aggregate(s=Sum('amount'))['s'] or Decimal('0')
        )

        usage_by_service = list(
            UsageEvent.objects.filter(status='processed', event_timestamp__gte=month_start)
            .values('service')
            .annotate(total_units=Sum('units'), total_cost=Sum('total_cost'))
            .order_by('-total_cost')
        )

        recent_events = UsageEventSerializer(
            UsageEvent.objects.all()[:20], many=True
        ).data

        return Response({
            'revenue': {
                'mtd_charges':  str(mtd_charges),
                'mtd_payments': str(abs(mtd_payments)),
                'net_revenue':  str(mtd_charges + mtd_payments),
            },
            'organizations': {
                'total':   total_orgs,
                'active':  active_orgs,
                'new_mtd': new_orgs,
            },
            'users': {
                'total_active': total_users,
            },
            'invoices': {
                'outstanding_count':   outstanding_invoices,
                'overdue_count':       overdue_invoices,
                'outstanding_balance': str(outstanding_balance),
                'failed_payments':     failed_payments,
            },
            'credits': {
                'issued_mtd': str(credits_issued),
            },
            'usage_by_service': [
                {
                    'service':     row['service'],
                    'total_units': str(row['total_units'] or 0),
                    'total_cost':  str(row['total_cost'] or 0),
                }
                for row in usage_by_service
            ],
            'recent_events': recent_events,
            'as_of': now.isoformat(),
        })


class PlatformUsageSummaryView(APIView):
    """GET /api/billing/summary/usage/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        by_service = list(
            UsageEvent.objects.filter(status='processed', event_timestamp__gte=month_start)
            .values('service', 'unit_type')
            .annotate(
                total_units = Sum('units'),
                total_cost  = Sum('total_cost'),
                event_count = Count('id'),
                org_count   = Count('organization', distinct=True),
            )
            .order_by('service')
        )

        results = []
        for row in by_service:
            rule = CostCalculator.get_active_rule(row['service'], row['unit_type'])
            results.append({
                'service':     row['service'],
                'unit_type':   row['unit_type'],
                'total_units': str(row['total_units'] or 0),
                'total_cost':  str(row['total_cost'] or 0),
                'event_count': row['event_count'],
                'org_count':   row['org_count'],
                'unit_price':  str(rule.unit_price) if rule else '0',
            })

        return Response({'usage': results, 'as_of': now.isoformat()})


# ─────────────────────────────────────────────────────────────────────────────
# Event Stream (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class EventListView(APIView):
    """GET /api/billing/events/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs        = UsageEvent.objects.all()
        service   = request.query_params.get('service')
        org_id    = request.query_params.get('org')
        ev_type   = request.query_params.get('type')
        ev_status = request.query_params.get('status')
        limit     = min(int(request.query_params.get('limit', 50)), 500)

        if service:   qs = qs.filter(service=service)
        if org_id:    qs = qs.filter(organization_id=org_id)
        if ev_type:   qs = qs.filter(event_type=ev_type)
        if ev_status: qs = qs.filter(status=ev_status)

        return Response(UsageEventSerializer(qs[:limit], many=True).data)


class EventIngestView(APIView):
    """
    POST /api/billing/events/ingest/
    Layer 1 → Layer 2 → Layer 3 pipeline entry point.
    """
    permission_classes = [IsAdminUser]
    throttle_classes   = [ScopedRateThrottle]
    throttle_scope     = 'billing_ingest'

    def post(self, request):
        ser = UsageEventIngestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = dict(ser.validated_data)
        try:
            event = process_event(payload, source_ip=self._get_ip(request))
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            UsageEventSerializer(event).data,
            status=status.HTTP_201_CREATED if event.status == 'processed' else status.HTTP_200_OK,
        )

    @staticmethod
    def _get_ip(request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


# ─────────────────────────────────────────────────────────────────────────────
# Organizations (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class OrganizationListView(APIView):
    """GET /api/billing/organizations/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs      = Organization.objects.prefetch_related('balance').all()
        plan    = request.query_params.get('plan')
        status_ = request.query_params.get('status')
        search  = request.query_params.get('search', '').strip()

        if plan:    qs = qs.filter(plan=plan)
        if status_: qs = qs.filter(status=status_)
        if search:  qs = qs.filter(name__icontains=search)

        return Response(OrganizationSerializer(qs, many=True).data)


class OrganizationDetailView(APIView):
    """GET /api/billing/organizations/:id/"""
    permission_classes = [IsAdminUser]

    def get(self, request, org_id):
        try:
            org = Organization.objects.prefetch_related('balance').get(pk=org_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        try:
            balance = OrgBalanceSerializer(org.balance).data
        except OrgBalance.DoesNotExist:
            balance = None

        return Response({
            'organization': OrganizationSerializer(org).data,
            'balance':      balance,
        })


class OrgUsageView(APIView):
    """GET /api/billing/organizations/:id/usage/"""
    permission_classes = [IsAdminUser]

    def get(self, request, org_id):
        data = (
            UsageEvent.objects.filter(organization_id=org_id, status='processed')
            .values('service', 'unit_type')
            .annotate(total_units=Sum('units'), total_cost=Sum('total_cost'), count=Count('id'))
            .order_by('service')
        )
        return Response(list(data))


class OrgInvoicesView(APIView):
    """GET /api/billing/organizations/:id/invoices/"""
    permission_classes = [IsAdminUser]

    def get(self, request, org_id):
        invoices = Invoice.objects.filter(organization_id=org_id).prefetch_related('line_items')
        return Response(InvoiceSerializer(invoices, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# Invoices (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class InvoiceListView(APIView):
    """GET /api/billing/invoices/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs      = Invoice.objects.prefetch_related('line_items').select_related('organization')
        status_ = request.query_params.get('status')
        org_id  = request.query_params.get('org')

        if status_: qs = qs.filter(status=status_)
        if org_id:  qs = qs.filter(organization_id=org_id)

        return Response(InvoiceSerializer(qs, many=True).data)


class InvoiceDetailView(APIView):
    """GET /api/billing/invoices/:id/"""
    permission_classes = [IsAdminUser]

    def get(self, request, invoice_id):
        try:
            inv = Invoice.objects.prefetch_related('line_items').get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        return Response(InvoiceSerializer(inv).data)


class InvoiceGenerateView(APIView):
    """POST /api/billing/invoices/generate/"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        org_id       = request.data.get('org_id')
        period_start = request.data.get('period_start')
        period_end   = request.data.get('period_end')

        if not all([org_id, period_start, period_end]):
            return Response({'error': 'org_id, period_start, and period_end are required'}, status=400)

        try:
            org = Organization.objects.get(pk=org_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=404)

        from datetime import date as _date
        try:
            ps = _date.fromisoformat(str(period_start))
            pe = _date.fromisoformat(str(period_end))
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)

        invoice = InvoiceGenerator.generate_for_period(org, ps, pe, actor=request.user)

        BillingAuditLog.objects.create(
            actor=request.user, organization=org,
            action='INVOICE_ISSUED',
            target=f'{invoice.invoice_number} / {org.name}',
            severity='info',
            ip_address=EventIngestView._get_ip(request),
        )
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class InvoicePaymentView(APIView):
    """POST /api/billing/invoices/:id/payment/"""
    permission_classes = [IsAdminUser]

    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        amount    = request.data.get('amount')
        method    = request.data.get('method', 'card')
        reference = request.data.get('reference', '')

        if not amount:
            return Response({'error': 'amount is required'}, status=400)
        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({'error': 'Invalid amount'}, status=400)

        payment = InvoiceGenerator.record_payment(
            invoice=invoice, amount=amount,
            method=method, reference=reference, actor=request.user,
        )
        BillingAuditLog.objects.create(
            actor=request.user, organization=invoice.organization,
            action='PAYMENT_RECEIVED',
            target=f'{invoice.invoice_number} / {invoice.organization.name}',
            severity='low',
        )
        return Response({'status': 'ok', 'payment_id': str(payment.id)})


# ─────────────────────────────────────────────────────────────────────────────
# Credits (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class CreditListView(APIView):
    """GET /api/billing/credits/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs      = Credit.objects.select_related('organization').all()
        status_ = request.query_params.get('status')
        org_id  = request.query_params.get('org')

        if status_: qs = qs.filter(status=status_)
        if org_id:  qs = qs.filter(organization_id=org_id)

        return Response(CreditSerializer(qs, many=True).data)


class CreditIssueView(APIView):
    """POST /api/billing/credits/issue/"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        org_id      = request.data.get('org_id')
        amount      = request.data.get('amount')
        credit_type = request.data.get('credit_type', 'credit')
        reason      = request.data.get('reason', '')
        expires_at  = request.data.get('expires_at')

        if not all([org_id, amount]):
            return Response({'error': 'org_id and amount are required'}, status=400)

        try:
            org = Organization.objects.get(pk=org_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=404)

        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({'error': 'Invalid amount'}, status=400)

        credit = Credit.objects.create(
            credit_number = _next_credit_number(),
            organization  = org,
            credit_type   = credit_type,
            amount        = amount,
            reason        = reason,
            expires_at    = expires_at or None,
            issued_by     = request.user,
        )
        LedgerWriter.write_credit(
            organization=org, amount=amount,
            credit_type=credit_type,
            reference=credit.credit_number,
            note=reason or f'Credit issued: {credit_type}',
            actor=request.user,
        )
        BalanceEngine.recompute(org)
        BillingAuditLog.objects.create(
            actor=request.user, organization=org,
            action='CREDIT_ISSUED',
            target=f'{credit.credit_number} / {org.name}',
            severity='medium',
        )
        return Response(CreditSerializer(credit).data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# Ledger (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class LedgerView(APIView):
    """GET /api/billing/ledger/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs         = LedgerEntry.objects.select_related('organization').all()
        org_id     = request.query_params.get('org')
        entry_type = request.query_params.get('type')
        service    = request.query_params.get('service')
        limit      = min(int(request.query_params.get('limit', 100)), 1000)

        if org_id:     qs = qs.filter(organization_id=org_id)
        if entry_type: qs = qs.filter(entry_type=entry_type)
        if service:    qs = qs.filter(service=service)

        return Response(LedgerEntrySerializer(qs[:limit], many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# Audit Log (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class AuditLogView(APIView):
    """GET /api/billing/audit/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs       = BillingAuditLog.objects.all()
        severity = request.query_params.get('severity')
        org_id   = request.query_params.get('org')
        limit    = min(int(request.query_params.get('limit', 100)), 1000)

        if severity: qs = qs.filter(severity=severity)
        if org_id:   qs = qs.filter(organization_id=org_id)

        return Response(BillingAuditLogSerializer(qs[:limit], many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# Pricing Rules (Layer 4)
# ─────────────────────────────────────────────────────────────────────────────

class PricingRuleListView(APIView):
    """GET /api/billing/pricing/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs      = PricingRule.objects.all()
        active  = request.query_params.get('active')
        service = request.query_params.get('service')

        if active is not None: qs = qs.filter(is_active=(active.lower() == 'true'))
        if service:            qs = qs.filter(service=service)

        return Response(PricingRuleSerializer(qs, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# User-Level Endpoints (§3.7)
# ─────────────────────────────────────────────────────────────────────────────

class UserUsageView(APIView):
    """GET /api/billing/users/<user_id>/usage/"""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        from django.contrib.auth.models import User as DjangoUser
        try:
            user = DjangoUser.objects.get(pk=user_id)
        except DjangoUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        limit       = min(int(request.query_params.get('limit', 200)), 1000)

        by_service = list(
            UsageEvent.objects.filter(user=user, status='processed')
            .values('service', 'unit_type')
            .annotate(
                total_units = Sum('units'),
                total_cost  = Sum('total_cost'),
                event_count = Count('id'),
            )
            .order_by('service')
        )

        mtd_cost = (
            UsageEvent.objects.filter(user=user, status='processed', event_timestamp__gte=month_start)
            .aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )

        recent_events = UsageEventSerializer(
            UsageEvent.objects.filter(user=user)[:limit], many=True
        ).data

        timeline = list(
            UsageEvent.objects.filter(user=user, status='processed')
            .extra(select={'day': "date_trunc('day', event_timestamp)"})
            .values('day')
            .annotate(total_cost=Sum('total_cost'), event_count=Count('id'))
            .order_by('day')
        )

        return Response({
            'user': {
                'id':       user.id,
                'username': user.username,
                'email':    user.email,
                'full_name': f'{user.first_name} {user.last_name}'.strip(),
            },
            'mtd_cost':    str(mtd_cost),
            'by_service':  [
                {
                    'service':     r['service'],
                    'unit_type':   r['unit_type'],
                    'total_units': str(r['total_units'] or 0),
                    'total_cost':  str(r['total_cost'] or 0),
                    'event_count': r['event_count'],
                }
                for r in by_service
            ],
            'timeline':    [
                {
                    'day':         str(r['day'])[:10] if r['day'] else None,
                    'total_cost':  str(r['total_cost'] or 0),
                    'event_count': r['event_count'],
                }
                for r in timeline
            ],
            'recent_events': recent_events,
            'as_of': now.isoformat(),
        })


class UserBillingView(APIView):
    """GET /api/billing/users/<user_id>/billing/"""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        from django.contrib.auth.models import User as DjangoUser
        try:
            user = DjangoUser.objects.get(pk=user_id)
        except DjangoUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_lifetime = (
            UsageEvent.objects.filter(user=user, status='processed')
            .aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )
        total_mtd = (
            UsageEvent.objects.filter(user=user, status='processed', event_timestamp__gte=month_start)
            .aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )
        top_services = list(
            UsageEvent.objects.filter(user=user, status='processed')
            .values('service')
            .annotate(total_cost=Sum('total_cost'))
            .order_by('-total_cost')[:5]
        )
        orgs_used = list(
            UsageEvent.objects.filter(user=user, status='processed')
            .values('organization__name', 'organization_id')
            .annotate(total_cost=Sum('total_cost'), event_count=Count('id'))
            .order_by('-total_cost')
        )

        return Response({
            'user': {
                'id':       user.id,
                'username': user.username,
                'email':    user.email,
            },
            'total_lifetime_cost': str(total_lifetime),
            'total_mtd_cost':      str(total_mtd),
            'top_services': [
                {'service': r['service'], 'total_cost': str(r['total_cost'] or 0)}
                for r in top_services
            ],
            'organizations': [
                {
                    'organization_id':   str(r['organization_id']),
                    'organization_name': r['organization__name'],
                    'total_cost':        str(r['total_cost'] or 0),
                    'event_count':       r['event_count'],
                }
                for r in orgs_used
            ],
            'as_of': now.isoformat(),
        })


# ─────────────────────────────────────────────────────────────────────────────
# Service-Level Endpoints (§3.7)
# ─────────────────────────────────────────────────────────────────────────────

class ServiceUsageView(APIView):
    """GET /api/billing/services/<service>/usage/"""
    permission_classes = [IsAdminUser]

    def get(self, request, service):
        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        base = UsageEvent.objects.filter(service=service, status='processed')

        by_unit = list(
            base.values('unit_type')
            .annotate(total_units=Sum('units'), total_cost=Sum('total_cost'), event_count=Count('id'))
            .order_by('unit_type')
        )

        top_orgs = list(
            base.values('organization__name', 'organization_id')
            .annotate(total_units=Sum('units'), total_cost=Sum('total_cost'))
            .order_by('-total_cost')[:10]
        )

        timeline = list(
            base.extra(select={'day': "date_trunc('day', event_timestamp)"})
            .values('day')
            .annotate(total_units=Sum('units'), total_cost=Sum('total_cost'), event_count=Count('id'))
            .order_by('day')
        )

        mtd_units = (
            base.filter(event_timestamp__gte=month_start)
            .aggregate(s=Sum('units'))['s'] or Decimal('0')
        )
        mtd_cost = (
            base.filter(event_timestamp__gte=month_start)
            .aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )

        return Response({
            'service':    service,
            'mtd_units':  str(mtd_units),
            'mtd_cost':   str(mtd_cost),
            'by_unit_type': [
                {
                    'unit_type':   r['unit_type'],
                    'total_units': str(r['total_units'] or 0),
                    'total_cost':  str(r['total_cost'] or 0),
                    'event_count': r['event_count'],
                }
                for r in by_unit
            ],
            'top_organizations': [
                {
                    'organization_id':   str(r['organization_id']),
                    'organization_name': r['organization__name'],
                    'total_units':       str(r['total_units'] or 0),
                    'total_cost':        str(r['total_cost'] or 0),
                }
                for r in top_orgs
            ],
            'timeline': [
                {
                    'day':         str(r['day'])[:10] if r['day'] else None,
                    'total_units': str(r['total_units'] or 0),
                    'total_cost':  str(r['total_cost'] or 0),
                    'event_count': r['event_count'],
                }
                for r in timeline
            ],
            'as_of': now.isoformat(),
        })


class ServiceBillingView(APIView):
    """GET /api/billing/services/<service>/billing/"""
    permission_classes = [IsAdminUser]

    def get(self, request, service):
        now         = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        base = UsageEvent.objects.filter(service=service, status='processed')

        total_lifetime = (
            base.aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )
        total_mtd = (
            base.filter(event_timestamp__gte=month_start)
            .aggregate(s=Sum('total_cost'))['s'] or Decimal('0')
        )

        ledger_totals = (
            LedgerEntry.objects.filter(service=service)
            .values('entry_type')
            .annotate(total=Sum('amount'))
        )
        ledger_by_type = {r['entry_type']: str(r['total'] or 0) for r in ledger_totals}

        pricing_rules = PricingRule.objects.filter(service=service, is_active=True)

        monthly_trend = list(
            base.extra(select={'month': "date_trunc('month', event_timestamp)"})
            .values('month')
            .annotate(total_cost=Sum('total_cost'), event_count=Count('id'))
            .order_by('month')
        )

        return Response({
            'service':             service,
            'total_lifetime_cost': str(total_lifetime),
            'total_mtd_cost':      str(total_mtd),
            'ledger_by_entry_type': ledger_by_type,
            'active_pricing_rules': PricingRuleSerializer(pricing_rules, many=True).data,
            'monthly_trend': [
                {
                    'month':       str(r['month'])[:7] if r['month'] else None,
                    'total_cost':  str(r['total_cost'] or 0),
                    'event_count': r['event_count'],
                }
                for r in monthly_trend
            ],
            'as_of': now.isoformat(),
        })


# ─────────────────────────────────────────────────────────────────────────────
# Billing System Metrics (§4.5 — Monitoring & Observability)
# ─────────────────────────────────────────────────────────────────────────────

class BillingMetricsView(APIView):
    """
    GET /api/billing/metrics/

    Returns operational health metrics for the billing pipeline:
      - Event pipeline health (queued, failed, duplicate counts)
      - Ledger statistics (total entries, writes today)
      - Invoice pipeline statistics
      - Credit & payment statistics
      - Compliance posture summary (retention windows)

    Used by monitoring systems, alerting dashboards, and DevOps (§4.5).
    """
    permission_classes = [IsAdminUser]
    throttle_classes   = [ScopedRateThrottle]
    throttle_scope     = 'billing_read'

    def get(self, request):
        now         = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        hour_start  = now.replace(minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # ── Event pipeline ───────────────────────────────────────────────────
        ev_qs = UsageEvent.objects
        total_events     = ev_qs.count()
        pending_events   = ev_qs.filter(status='pending').count()
        processed_events = ev_qs.filter(status='processed').count()
        rejected_events  = ev_qs.filter(status='rejected').count()
        duplicate_events = ev_qs.filter(status='duplicate').count()
        events_today     = ev_qs.filter(received_at__gte=today_start).count()
        events_this_hour = ev_qs.filter(received_at__gte=hour_start).count()
        events_mtd       = ev_qs.filter(received_at__gte=month_start).count()

        # Error rate (rejected / total, guard div-zero)
        event_error_rate = (
            round(rejected_events / total_events * 100, 2) if total_events else 0.0
        )
        duplicate_rate = (
            round(duplicate_events / (total_events + duplicate_events) * 100, 2)
            if (total_events + duplicate_events) else 0.0
        )

        # Events per service today
        by_service_today = list(
            ev_qs.filter(received_at__gte=today_start)
            .values('service')
            .annotate(count=Count('id'), cost=Sum('total_cost'))
            .order_by('-count')
        )

        # ── Ledger ───────────────────────────────────────────────────────────
        total_ledger_entries  = LedgerEntry.objects.count()
        ledger_writes_today   = LedgerEntry.objects.filter(created_at__gte=today_start).count()
        ledger_writes_mtd     = LedgerEntry.objects.filter(created_at__gte=month_start).count()
        by_entry_type = list(
            LedgerEntry.objects.values('entry_type')
            .annotate(count=Count('id'), total=Sum('amount'))
        )

        # ── Invoices ─────────────────────────────────────────────────────────
        inv_counts = dict(
            Invoice.objects
            .values_list('status')
            .annotate(n=Count('id'))
        )
        invoices_generated_mtd = Invoice.objects.filter(created_at__gte=month_start).count()
        overdue_balance = (
            Invoice.objects.filter(status='overdue')
            .aggregate(s=Sum('total'))['s'] or Decimal('0')
        )

        # ── Credits & Payments ───────────────────────────────────────────────
        total_credits  = Credit.objects.count()
        credits_mtd    = Credit.objects.filter(created_at__gte=month_start).count()
        total_payments = Payment.objects.count()
        failed_payments= Payment.objects.filter(status='failed').count()

        # ── Pricing rules ────────────────────────────────────────────────────
        active_pricing_rules = PricingRule.objects.filter(is_active=True).count()
        total_pricing_rules  = PricingRule.objects.count()

        # ── Audit trail ──────────────────────────────────────────────────────
        audit_today = BillingAuditLog.objects.filter(created_at__gte=today_start).count()
        high_severity_today = BillingAuditLog.objects.filter(
            created_at__gte=today_start, severity='high'
        ).count()

        # ── Compliance / Retention posture (§4.4 E) ─────────────────────────
        from datetime import timedelta
        two_years_ago = now - timedelta(days=730)
        one_year_ago  = now - timedelta(days=365)
        seven_years_ago = now - timedelta(days=2555)

        events_approaching_retention   = ev_qs.filter(received_at__lte=two_years_ago).count()
        audit_approaching_retention    = BillingAuditLog.objects.filter(created_at__lte=one_year_ago).count()
        ledger_approaching_retention   = LedgerEntry.objects.filter(created_at__lte=seven_years_ago).count()

        return Response({
            'as_of': now.isoformat(),
            'event_pipeline': {
                'total':           total_events,
                'pending':         pending_events,
                'processed':       processed_events,
                'rejected':        rejected_events,
                'duplicate':       duplicate_events,
                'today':           events_today,
                'this_hour':       events_this_hour,
                'mtd':             events_mtd,
                'error_rate_pct':  event_error_rate,
                'duplicate_rate_pct': duplicate_rate,
                'by_service_today': [
                    {
                        'service': r['service'],
                        'count':   r['count'],
                        'cost':    str(r['cost'] or 0),
                    }
                    for r in by_service_today
                ],
            },
            'ledger': {
                'total_entries':  total_ledger_entries,
                'writes_today':   ledger_writes_today,
                'writes_mtd':     ledger_writes_mtd,
                'by_entry_type': [
                    {
                        'entry_type': r['entry_type'],
                        'count':      r['count'],
                        'total':      str(r['total'] or 0),
                    }
                    for r in by_entry_type
                ],
            },
            'invoices': {
                'by_status':            inv_counts,
                'generated_mtd':        invoices_generated_mtd,
                'overdue_balance':       str(overdue_balance),
                'outstanding_count':     inv_counts.get('issued', 0) + inv_counts.get('outstanding', 0),
            },
            'credits_payments': {
                'total_credits':    total_credits,
                'credits_mtd':      credits_mtd,
                'total_payments':   total_payments,
                'failed_payments':  failed_payments,
            },
            'pricing': {
                'active_rules': active_pricing_rules,
                'total_rules':  total_pricing_rules,
            },
            'audit': {
                'events_today':       audit_today,
                'high_severity_today': high_severity_today,
            },
            'retention_posture': {
                'events_past_2yr_window':   events_approaching_retention,
                'audit_past_1yr_window':    audit_approaching_retention,
                'ledger_past_7yr_window':   ledger_approaching_retention,
                'policy': {
                    'events':   '2 years',
                    'audit':    '1 year',
                    'ledger':   '7 years',
                    'invoices': '7 years',
                },
            },
        })
