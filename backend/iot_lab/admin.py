from django.contrib import admin

from .models import Device, TelemetryRecord, AutomationJob


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
