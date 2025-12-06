from rest_framework import viewsets, permissions
from .models import Service
from .serializers import ServiceSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Service.objects.all()
        
        # Non-admin users only see active services
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        
        return queryset
