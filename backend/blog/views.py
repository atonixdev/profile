from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost
from .serializers import BlogPostSerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'published', 'author']
    search_fields = ['title', 'content', 'excerpt', 'tags']
    ordering_fields = ['published_at', 'created_at', 'title']
    ordering = ['-published_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'published', 'categories']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = BlogPost.objects.all()
        if not self.request.user.is_staff:
            # Only show published posts to non-admin users
            queryset = queryset.filter(published=True)
        return queryset

    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get only published posts"""
        queryset = self.get_queryset().filter(published=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available categories"""
        categories = BlogPost.CATEGORY_CHOICES
        return Response([{'value': choice[0], 'label': choice[1]} for choice in categories])
