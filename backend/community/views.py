from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import CommunityMember, Discussion, DiscussionReply, Event, EventAttendee, Resource, CommunityStatistic
from .serializers import (
    CommunityMemberSerializer, CommunityMemberListSerializer, DiscussionSerializer,
    DiscussionListSerializer, DiscussionReplySerializer, EventSerializer, EventListSerializer,
    EventAttendeeSerializer, ResourceSerializer, ResourceListSerializer, CommunityStatisticSerializer
)


class CommunityMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for community members"""
    queryset = CommunityMember.objects.filter(is_active=True)
    serializer_class = CommunityMemberSerializer
    lookup_field = 'user__username'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'bio', 'expertise_areas']
    ordering_fields = ['contribution_points', 'joined_date']
    ordering = ['-contribution_points']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CommunityMemberListSerializer
        return CommunityMemberSerializer
    
    @action(detail=True, methods=['post'])
    def increment_contribution_points(self, request, user__username=None):
        """Increment a member's contribution points"""
        member = self.get_object()
        points = request.data.get('points', 1)
        member.contribution_points += points
        member.save()
        return Response({'contribution_points': member.contribution_points})


class DiscussionViewSet(viewsets.ModelViewSet):
    """ViewSet for discussions/forum posts"""
    queryset = Discussion.objects.select_related('author').prefetch_related('replies')
    serializer_class = DiscussionSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'view_count', 'like_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DiscussionListSerializer
        return DiscussionSerializer
    
    @action(detail=True, methods=['post'])
    def increment_view_count(self, request, slug=None):
        """Increment discussion view count"""
        discussion = self.get_object()
        discussion.view_count += 1
        discussion.save()
        return Response({'view_count': discussion.view_count})
    
    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        """Like a discussion"""
        discussion = self.get_object()
        discussion.like_count += 1
        discussion.save()
        return Response({'like_count': discussion.like_count})
    
    @action(detail=True, methods=['get'])
    def replies(self, request, slug=None):
        """Get replies for a discussion"""
        discussion = self.get_object()
        replies = discussion.replies.all()
        serializer = DiscussionReplySerializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, slug=None):
        """Add a reply to a discussion"""
        discussion = self.get_object()
        
        # Get or create member for current user
        try:
            author = CommunityMember.objects.get(user=request.user)
        except CommunityMember.DoesNotExist:
            return Response({'error': 'User must be a community member'}, status=status.HTTP_400_BAD_REQUEST)
        
        reply = DiscussionReply.objects.create(
            discussion=discussion,
            author=author,
            content=request.data.get('content')
        )
        serializer = DiscussionReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DiscussionReplyViewSet(viewsets.ModelViewSet):
    """ViewSet for discussion replies"""
    queryset = DiscussionReply.objects.select_related('author', 'discussion')
    serializer_class = DiscussionReplySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['discussion', 'is_solution']
    
    @action(detail=True, methods=['post'])
    def mark_as_solution(self, request, pk=None):
        """Mark a reply as solution"""
        reply = self.get_object()
        reply.is_solution = True
        reply.save()
        return Response({'is_solution': True})
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a reply"""
        reply = self.get_object()
        reply.like_count += 1
        reply.save()
        return Response({'like_count': reply.like_count})


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for community events"""
    queryset = Event.objects.filter(is_published=True).select_related('organizer').prefetch_related('attendees')
    serializer_class = EventSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'is_online']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['event_date', 'attendee_count']
    ordering = ['event_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer
    
    @action(detail=True, methods=['post'])
    def register(self, request, slug=None):
        """Register user for event"""
        event = self.get_object()
        
        try:
            member = CommunityMember.objects.get(user=request.user)
        except CommunityMember.DoesNotExist:
            return Response({'error': 'User must be a community member'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendee, created = EventAttendee.objects.get_or_create(
            event=event,
            member=member
        )
        
        if created:
            event.attendee_count += 1
            event.save()
        
        serializer = EventAttendeeSerializer(attendee)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, slug=None):
        """Unregister user from event"""
        event = self.get_object()
        
        try:
            member = CommunityMember.objects.get(user=request.user)
            attendee = EventAttendee.objects.get(event=event, member=member)
            attendee.delete()
            
            event.attendee_count = max(0, event.attendee_count - 1)
            event.save()
            
            return Response({'status': 'unregistered'})
        except (CommunityMember.DoesNotExist, EventAttendee.DoesNotExist):
            return Response({'error': 'Not registered for this event'}, status=status.HTTP_400_BAD_REQUEST)


class ResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for community resources"""
    queryset = Resource.objects.filter(is_published=True).select_related('author')
    serializer_class = ResourceSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['resource_type', 'category', 'difficulty_level', 'featured']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'view_count', 'like_count']
    ordering = ['-featured', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ResourceListSerializer
        return ResourceSerializer
    
    @action(detail=True, methods=['post'])
    def increment_view_count(self, request, slug=None):
        """Increment resource view count"""
        resource = self.get_object()
        resource.view_count += 1
        resource.save()
        return Response({'view_count': resource.view_count})
    
    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        """Like a resource"""
        resource = self.get_object()
        resource.like_count += 1
        resource.save()
        return Response({'like_count': resource.like_count})


class CommunityStatisticViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for community statistics (read-only)"""
    queryset = CommunityStatistic.objects.all()
    serializer_class = CommunityStatisticSerializer
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current community statistics"""
        stats = CommunityStatistic.objects.first()
        if not stats:
            stats = CommunityStatistic.objects.create()
        
        # Update stats
        stats.total_members = CommunityMember.objects.filter(is_active=True).count()
        stats.total_discussions = Discussion.objects.count()
        stats.total_events = Event.objects.filter(is_published=True).count()
        stats.total_resources = Resource.objects.filter(is_published=True).count()
        stats.save()
        
        serializer = self.get_serializer(stats)
        return Response(serializer.data)
