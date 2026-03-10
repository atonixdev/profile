from django.urls import path
from .views import EmailLogListView, SecurityAuditLogListView

urlpatterns = [
    path('email-logs/', EmailLogListView.as_view(), name='admin-email-logs'),
    path('security-audit/', SecurityAuditLogListView.as_view(), name='admin-security-audit'),
]
