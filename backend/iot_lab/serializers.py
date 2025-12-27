from rest_framework import serializers

from .models import Device, TelemetryRecord, AutomationJob


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            'id',
            'name',
            'device_type',
            'location',
            'status',
            'last_seen_at',
            'metadata',
            'is_active',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class TelemetryRecordSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = TelemetryRecord
        fields = [
            'id',
            'device',
            'device_name',
            'timestamp',
            'metrics',
            'raw_text',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'device_name']


class AutomationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationJob
        fields = [
            'id',
            'name',
            'description',
            'trigger',
            'action',
            'is_active',
            'last_run_at',
            'last_run_status',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'last_run_at', 'last_run_status']
