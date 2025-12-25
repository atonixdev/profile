from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import ActivityEvent
from .serializers import ActivityEventSerializer


class ActivityEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityEvent.objects.all()
    serializer_class = ActivityEventSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'actor', 'status_code', 'path', 'method']
    search_fields = ['path', 'user_agent', 'referrer', 'object_id']
    ordering_fields = ['created_at', 'duration_ms', 'status_code']
    ordering = ['-created_at']
