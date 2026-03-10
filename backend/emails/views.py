from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class EmailLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class EmailLogListView(APIView):
    """Read-only paginated list of EmailLog records. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import EmailLog
        qs = EmailLog.objects.order_by('-created_at')

        email_type = request.query_params.get('email_type', '').strip()
        if email_type:
            qs = qs.filter(email_type=email_type)

        status = request.query_params.get('status', '').strip()
        if status:
            qs = qs.filter(status=status)

        recipient = request.query_params.get('recipient', '').strip()
        if recipient:
            qs = qs.filter(recipient__icontains=recipient)

        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id': str(obj.pk),
                'recipient': obj.recipient,
                'subject': obj.subject,
                'email_type': obj.email_type,
                'template_name': obj.template_name,
                'status': obj.status,
                'error_message': obj.error_message,
                'ip_address': obj.ip_address,
                'created_at': obj.created_at.isoformat() if obj.created_at else None,
            }
            for obj in page
        ]
        return paginator.get_paginated_response(data)


class SecurityAuditLogListView(APIView):
    """Read-only paginated list of SecurityAuditLog records. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import SecurityAuditLog
        qs = SecurityAuditLog.objects.select_related('actor', 'target_user').order_by('-created_at')

        action = request.query_params.get('action', '').strip()
        if action:
            qs = qs.filter(action=action)

        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id': str(obj.pk),
                'action': obj.action,
                'actor': obj.actor.get_full_name() or obj.actor.username if obj.actor else None,
                'actor_email': obj.actor.email if obj.actor else None,
                'target_email': obj.target_email,
                'ip_address': obj.ip_address,
                'description': obj.description,
                'created_at': obj.created_at.isoformat() if obj.created_at else None,
            }
            for obj in page
        ]
        return paginator.get_paginated_response(data)
