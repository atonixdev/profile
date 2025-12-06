from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Inquiry
from .serializers import InquirySerializer, InquiryCreateSerializer


class InquiryPermission(permissions.BasePermission):
    """
    Custom permission:
    - Anyone can create (POST)
    - Only staff can view list/details and update
    """
    def has_permission(self, request, view):
        if view.action == 'create':
            return True
        return request.user and request.user.is_staff


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    permission_classes = [InquiryPermission]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InquiryCreateSerializer
        return InquirySerializer
    
    def create(self, request, *args, **kwargs):
        """Handle public inquiry submission"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Add metadata
        inquiry = serializer.save(
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response(
            {'message': 'Your inquiry has been submitted successfully!', 'id': inquiry.id},
            status=status.HTTP_201_CREATED
        )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update inquiry status"""
        inquiry = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Inquiry.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inquiry.status = new_status
        inquiry.save()
        
        serializer = self.get_serializer(inquiry)
        return Response(serializer.data)
