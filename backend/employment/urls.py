from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobPostingViewSet, ApplicationViewSet, InterviewViewSet,
    EvaluationViewSet, EmployeeViewSet,
    NotificationListView, SendNotificationView, AuditLogView,
    ApplicationDataExportView, ApplicationAnonymizeView,
    EmploymentMetricsView, AuditLogExportView,
)

router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='job-posting')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('', include(router.urls)),
    # Notifications
    path('notifications/', NotificationListView.as_view()),
    path('notifications/send/', SendNotificationView.as_view()),
    # Audit log (paginated JSON)
    path('audit/', AuditLogView.as_view()),
    # §4.4C — Audit log CSV export
    path('audit/export/', AuditLogExportView.as_view()),
    # §4.4A — GDPR/CCPA compliance
    path('applications/<uuid:pk>/export_data/', ApplicationDataExportView.as_view()),
    path('applications/<uuid:pk>/anonymize/', ApplicationAnonymizeView.as_view()),
    # §4.5 — Pipeline metrics
    path('metrics/', EmploymentMetricsView.as_view()),
]
