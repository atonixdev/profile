from django.contrib import admin

from .models import Device, TelemetryRecord, AutomationJob, DeviceToken, DeviceCommand, DeviceCommandLog


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
