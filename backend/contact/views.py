from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
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
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Get country from request data first (user-submitted), fallback to IP geolocation
        country = request.data.get('country', '')
        country_code = request.data.get('country_code', '')
        
        # If country not provided, try to get from IP using ip-api.com (free service)
        if not country and not country_code:
            try:
                if client_ip and client_ip != '127.0.0.1':
                    response = requests.get(f'http://ip-api.com/json/{client_ip}', timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('status') == 'success':
                            country = data.get('country', '')
                            country_code = data.get('countryCode', '')
            except Exception as e:
                print(f"Error getting country info: {e}")
        
        # Add metadata
        inquiry = serializer.save(
            ip_address=client_ip,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            country=country,
            country_code=country_code
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
