from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, BlogComment
from .serializers import BlogPostSerializer, BlogPostListSerializer, BlogCommentSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['created_at', 'view_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    @action(detail=True, methods=['post'])
    def increment_views(self, request, slug=None):
        post = self.get_object()
        post.view_count += 1
        post.save()
        return Response({'view_count': post.view_count})

    @action(detail=True, methods=['post'])
    def add_comment(self, request, slug=None):
        post = self.get_object()
        serializer = BlogCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'])
    def comments(self, request, slug=None):
        post = self.get_object()
        comments = post.comments.filter(is_approved=True)
        serializer = BlogCommentSerializer(comments, many=True)
        return Response(serializer.data)
