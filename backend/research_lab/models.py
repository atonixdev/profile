from django.conf import settings
from django.db import models


class Experiment(models.Model):
    class ExperimentType(models.TextChoices):
        SIMULATION = 'simulation', 'Simulation'
        DATA_PROCESSING = 'data_processing', 'Data Processing'
        MODEL_TRAINING = 'model_training', 'Model Training'

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    experiment_type = models.CharField(max_length=32, choices=ExperimentType.choices)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ExperimentRun(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'

    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='runs')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='experiment_runs',
    )

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    params = models.JSONField(default=dict, blank=True)

    output = models.JSONField(default=dict, blank=True)
    metrics = models.JSONField(default=dict, blank=True)

    error_text = models.TextField(blank=True)
    duration_ms = models.PositiveIntegerField(null=True, blank=True)

    local_sqlite_path = models.CharField(max_length=512, blank=True)

    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.experiment.slug} ({self.status})"
