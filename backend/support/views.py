from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.utils import timezone

from .models import SupportTicket, TicketReply, TicketAuditLog
from .serializers import (
    SupportTicketCreateSerializer,
    SupportTicketListSerializer,
    SupportTicketDetailSerializer,
    ReplyCreateSerializer,
)


def _log(ticket, actor, action, detail=''):
    TicketAuditLog.objects.create(ticket=ticket, actor=actor, action=action, detail=detail)


def _send_confirmation(ticket):
    try:
        from emails.service import EmailService
        EmailService.send(
            email_type='support_confirmation',
            recipient=ticket.email,
            context={
                'name': ticket.name,
                'ticket_ref': ticket.ticket_ref,
                'category': ticket.get_category_display(),
                'subject': ticket.subject,
                'message': ticket.message,
                'priority': ticket.get_priority_display(),
            },
        )
    except Exception:
        pass  # never block ticket creation because of email failure


def _send_reply_notification(reply):
    try:
        from emails.service import EmailService
        ticket = reply.ticket
        EmailService.send(
            email_type='support_reply',
            recipient=ticket.email,
            context={
                'name': ticket.name,
                'ticket_ref': ticket.ticket_ref,
                'subject': ticket.subject,
                'reply_message': reply.message,
                'agent_name': reply.sender_name or 'Support Team',
            },
        )
    except Exception:
        pass


class IsStaffOrCreate(permissions.BasePermission):
    """Allow POST to anyone (throttled), all other methods to staff only."""

    def has_permission(self, request, view):
        if view.action == 'create':
            return True
        if view.action == 'my_tickets':
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class SupportTicketViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ['subject', 'name', 'email', 'ticket_ref_search']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering        = ['-created_at']
    permission_classes = [IsStaffOrCreate]

    def get_throttles(self):
        if self.action == 'create':
            return [SupportCreateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = SupportTicket.objects.select_related('user', 'assigned_to').prefetch_related(
            'replies', 'audit_logs'
        )
        # Non-staff may only see their own tickets (via /my/ endpoint)
        if self.action == 'my_tickets':
            return qs.filter(user=self.request.user)
        if not self.request.user.is_staff:
            return qs.none()

        # Staff filtering
        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')
        category_param = self.request.query_params.get('category')
        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if category_param:
            qs = qs.filter(category=category_param)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return SupportTicketCreateSerializer
        if self.action in ('retrieve', 'reply', 'change_status', 'assign'):
            return SupportTicketDetailSerializer
        return SupportTicketListSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        ip   = self._get_client_ip()
        ua   = self.request.META.get('HTTP_USER_AGENT', '')[:512]
        ticket = serializer.save(user=user, ip_address=ip, user_agent=ua)
        _log(ticket, user, 'created', f'Ticket submitted from {ip}')
        _send_confirmation(ticket)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'detail': 'Support ticket submitted.', 'status': 'ok'}, status=status.HTTP_201_CREATED)

    # ──────────────────────────────────────────────────────────────────────────
    # Custom actions
    # ──────────────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status in ('resolved', 'closed'):
            return Response({'detail': 'Cannot reply to a closed ticket.'}, status=400)
        ser = ReplyCreateSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        sender_name = request.user.get_full_name() or request.user.username
        reply = ser.save(
            ticket=ticket,
            sender_type='support',
            sender_user=request.user,
            sender_name=sender_name,
        )
        ticket.updated_at = timezone.now()
        if ticket.status == 'open':
            ticket.status = 'pending'
        ticket.save(update_fields=['status', 'updated_at'])
        _log(ticket, request.user, 'replied', f'Reply added by {sender_name}')
        if not reply.is_internal:
            _send_reply_notification(reply)
        return Response({'detail': 'Reply added.'}, status=201)

    @action(detail=True, methods=['patch'], url_path='status')
    def change_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in SupportTicket.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'detail': f'Invalid status. Choices: {valid}'}, status=400)
        old_status = ticket.status
        ticket.status = new_status
        ticket.updated_at = timezone.now()
        ticket.save(update_fields=['status', 'updated_at'])
        _log(ticket, request.user, 'status_changed', f'{old_status} → {new_status}')
        return Response({'detail': f'Status updated to {new_status}.'})

    @action(detail=True, methods=['patch'], url_path='assign')
    def assign(self, request, pk=None):
        from django.contrib.auth.models import User
        ticket = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            ticket.assigned_to = None
            ticket.save(update_fields=['assigned_to', 'updated_at'])
            _log(ticket, request.user, 'unassigned', 'Ticket unassigned')
            return Response({'detail': 'Ticket unassigned.'})
        try:
            agent = User.objects.get(pk=user_id, is_staff=True)
        except User.DoesNotExist:
            return Response({'detail': 'Staff user not found.'}, status=400)
        ticket.assigned_to = agent
        ticket.updated_at  = timezone.now()
        ticket.save(update_fields=['assigned_to', 'updated_at'])
        _log(ticket, request.user, 'assigned', f'Assigned to {agent.username}')
        return Response({'detail': f'Assigned to {agent.username}.'})

    @action(detail=False, methods=['get'], url_path='my')
    def my_tickets(self, request, pk=None):
        qs = self.get_queryset()
        serializer = SupportTicketListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        qs = SupportTicket.objects.all()
        return Response({
            'open':      qs.filter(status='open').count(),
            'pending':   qs.filter(status='pending').count(),
            'escalated': qs.filter(status='escalated').count(),
            'resolved':  qs.filter(status='resolved').count(),
            'closed':    qs.filter(status='closed').count(),
            'total':     qs.count(),
        })

    # ──────────────────────────────────────────────────────────────────────────

    def _get_client_ip(self):
        x_forwarded = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return self.request.META.get('REMOTE_ADDR', '')


class SupportCreateThrottle(ScopedRateThrottle):
    scope = 'support_create'
