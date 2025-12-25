"""
Admin Dashboard API Views
Provides endpoints for the admin dashboard including inquiries, replies, events, and analytics
"""
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User

from .models import Inquiry, AdminReply, Event
from .serializers import (
    InquirySerializer, InquiryListSerializer, InquiryUpdateSerializer,
    AdminReplySerializer, EventSerializer, EventListSerializer,
    EventCreateUpdateSerializer, UserSerializer
)


class AdminInquiryViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing inquiries
    Provides full CRUD + custom actions for replies and status management
    """
    permission_classes = [IsAdminUser]
    queryset = Inquiry.objects.all().select_related('assigned_to').prefetch_related('replies')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InquiryListSerializer
        elif self.action in ['update', 'partial_update']:
            return InquiryUpdateSerializer
        return InquirySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to', None)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search) |
                Q(message__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        """Add a reply to an inquiry"""
        inquiry = self.get_object()
        message = request.data.get('message')
        send_email = request.data.get('send_email', False)
        
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create reply
        reply = AdminReply.objects.create(
            inquiry=inquiry,
            admin_user=request.user,
            message=message,
            sent_via_email=send_email
        )
        
        # Update inquiry status if it was new
        if inquiry.status == 'new':
            inquiry.status = 'in_progress'
            inquiry.save()
        
        # TODO: Send email if requested
        if send_email:
            # Implement email sending logic here
            reply.email_sent_at = timezone.now()
            reply.save()
        
        serializer = AdminReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get all replies for an inquiry"""
        inquiry = self.get_object()
        replies = inquiry.replies.all()
        serializer = AdminReplySerializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get inquiry statistics"""
        total_inquiries = Inquiry.objects.count()
        new_inquiries = Inquiry.objects.filter(status='new').count()
        in_progress = Inquiry.objects.filter(status='in_progress').count()
        completed = Inquiry.objects.filter(status='completed').count()
        
        # Today's inquiries
        today = timezone.now().date()
        today_inquiries = Inquiry.objects.filter(created_at__date=today).count()
        
        # This week's inquiries
        week_ago = timezone.now() - timedelta(days=7)
        week_inquiries = Inquiry.objects.filter(created_at__gte=week_ago).count()
        
        # This month's inquiries
        month_ago = timezone.now() - timedelta(days=30)
        month_inquiries = Inquiry.objects.filter(created_at__gte=month_ago).count()
        
        # By type
        by_type = Inquiry.objects.values('inquiry_type').annotate(count=Count('id'))
        
        # Recent inquiries
        recent = Inquiry.objects.order_by('-created_at')[:5]
        recent_serializer = InquiryListSerializer(recent, many=True)
        
        return Response({
            'total': total_inquiries,
            'new': new_inquiries,
            'in_progress': in_progress,
            'completed': completed,
            'today': today_inquiries,
            'this_week': week_inquiries,
            'this_month': month_inquiries,
            'by_type': list(by_type),
            'recent': recent_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update inquiries (status, assignment)"""
        inquiry_ids = request.data.get('inquiry_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not inquiry_ids:
            return Response(
                {'error': 'inquiry_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inquiries = Inquiry.objects.filter(id__in=inquiry_ids)
        updated_count = inquiries.update(**update_data)
        
        return Response({
            'message': f'{updated_count} inquiries updated successfully',
            'updated_count': updated_count
        })


class AdminEventViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing events
    Provides full CRUD + filtering and transfer functionality
    """
    permission_classes = [IsAdminUser]
    queryset = Event.objects.all().select_related(
        'created_by', 'assigned_to', 'transferred_from', 'related_inquiry'
    )
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to', None)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Transfer event to another user"""
        event = self.get_object()
        new_assignee_id = request.data.get('assigned_to')
        
        if not new_assignee_id:
            return Response(
                {'error': 'assigned_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_assignee = User.objects.get(id=new_assignee_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Save transfer information
        event.transferred_from = event.assigned_to
        event.assigned_to = new_assignee
        event.status = 'transferred'
        event.save()
        
        serializer = EventSerializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark event as completed"""
        event = self.get_object()
        event.status = 'completed'
        event.completed_at = timezone.now()
        event.save()
        
        serializer = EventSerializer(event)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get event statistics"""
        total_events = Event.objects.count()
        pending = Event.objects.filter(status='pending').count()
        in_progress = Event.objects.filter(status='in_progress').count()
        completed = Event.objects.filter(status='completed').count()
        
        # Today's events
        today = timezone.now().date()
        today_events = Event.objects.filter(created_at__date=today).count()
        
        # Overdue events
        overdue = Event.objects.filter(
            due_date__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).count()
        
        # By priority
        by_priority = Event.objects.values('priority').annotate(count=Count('id'))
        
        # By type
        by_type = Event.objects.values('event_type').annotate(count=Count('id'))
        
        # Recent events
        recent = Event.objects.order_by('-created_at')[:5]
        recent_serializer = EventListSerializer(recent, many=True)
        
        return Response({
            'total': total_events,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed,
            'today': today_events,
            'overdue': overdue,
            'by_priority': list(by_priority),
            'by_type': list(by_type),
            'recent': recent_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """Get events in timeline format"""
        # Get events for the last 30 days by default
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        events = Event.objects.filter(created_at__gte=start_date).order_by('created_at')
        serializer = EventSerializer(events, many=True)
        
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def analytics_dashboard(request):
    """
    Get comprehensive analytics for the dashboard
    """
    # Date ranges
    today = timezone.now().date()
    week_ago = timezone.now() - timedelta(days=7)
    month_ago = timezone.now() - timedelta(days=30)
    
    # Inquiry analytics
    inquiry_stats = {
        'total': Inquiry.objects.count(),
        'new': Inquiry.objects.filter(status='new').count(),
        'in_progress': Inquiry.objects.filter(status='in_progress').count(),
        'completed': Inquiry.objects.filter(status='completed').count(),
        'today': Inquiry.objects.filter(created_at__date=today).count(),
        'this_week': Inquiry.objects.filter(created_at__gte=week_ago).count(),
        'this_month': Inquiry.objects.filter(created_at__gte=month_ago).count(),
    }
    
    # Event analytics
    event_stats = {
        'total': Event.objects.count(),
        'pending': Event.objects.filter(status='pending').count(),
        'in_progress': Event.objects.filter(status='in_progress').count(),
        'completed': Event.objects.filter(status='completed').count(),
        'today': Event.objects.filter(created_at__date=today).count(),
        'overdue': Event.objects.filter(
            due_date__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).count(),
    }
    
    # Reply stats
    reply_stats = {
        'total': AdminReply.objects.count(),
        'today': AdminReply.objects.filter(created_at__date=today).count(),
        'this_week': AdminReply.objects.filter(created_at__gte=week_ago).count(),
    }
    
    # Daily inquiry trend (last 30 days)
    inquiry_trend = []
    for i in range(30):
        date = (timezone.now() - timedelta(days=i)).date()
        count = Inquiry.objects.filter(created_at__date=date).count()
        inquiry_trend.append({
            'date': date.isoformat(),
            'count': count
        })
    inquiry_trend.reverse()
    
    # Daily event trend (last 30 days)
    event_trend = []
    for i in range(30):
        date = (timezone.now() - timedelta(days=i)).date()
        count = Event.objects.filter(created_at__date=date).count()
        event_trend.append({
            'date': date.isoformat(),
            'count': count
        })
    event_trend.reverse()
    
    # Response time (average time to first reply)
    inquiries_with_replies = Inquiry.objects.filter(replies__isnull=False).distinct()
    response_times = []
    for inquiry in inquiries_with_replies:
        first_reply = inquiry.replies.first()
        if first_reply:
            time_diff = first_reply.created_at - inquiry.created_at
            response_times.append(time_diff.total_seconds() / 3600)  # in hours
    
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    return Response({
        'inquiries': inquiry_stats,
        'events': event_stats,
        'replies': reply_stats,
        'inquiry_trend': inquiry_trend,
        'event_trend': event_trend,
        'avg_response_time_hours': round(avg_response_time, 2)
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Get list of admin users for assignment"""
    users = User.objects.filter(is_staff=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
