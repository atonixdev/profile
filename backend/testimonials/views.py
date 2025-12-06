from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Testimonial
from .serializers import TestimonialSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Testimonial.objects.all()
        
        # Non-admin users only see published testimonials
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        # Filter featured
        featured = self.request.query_params.get('featured', None)
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured testimonials"""
        testimonials = Testimonial.objects.filter(is_featured=True, is_published=True)
        serializer = self.get_serializer(testimonials, many=True)
        return Response(serializer.data)
