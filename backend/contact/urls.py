from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InquiryViewSet
from .admin_views import (
    AdminInquiryViewSet, AdminEventViewSet,
    analytics_dashboard, admin_users_list
)

# Public router (for contact form submissions)
public_router = DefaultRouter()
public_router.register(r'inquiries', InquiryViewSet, basename='inquiry')

# Admin router (for dashboard)
admin_router = DefaultRouter()
admin_router.register(r'inquiries', AdminInquiryViewSet, basename='admin-inquiry')
admin_router.register(r'events', AdminEventViewSet, basename='admin-event')

urlpatterns = [
    # Public endpoints
    path('', include(public_router.urls)),
    
    # Admin dashboard endpoints
    path('admin/', include(admin_router.urls)),
    path('admin/analytics/', analytics_dashboard, name='admin-analytics'),
    path('admin/users/', admin_users_list, name='admin-users'),
]
