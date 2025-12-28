from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, RegisterView, MFASetupView, MFAEnableView, MFADisableView

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('mfa/setup/', MFASetupView.as_view(), name='mfa_setup'),
    path('mfa/enable/', MFAEnableView.as_view(), name='mfa_enable'),
    path('mfa/disable/', MFADisableView.as_view(), name='mfa_disable'),
]
