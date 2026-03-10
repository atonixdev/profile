from django.contrib import admin

from .models import (
    Artifact, Container, Metric, ModelFlow, ModelVersion,
    Pipeline, PipelineRun, PipelineStep, Report,
)


@admin.register(ModelFlow)
class ModelFlowAdmin(admin.ModelAdmin):
    list_display   = ('name', 'slug', 'versioning_strategy', 'owner', 'created_at')
    list_filter    = ('versioning_strategy',)
    search_fields  = ('name', 'slug', 'owner__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(ModelVersion)
class ModelVersionAdmin(admin.ModelAdmin):
    list_display  = ('model_flow', 'version', 'status', 'created_at')
    list_filter   = ('status',)
    search_fields = ('model_flow__name', 'version')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Pipeline)
class PipelineAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'model_flow', 'owner', 'created_at')
    search_fields = ('name', 'slug', 'owner__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(PipelineRun)
class PipelineRunAdmin(admin.ModelAdmin):
    list_display  = ('pipeline', 'run_number', 'status', 'trigger', 'triggered_by', 'started_at')
    list_filter   = ('status', 'trigger')
    search_fields = ('pipeline__name', 'branch', 'commit_sha')
    readonly_fields = ('id', 'created_at')


@admin.register(PipelineStep)
class PipelineStepAdmin(admin.ModelAdmin):
    list_display  = ('name', 'pipeline_run', 'status', 'order', 'started_at')
    list_filter   = ('status',)
    readonly_fields = ('id',)


@admin.register(Container)
class ContainerAdmin(admin.ModelAdmin):
    list_display  = ('id', 'pipeline_run', 'status', 'cpu_usage', 'memory_usage_mb', 'started_at')
    list_filter   = ('status',)


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display  = ('name', 'artifact_type', 'pipeline_run', 'size_bytes', 'created_at')
    list_filter   = ('artifact_type',)
    readonly_fields = ('id', 'created_at')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display  = ('title', 'pipeline_run', 'created_at')
    readonly_fields = ('id', 'created_at')


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display  = ('metric_name', 'value', 'step', 'pipeline_run', 'recorded_at')
    list_filter   = ('metric_name',)
    readonly_fields = ('id', 'recorded_at')
