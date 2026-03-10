"""
Model Flow Engine — data models.

Entities
--------
  ModelFlow       — a named ML model with versioning rules
  ModelVersion    — an immutable snapshot of a model, linked to a PipelineRun
  Pipeline        — definition (YAML/JSON) of a pipeline, optionally bound to a ModelFlow
  PipelineRun     — a single execution of a Pipeline
  PipelineStep    — one step within a PipelineRun
  Container       — the container that executed a PipelineStep
  Artifact        — any file produced by a PipelineRun (model, chart, bundle, …)
  Report          — structured JSON report attached to a PipelineRun / ModelVersion
  Metric          — a scalar metric (loss, accuracy, …) recorded during a PipelineRun
"""

import uuid

from django.contrib.auth.models import User
from django.db import models


# ──────────────────────────────────────────────────────────────────────────────
# ModelFlow
# ──────────────────────────────────────────────────────────────────────────────

class ModelFlow(models.Model):
    VERSIONING_AUTO   = 'auto'
    VERSIONING_MANUAL = 'manual'
    VERSIONING_CHOICES = [
        (VERSIONING_AUTO,   'Auto'),
        (VERSIONING_MANUAL, 'Manual'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name                = models.CharField(max_length=255)
    slug                = models.SlugField(max_length=255, unique=True)
    description         = models.TextField(blank=True)
    versioning_strategy = models.CharField(max_length=16, choices=VERSIONING_CHOICES, default=VERSIONING_AUTO)
    owner               = models.ForeignKey(User, on_delete=models.CASCADE, related_name='model_flows')
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
# ModelVersion
# ──────────────────────────────────────────────────────────────────────────────

class ModelVersion(models.Model):
    STATUS_PENDING    = 'pending'
    STATUS_ACTIVE     = 'active'
    STATUS_DEPRECATED = 'deprecated'
    STATUS_ARCHIVED   = 'archived'
    STATUS_CHOICES = [
        (STATUS_PENDING,    'Pending'),
        (STATUS_ACTIVE,     'Active'),
        (STATUS_DEPRECATED, 'Deprecated'),
        (STATUS_ARCHIVED,   'Archived'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_flow   = models.ForeignKey(ModelFlow, on_delete=models.CASCADE, related_name='versions')
    version      = models.CharField(max_length=64)   # e.g. v1.3.0
    status       = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    metrics      = models.JSONField(default=dict, blank=True)
    pipeline_run = models.ForeignKey(
        'PipelineRun', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='model_versions',
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('model_flow', 'version')]

    def __str__(self):
        return f"{self.model_flow.name} {self.version}"


# ──────────────────────────────────────────────────────────────────────────────
# Pipeline
# ──────────────────────────────────────────────────────────────────────────────

class Pipeline(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=255)
    slug        = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    definition  = models.JSONField(default=dict, blank=True)   # parsed YAML definition
    model_flow  = models.ForeignKey(
        ModelFlow, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='pipelines',
    )
    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pipelines')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
# PipelineRun
# ──────────────────────────────────────────────────────────────────────────────

class PipelineRun(models.Model):
    STATUS_PENDING   = 'pending'
    STATUS_RUNNING   = 'running'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED    = 'failed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING,   'Pending'),
        (STATUS_RUNNING,   'Running'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED,    'Failed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    TRIGGER_PUSH     = 'push'
    TRIGGER_MANUAL   = 'manual'
    TRIGGER_SCHEDULE = 'schedule'
    TRIGGER_API      = 'api'
    TRIGGER_CHOICES = [
        (TRIGGER_PUSH,     'Push'),
        (TRIGGER_MANUAL,   'Manual'),
        (TRIGGER_SCHEDULE, 'Schedule'),
        (TRIGGER_API,      'API'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline     = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='runs')
    status       = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    trigger      = models.CharField(max_length=16, choices=TRIGGER_CHOICES, default=TRIGGER_MANUAL)
    triggered_by = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='pipeline_runs',
    )
    branch       = models.CharField(max_length=255, blank=True)
    commit_sha   = models.CharField(max_length=64, blank=True)
    run_number   = models.PositiveIntegerField(default=1)
    started_at   = models.DateTimeField(null=True, blank=True)
    finished_at  = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.pipeline.name} #{self.run_number}"


# ──────────────────────────────────────────────────────────────────────────────
# PipelineStep
# ──────────────────────────────────────────────────────────────────────────────

class PipelineStep(models.Model):
    STATUS_PENDING   = 'pending'
    STATUS_RUNNING   = 'running'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED    = 'failed'
    STATUS_SKIPPED   = 'skipped'
    STATUS_CHOICES = [
        (STATUS_PENDING,   'Pending'),
        (STATUS_RUNNING,   'Running'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED,    'Failed'),
        (STATUS_SKIPPED,   'Skipped'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline_run = models.ForeignKey(PipelineRun, on_delete=models.CASCADE, related_name='steps')
    name         = models.CharField(max_length=255)
    image        = models.CharField(max_length=512, blank=True)
    script       = models.TextField(blank=True)
    status       = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    exit_code    = models.IntegerField(null=True, blank=True)
    order        = models.PositiveIntegerField(default=0)
    started_at   = models.DateTimeField(null=True, blank=True)
    finished_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.pipeline_run} / {self.name}"


# ──────────────────────────────────────────────────────────────────────────────
# Container
# ──────────────────────────────────────────────────────────────────────────────

class Container(models.Model):
    STATUS_PENDING    = 'pending'
    STATUS_RUNNING    = 'running'
    STATUS_COMPLETED  = 'completed'
    STATUS_FAILED     = 'failed'
    STATUS_TERMINATED = 'terminated'
    STATUS_CHOICES = [
        (STATUS_PENDING,    'Pending'),
        (STATUS_RUNNING,    'Running'),
        (STATUS_COMPLETED,  'Completed'),
        (STATUS_FAILED,     'Failed'),
        (STATUS_TERMINATED, 'Terminated'),
    ]

    # Docker/container runtime ID as primary key
    id               = models.CharField(max_length=128, primary_key=True)
    pipeline_step    = models.OneToOneField(
        PipelineStep, on_delete=models.CASCADE,
        related_name='container', null=True, blank=True,
    )
    pipeline_run     = models.ForeignKey(PipelineRun, on_delete=models.CASCADE, related_name='containers')
    model_flow_id    = models.CharField(max_length=255, blank=True)
    image            = models.CharField(max_length=512, blank=True)
    status           = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    cpu_usage        = models.FloatField(default=0.0)        # percentage 0–100
    memory_usage_mb  = models.IntegerField(default=0)
    memory_limit_mb  = models.IntegerField(default=512)
    started_at       = models.DateTimeField(null=True, blank=True)
    finished_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return self.id


# ──────────────────────────────────────────────────────────────────────────────
# Artifact
# ──────────────────────────────────────────────────────────────────────────────

class Artifact(models.Model):
    TYPE_MODEL   = 'model'
    TYPE_LOG     = 'log'
    TYPE_CHART   = 'chart'
    TYPE_REPORT  = 'report'
    TYPE_FEATURE = 'feature_set'
    TYPE_BUNDLE  = 'deployment_bundle'
    TYPE_OTHER   = 'other'
    TYPE_CHOICES = [
        (TYPE_MODEL,   'Model'),
        (TYPE_LOG,     'Log'),
        (TYPE_CHART,   'Chart'),
        (TYPE_REPORT,  'Report'),
        (TYPE_FEATURE, 'Feature Set'),
        (TYPE_BUNDLE,  'Deployment Bundle'),
        (TYPE_OTHER,   'Other'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline_run  = models.ForeignKey(PipelineRun, on_delete=models.CASCADE, related_name='artifacts')
    model_version = models.ForeignKey(
        ModelVersion, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='artifacts',
    )
    name          = models.CharField(max_length=255)
    artifact_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default=TYPE_OTHER)
    file          = models.FileField(upload_to='artifacts/%Y/%m/', null=True, blank=True)
    size_bytes    = models.BigIntegerField(default=0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
# Report
# ──────────────────────────────────────────────────────────────────────────────

class Report(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline_run  = models.ForeignKey(PipelineRun, on_delete=models.CASCADE, related_name='reports')
    model_version = models.ForeignKey(
        ModelVersion, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reports',
    )
    title      = models.CharField(max_length=255)
    data       = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ──────────────────────────────────────────────────────────────────────────────
# Metric
# ──────────────────────────────────────────────────────────────────────────────

class Metric(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline_run  = models.ForeignKey(PipelineRun, on_delete=models.CASCADE, related_name='metrics')
    model_version = models.ForeignKey(
        ModelVersion, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='run_metrics',
    )
    metric_name = models.CharField(max_length=255, db_index=True)  # e.g. accuracy, loss
    value       = models.FloatField()
    step        = models.IntegerField(default=0)                    # epoch / batch number
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['step']

    def __str__(self):
        return f"{self.metric_name}={self.value} @ step {self.step}"
