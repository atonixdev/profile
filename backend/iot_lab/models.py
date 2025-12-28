from django.conf import settings
from django.db import models


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

    class Meta:
        ordering = ['-timestamp', '-id']


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
