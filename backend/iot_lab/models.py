from django.conf import settings
from django.db import models
from django.utils import timezone


class DeviceToken(models.Model):
    """Opaque device token used by edge agents (Pi/Arduino gateway) to authenticate."""

    device = models.ForeignKey('Device', on_delete=models.CASCADE, related_name='tokens')
    label = models.CharField(max_length=200, blank=True, default='')
    token_hash = models.CharField(max_length=255)
    revoked = models.BooleanField(default=False)
    last_used_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_device_tokens'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.device_id}:{self.label or 'token'}"


class DeviceCommand(models.Model):
    class Kind(models.TextChoices):
        RUN_PYTHON = 'run_python', 'Run Python'
        GPIO_WRITE = 'gpio_write', 'GPIO Write'
        ARDUINO_SERIAL = 'arduino_serial', 'Arduino Serial'
        REBOOT = 'reboot', 'Reboot'

    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        DELIVERED = 'delivered', 'Delivered'
        RUNNING = 'running', 'Running'
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'
        CANCELED = 'canceled', 'Canceled'

    device = models.ForeignKey('Device', on_delete=models.CASCADE, related_name='commands')
    kind = models.CharField(max_length=40, choices=Kind.choices, default=Kind.RUN_PYTHON)
    payload = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    queued_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    exit_code = models.IntegerField(null=True, blank=True)
    stdout = models.TextField(blank=True, default='')
    stderr = models.TextField(blank=True, default='')
    error = models.TextField(blank=True, default='')

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_device_commands'
    )

    class Meta:
        ordering = ['-queued_at', '-id']

    def __str__(self):
        return f"{self.device_id}:{self.kind}:{self.status}"


class DeviceCommandLog(models.Model):
    class Stream(models.TextChoices):
        LOG = 'log', 'Log'
        STDOUT = 'stdout', 'Stdout'
        STDERR = 'stderr', 'Stderr'

    command = models.ForeignKey(DeviceCommand, on_delete=models.CASCADE, related_name='logs')
    stream = models.CharField(max_length=10, choices=Stream.choices, default=Stream.LOG)
    message = models.TextField()
    ts = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.command_id}:{self.stream}"


class Device(models.Model):
    class Status(models.TextChoices):
        ONLINE = 'online', 'Online'
        OFFLINE = 'offline', 'Offline'
        MAINTENANCE = 'maintenance', 'Maintenance'
        UNKNOWN = 'unknown', 'Unknown'

    name = models.CharField(max_length=200)
    device_type = models.CharField(max_length=120, blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNKNOWN)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_devices'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class TelemetryRecord(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='telemetry')
    timestamp = models.DateTimeField()
    metrics = models.JSONField(default=dict, blank=True)
    raw_text = models.TextField(blank=True, default='')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_telemetry'
    )
    created_at = models.DateTimeField(auto_now_add=True)


class DeviceLease(models.Model):
    """Temporary device reservation/assignment to a user ("session")."""

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='leases')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='iot_device_leases')

    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-started_at', '-id']
        indexes = [
            models.Index(fields=['device', 'ended_at', 'expires_at']),
            models.Index(fields=['user', 'ended_at', 'expires_at']),
        ]

    def __str__(self):
        state = 'active' if not self.ended_at else 'ended'
        return f"lease:{self.device_id}:{self.user_id}:{state}"


class WorkflowTemplate(models.Model):
    """User-facing workflow template (experiment automation)."""

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')

    # steps: [{kind: 'gpio_write', payload: {...}}, ...]
    steps = models.JSONField(default=list, blank=True)

    # Optional default device.
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name='workflow_templates')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_workflow_templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']

    def __str__(self):
        return self.name


class AiInsight(models.Model):
    """Lightweight AI/heuristic insight record for a device."""

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='ai_insights')
    kind = models.CharField(max_length=80)
    payload = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_ai_insights'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.device_id}:{self.kind}"


class AutomationJob(models.Model):
    class LastRunStatus(models.TextChoices):
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'
        SKIPPED = 'skipped', 'Skipped'
        RUNNING = 'running', 'Running'

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    trigger = models.JSONField(default=dict, blank=True)
    action = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    last_run_status = models.CharField(max_length=20, choices=LastRunStatus.choices, blank=True, default='')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_automations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Alert(models.Model):
    class Severity(models.TextChoices):
        INFO = 'info', 'Info'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'

    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name='alerts')
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True, default='')
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    category = models.CharField(max_length=60, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_alerts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.severity}:{self.title}"


class SecurityEvent(models.Model):
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name='security_events')
    event_type = models.CharField(max_length=80)
    message = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='iot_security_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return self.event_type


class FarmSite(models.Model):
    """A farm/location where agriculture IoT is deployed."""

    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timezone = models.CharField(max_length=80, blank=True, default='UTC')
    metadata = models.JSONField(default=dict, blank=True)

    default_device = models.ForeignKey(
        Device,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='farm_sites_default_for',
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='farm_sites'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']

    def __str__(self):
        return self.name


class WeatherForecast(models.Model):
    """Hourly forecast rows for a farm site."""

    site = models.ForeignKey(FarmSite, on_delete=models.CASCADE, related_name='forecasts')
    provider = models.CharField(max_length=60, default='open_meteo')
    fetched_at = models.DateTimeField(default=timezone.now)

    forecast_time = models.DateTimeField()
    metrics = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-forecast_time', '-id']
        indexes = [
            models.Index(fields=['site', 'forecast_time']),
            models.Index(fields=['site', 'provider', 'forecast_time']),
        ]

    def __str__(self):
        return f"{self.site_id}:{self.provider}:{self.forecast_time.isoformat() if self.forecast_time else ''}"


class IrrigationZone(models.Model):
    """A logical irrigation zone (valve/line)."""

    class ActuatorKind(models.TextChoices):
        GPIO_WRITE = 'gpio_write', 'GPIO Relay'
        ARDUINO_SERIAL = 'arduino_serial', 'Arduino Serial'

    site = models.ForeignKey(FarmSite, on_delete=models.CASCADE, related_name='irrigation_zones')
    # v1 agriculture hierarchy: site (farm) -> fields -> zones
    field = models.ForeignKey('AgriField', null=True, blank=True, on_delete=models.SET_NULL, related_name='zones')
    node = models.ForeignKey('AgriNode', null=True, blank=True, on_delete=models.SET_NULL, related_name='zones')

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    # Where to send the command.
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_zones')

    actuator_kind = models.CharField(max_length=40, choices=ActuatorKind.choices, default=ActuatorKind.GPIO_WRITE)
    actuator_config = models.JSONField(default=dict, blank=True)

    # Hardware mapping and agronomy metadata (stored as JSON for flexible v1)
    hardware_mapping = models.JSONField(default=dict, blank=True)
    crop_type = models.CharField(max_length=80, blank=True, default='')
    root_depth_cm = models.IntegerField(null=True, blank=True)

    # Telemetry metric key to interpret as soil moisture (e.g. "soil_moisture").
    soil_moisture_metric = models.CharField(max_length=80, blank=True, default='soil_moisture')

    # Optional guidance thresholds (interpreted by UI/automation logic)
    target_moisture_min = models.FloatField(null=True, blank=True)
    target_moisture_max = models.FloatField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_zones'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']
        indexes = [models.Index(fields=['site', 'is_active'])]

    def __str__(self):
        return f"{self.site_id}:{self.name}"


class AgriField(models.Model):
    """A physical field within a farm site."""

    site = models.ForeignKey(FarmSite, on_delete=models.CASCADE, related_name='fields')
    name = models.CharField(max_length=200)
    area_hectares = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='agri_fields'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']
        indexes = [models.Index(fields=['site', 'updated_at'])]

    def __str__(self):
        return f"{self.site_id}:{self.name}"


class AgriNode(models.Model):
    """Field controller (Pi/ESP32) mapped to a lab Device + token auth."""

    class Connectivity(models.TextChoices):
        WIFI = 'wifi', 'Wi‑Fi'
        CELLULAR_4G = '4g', '4G/LTE'
        LORAWAN = 'lorawan', 'LoRaWAN'
        ETHERNET = 'ethernet', 'Ethernet'
        OTHER = 'other', 'Other'

    field = models.ForeignKey(AgriField, on_delete=models.CASCADE, related_name='nodes')
    device = models.OneToOneField(Device, on_delete=models.CASCADE, related_name='agri_node')

    hardware_id = models.CharField(max_length=200, blank=True, default='')
    name = models.CharField(max_length=200)
    connectivity = models.CharField(max_length=30, choices=Connectivity.choices, default=Connectivity.WIFI)
    capabilities = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='agri_nodes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']
        indexes = [
            models.Index(fields=['field', 'updated_at']),
            models.Index(fields=['hardware_id']),
        ]

    def __str__(self):
        return self.name


class AgriSensor(models.Model):
    """A physical sensor attached to a node and optionally tied to a zone."""

    class Kind(models.TextChoices):
        SOIL_MOISTURE = 'soil_moisture', 'Soil Moisture'
        SOIL_TEMP = 'soil_temp', 'Soil Temperature'
        AIR_TEMP_HUMIDITY = 'air_temp_humidity', 'Air Temp/Humidity'
        RAIN = 'rain', 'Rain Sensor/Gauge'
        FLOW_METER = 'flow_meter', 'Water Flow Meter'
        TANK_LEVEL = 'tank_level', 'Tank Level'

    node = models.ForeignKey(AgriNode, on_delete=models.CASCADE, related_name='sensors')
    zone = models.ForeignKey(IrrigationZone, null=True, blank=True, on_delete=models.SET_NULL, related_name='sensors')
    kind = models.CharField(max_length=40, choices=Kind.choices)
    name = models.CharField(max_length=200, blank=True, default='')
    config = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='agri_sensors'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']
        indexes = [
            models.Index(fields=['node', 'kind']),
            models.Index(fields=['zone', 'kind']),
        ]

    def __str__(self):
        return f"{self.node_id}:{self.kind}:{self.name or 'sensor'}"


class IrrigationRule(models.Model):
    """IF/AND/THEN irrigation rules per zone (v1)."""

    zone = models.ForeignKey(IrrigationZone, on_delete=models.CASCADE, related_name='rules')
    name = models.CharField(max_length=200)
    enabled = models.BooleanField(default=True)

    # conditions/actions stored as JSON to match the spec.
    conditions = models.JSONField(default=dict, blank=True)
    actions = models.JSONField(default=dict, blank=True)

    last_evaluated_at = models.DateTimeField(null=True, blank=True)
    last_decision = models.CharField(max_length=40, blank=True, default='')  # irrigated/skipped/error
    last_decision_reason = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_rules'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']
        indexes = [
            models.Index(fields=['zone', 'enabled']),
            models.Index(fields=['enabled', 'updated_at']),
        ]

    def __str__(self):
        return f"{self.zone_id}:{self.name}"


class IrrigationEvent(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        RUNNING = 'running', 'Running'
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'
        CANCELED = 'canceled', 'Canceled'

    zone = models.ForeignKey(IrrigationZone, on_delete=models.CASCADE, related_name='events')
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_events')
    command = models.ForeignKey(DeviceCommand, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_events')

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='irrigation_events'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    planned_duration_seconds = models.IntegerField(null=True, blank=True)
    liters_used = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-requested_at', '-id']
        indexes = [
            models.Index(fields=['zone', 'requested_at']),
            models.Index(fields=['device', 'requested_at']),
            models.Index(fields=['status', 'requested_at']),
        ]

    def __str__(self):
        return f"irrigation:{self.zone_id}:{self.status}"
