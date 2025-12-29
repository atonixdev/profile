from django.contrib import admin

from .models import (
    Device,
    TelemetryRecord,
    AutomationJob,
    DeviceToken,
    DeviceCommand,
    DeviceCommandLog,
    Alert,
    SecurityEvent,
    DeviceLease,
    WorkflowTemplate,
    AiInsight,
    FarmSite,
    WeatherForecast,
    IrrigationZone,
    IrrigationEvent,
    AgriField,
    AgriNode,
    AgriSensor,
    IrrigationRule,
)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'device_type', 'status', 'last_seen_at', 'is_active', 'created_at')
    search_fields = ('name', 'device_type', 'location')
    list_filter = ('status', 'is_active')


@admin.register(TelemetryRecord)
class TelemetryRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'timestamp', 'created_at')
    list_filter = ('device',)


@admin.register(AutomationJob)
class AutomationJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active', 'last_run_at', 'last_run_status', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active', 'last_run_status')


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'label', 'revoked', 'last_used_at', 'created_at')
    list_filter = ('revoked', 'created_at')
    search_fields = ('device__name', 'label')
    readonly_fields = ('token_hash', 'created_at', 'last_used_at')


@admin.register(DeviceCommand)
class DeviceCommandAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'kind', 'status', 'queued_at', 'delivered_at', 'started_at', 'finished_at')
    list_filter = ('kind', 'status', 'queued_at')
    search_fields = ('device__name', 'kind', 'status')
    readonly_fields = ('queued_at', 'delivered_at', 'started_at', 'finished_at')


@admin.register(DeviceCommandLog)
class DeviceCommandLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'command', 'stream', 'ts')
    list_filter = ('stream',)
    search_fields = ('command__device__name', 'message')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'severity', 'category', 'title', 'device', 'created_at', 'resolved_at')
    list_filter = ('severity', 'category')
    search_fields = ('title', 'message', 'device__name')


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type', 'device', 'created_at')
    list_filter = ('event_type',)
    search_fields = ('event_type', 'message', 'device__name')


@admin.register(DeviceLease)
class DeviceLeaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'user', 'started_at', 'expires_at', 'ended_at')
    list_filter = ('ended_at',)
    search_fields = ('device__name', 'user__username')


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'device', 'created_by', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('created_at',)


@admin.register(AiInsight)
class AiInsightAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'kind', 'created_at')
    list_filter = ('kind',)
    search_fields = ('device__name', 'kind')


@admin.register(FarmSite)
class FarmSiteAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'latitude', 'longitude', 'timezone', 'default_device', 'updated_at')
    search_fields = ('name',)


@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ('id', 'site', 'provider', 'forecast_time', 'fetched_at')
    list_filter = ('provider', 'site')
    search_fields = ('site__name',)


@admin.register(IrrigationZone)
class IrrigationZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'site', 'field', 'node', 'name', 'device', 'actuator_kind', 'is_active', 'updated_at')
    list_filter = ('site', 'actuator_kind', 'is_active')
    search_fields = ('name', 'site__name', 'device__name', 'field__name', 'node__name')


@admin.register(IrrigationEvent)
class IrrigationEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'device', 'status', 'planned_duration_seconds', 'requested_at', 'started_at', 'ended_at')
    list_filter = ('status', 'zone__site')
    search_fields = ('zone__name', 'device__name')


@admin.register(AgriField)
class AgriFieldAdmin(admin.ModelAdmin):
    list_display = ('id', 'site', 'name', 'area_hectares', 'updated_at')
    list_filter = ('site',)
    search_fields = ('name', 'site__name')


@admin.register(AgriNode)
class AgriNodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'field', 'name', 'device', 'connectivity', 'hardware_id', 'updated_at')
    list_filter = ('connectivity', 'field__site')
    search_fields = ('name', 'hardware_id', 'device__name', 'field__name')


@admin.register(AgriSensor)
class AgriSensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'node', 'zone', 'kind', 'name', 'created_at')
    list_filter = ('kind', 'node__field__site')
    search_fields = ('name', 'node__name', 'zone__name')


@admin.register(IrrigationRule)
class IrrigationRuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'name', 'enabled', 'last_evaluated_at', 'last_decision', 'updated_at')
    list_filter = ('enabled', 'zone__site')
    search_fields = ('name', 'zone__name')
