from django.conf import settings
from django.db import models
import uuid


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


class Notebook(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notebooks',
    )

    name = models.CharField(max_length=200, default='Untitled Notebook')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name


class NotebookCell(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='cells')
    position = models.PositiveIntegerField(default=0)

    code = models.TextField(blank=True)

    last_stdout = models.TextField(blank=True)
    last_stderr = models.TextField(blank=True)
    last_exit_code = models.IntegerField(null=True, blank=True)
    last_duration_ms = models.PositiveIntegerField(null=True, blank=True)
    last_executed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']
        indexes = [
            models.Index(fields=['notebook', 'position']),
        ]

    def __str__(self):
        return f"Cell {self.position}"
