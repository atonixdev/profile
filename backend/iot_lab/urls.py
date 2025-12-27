from rest_framework.routers import DefaultRouter

from .views import DeviceViewSet, TelemetryRecordViewSet, AutomationJobViewSet, NetworkViewSet

router = DefaultRouter()
router.register(r'devices', DeviceViewSet, basename='iot-lab-devices')
router.register(r'telemetry', TelemetryRecordViewSet, basename='iot-lab-telemetry')
router.register(r'automations', AutomationJobViewSet, basename='iot-lab-automations')
router.register(r'network', NetworkViewSet, basename='iot-lab-network')

urlpatterns = router.urls
