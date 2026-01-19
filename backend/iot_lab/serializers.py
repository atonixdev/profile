from rest_framework import serializers
import json

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


class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ['id', 'device', 'label', 'revoked', 'last_used_at', 'created_by', 'created_at']
        read_only_fields = ['revoked', 'last_used_at', 'created_by', 'created_at']


class DeviceCommandSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = DeviceCommand
        fields = [
            'id',
            'device',
            'device_name',
            'kind',
            'payload',
            'status',
            'queued_at',
            'delivered_at',
            'started_at',
            'finished_at',
            'exit_code',
            'stdout',
            'stderr',
            'error',
            'requested_by',
        ]
        read_only_fields = [
            'device_name',
            'status',
            'queued_at',
            'delivered_at',
            'started_at',
            'finished_at',
            'exit_code',
            'stdout',
            'stderr',
            'error',
            'requested_by',
        ]


class DeviceCommandCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceCommand
        fields = ['id', 'device', 'kind', 'payload', 'status', 'queued_at']
        read_only_fields = ['id', 'status', 'queued_at']

    def validate(self, attrs):
        kind = attrs.get('kind')
        payload = attrs.get('payload')

        # Ensure payload is a JSON object.
        if payload is None:
            payload = {}
            attrs['payload'] = payload
        if not isinstance(payload, dict):
            raise serializers.ValidationError({'payload': 'payload must be an object'})

        # Prevent unexpectedly large payloads.
        try:
            size = len(json.dumps(payload, separators=(',', ':'), ensure_ascii=False))
        except Exception:
            raise serializers.ValidationError({'payload': 'payload must be JSON-serializable'})

        if size > 20000:
            raise serializers.ValidationError({'payload': 'payload too large'})

        # Basic allowlist (defense-in-depth; model/choices also constrain this).
        allowed = {c[0] for c in DeviceCommand.Kind.choices}
        if kind not in allowed:
            raise serializers.ValidationError({'kind': 'unsupported command kind'})

        return attrs


class DeviceCommandLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceCommandLog
        fields = ['id', 'command', 'stream', 'message', 'ts']
        read_only_fields = ['id', 'ts']


class AlertSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id',
            'device',
            'device_name',
            'title',
            'message',
            'severity',
            'category',
            'metadata',
            'created_by',
            'created_at',
            'resolved_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'device_name']


class SecurityEventSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = SecurityEvent
        fields = [
            'id',
            'device',
            'device_name',
            'event_type',
            'message',
            'metadata',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'device_name']


class DeviceLeaseSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = DeviceLease
        fields = [
            'id',
            'device',
            'device_name',
            'user',
            'username',
            'started_at',
            'expires_at',
            'ended_at',
            'metadata',
        ]
        read_only_fields = ['user', 'started_at', 'ended_at', 'device_name', 'username']


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = WorkflowTemplate
        fields = ['id', 'name', 'description', 'steps', 'device', 'device_name', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'device_name']

    def validate_steps(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('steps must be a list')
        if len(value) > 100:
            raise serializers.ValidationError('too many steps')
        for step in value:
            if not isinstance(step, dict):
                raise serializers.ValidationError('each step must be an object')
            kind = step.get('kind')
            payload = step.get('payload', {})
            if kind is None or not str(kind).strip():
                raise serializers.ValidationError('each step requires kind')
            if payload is not None and not isinstance(payload, dict):
                raise serializers.ValidationError('step payload must be an object')
        return value


class AiInsightSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = AiInsight
        fields = ['id', 'device', 'device_name', 'kind', 'payload', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at', 'device_name']


class FarmSiteSerializer(serializers.ModelSerializer):
    default_device_name = serializers.CharField(source='default_device.name', read_only=True)

    class Meta:
        model = FarmSite
        fields = [
            'id',
            'name',
            'latitude',
            'longitude',
            'timezone',
            'metadata',
            'default_device',
            'default_device_name',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'default_device_name']


class WeatherForecastSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)

    class Meta:
        model = WeatherForecast
        fields = ['id', 'site', 'site_name', 'provider', 'fetched_at', 'forecast_time', 'metrics']
        read_only_fields = ['site_name']


class WeatherForecastWithRawSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)

    class Meta:
        model = WeatherForecast
        fields = ['id', 'site', 'site_name', 'provider', 'fetched_at', 'forecast_time', 'metrics', 'raw']
        read_only_fields = ['site_name']


class IrrigationZoneSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)
    field_name = serializers.CharField(source='field.name', read_only=True)
    node_name = serializers.CharField(source='node.name', read_only=True)

    class Meta:
        model = IrrigationZone
        fields = [
            'id',
            'site',
            'site_name',
            'field',
            'field_name',
            'node',
            'node_name',
            'name',
            'description',
            'is_active',
            'device',
            'device_name',
            'actuator_kind',
            'actuator_config',
            'hardware_mapping',
            'crop_type',
            'root_depth_cm',
            'soil_moisture_metric',
            'target_moisture_min',
            'target_moisture_max',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['site_name', 'device_name', 'field_name', 'node_name', 'created_by', 'created_at', 'updated_at']

    def validate_actuator_config(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('actuator_config must be an object')
        # Keep validation lightweight; actual enforcement happens server-side when enqueuing.
        return value


class IrrigationEventSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    site_id = serializers.IntegerField(source='zone.site_id', read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)
    command_kind = serializers.CharField(source='command.kind', read_only=True)

    class Meta:
        model = IrrigationEvent
        fields = [
            'id',
            'zone',
            'zone_name',
            'site_id',
            'device',
            'device_name',
            'command',
            'command_kind',
            'status',
            'requested_by',
            'requested_at',
            'started_at',
            'ended_at',
            'planned_duration_seconds',
            'liters_used',
            'metadata',
        ]


class AgriFieldSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)

    class Meta:
        model = AgriField
        fields = ['id', 'site', 'site_name', 'name', 'area_hectares', 'metadata', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['site_name', 'created_by', 'created_at', 'updated_at']


class AgriNodeSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source='field.name', read_only=True)
    site_id = serializers.IntegerField(source='field.site_id', read_only=True)
    site_name = serializers.CharField(source='field.site.name', read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = AgriNode
        fields = [
            'id',
            'field',
            'field_name',
            'site_id',
            'site_name',
            'device',
            'device_name',
            'hardware_id',
            'name',
            'connectivity',
            'capabilities',
            'metadata',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['field_name', 'site_id', 'site_name', 'device_name', 'created_by', 'created_at', 'updated_at']


class AgriSensorSerializer(serializers.ModelSerializer):
    node_name = serializers.CharField(source='node.name', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = AgriSensor
        fields = ['id', 'node', 'node_name', 'zone', 'zone_name', 'kind', 'name', 'config', 'metadata', 'created_by', 'created_at']
        read_only_fields = ['node_name', 'zone_name', 'created_by', 'created_at']


class IrrigationRuleSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    site_id = serializers.IntegerField(source='zone.site_id', read_only=True)

    class Meta:
        model = IrrigationRule
        fields = [
            'id',
            'zone',
            'zone_name',
            'site_id',
            'name',
            'enabled',
            'conditions',
            'actions',
            'last_evaluated_at',
            'last_decision',
            'last_decision_reason',
            'metadata',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['zone_name', 'site_id', 'last_evaluated_at', 'last_decision', 'last_decision_reason', 'created_by', 'created_at', 'updated_at']

    def validate_conditions(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('conditions must be an object')
        return value

    def validate_actions(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('actions must be an object')
        return value
        read_only_fields = [
            'zone_name',
            'site_id',
            'device',
            'device_name',
            'command',
            'command_kind',
            'status',
            'requested_by',
            'requested_at',
            'started_at',
            'ended_at',
        ]
