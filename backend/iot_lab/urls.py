from rest_framework.routers import DefaultRouter

from django.urls import path

from .agent_views import (
	AgentHeartbeatView,
	AgentTelemetryIngestView,
	AgentNextCommandView,
	AgentCommandStartView,
	AgentCommandLogView,
	AgentCommandFinishView,
)
from .views import (
	DeviceViewSet,
	TelemetryRecordViewSet,
	AutomationJobViewSet,
	NetworkViewSet,
	DeviceTokenViewSet,
	DeviceCommandViewSet,
	AlertViewSet,
	SecurityEventViewSet,
	DeviceLeaseViewSet,
	WorkflowTemplateViewSet,
	AiInsightViewSet,
	FarmSiteViewSet,
	WeatherForecastViewSet,
	IrrigationZoneViewSet,
	IrrigationEventViewSet,
)

router = DefaultRouter()
router.register(r'devices', DeviceViewSet, basename='iot-lab-devices')
router.register(r'telemetry', TelemetryRecordViewSet, basename='iot-lab-telemetry')
router.register(r'automations', AutomationJobViewSet, basename='iot-lab-automations')
router.register(r'network', NetworkViewSet, basename='iot-lab-network')
router.register(r'device-tokens', DeviceTokenViewSet, basename='iot-lab-device-tokens')
router.register(r'commands', DeviceCommandViewSet, basename='iot-lab-commands')
router.register(r'alerts', AlertViewSet, basename='iot-lab-alerts')
router.register(r'security-events', SecurityEventViewSet, basename='iot-lab-security-events')
router.register(r'leases', DeviceLeaseViewSet, basename='iot-lab-leases')
router.register(r'workflow-templates', WorkflowTemplateViewSet, basename='iot-lab-workflow-templates')
router.register(r'ai-insights', AiInsightViewSet, basename='iot-lab-ai-insights')
router.register(r'farm-sites', FarmSiteViewSet, basename='iot-lab-farm-sites')
router.register(r'weather-forecasts', WeatherForecastViewSet, basename='iot-lab-weather-forecasts')
router.register(r'irrigation-zones', IrrigationZoneViewSet, basename='iot-lab-irrigation-zones')
router.register(r'irrigation-events', IrrigationEventViewSet, basename='iot-lab-irrigation-events')

urlpatterns = [
	*router.urls,
	path('agent/heartbeat/', AgentHeartbeatView.as_view(), name='iot-agent-heartbeat'),
	path('agent/telemetry/', AgentTelemetryIngestView.as_view(), name='iot-agent-telemetry'),
	path('agent/next-command/', AgentNextCommandView.as_view(), name='iot-agent-next-command'),
	path('agent/commands/<int:command_id>/start/', AgentCommandStartView.as_view(), name='iot-agent-command-start'),
	path('agent/commands/<int:command_id>/log/', AgentCommandLogView.as_view(), name='iot-agent-command-log'),
	path('agent/commands/<int:command_id>/finish/', AgentCommandFinishView.as_view(), name='iot-agent-command-finish'),
]
