from rest_framework import serializers

from .models import (
    Artifact, Container, Metric, ModelFlow, ModelVersion,
    Pipeline, PipelineRun, PipelineStep, Report,
)


class ModelFlowSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    version_count  = serializers.SerializerMethodField()

    class Meta:
        model  = ModelFlow
        fields = [
            'id', 'name', 'slug', 'description', 'versioning_strategy',
            'owner', 'owner_username', 'version_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def get_version_count(self, obj):
        return obj.versions.count()


class ModelVersionSerializer(serializers.ModelSerializer):
    model_flow_name    = serializers.ReadOnlyField(source='model_flow.name')
    pipeline_run_id    = serializers.ReadOnlyField(source='pipeline_run.id')

    class Meta:
        model  = ModelVersion
        fields = [
            'id', 'model_flow', 'model_flow_name', 'version', 'status',
            'metrics', 'pipeline_run', 'pipeline_run_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PipelineSerializer(serializers.ModelSerializer):
    owner_username   = serializers.ReadOnlyField(source='owner.username')
    model_flow_name  = serializers.ReadOnlyField(source='model_flow.name')
    run_count        = serializers.SerializerMethodField()
    last_run_status  = serializers.SerializerMethodField()

    class Meta:
        model  = Pipeline
        fields = [
            'id', 'name', 'slug', 'description', 'definition',
            'model_flow', 'model_flow_name',
            'owner', 'owner_username',
            'run_count', 'last_run_status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def get_run_count(self, obj):
        return obj.runs.count()

    def get_last_run_status(self, obj):
        run = obj.runs.first()
        return run.status if run else None


class PipelineStepSerializer(serializers.ModelSerializer):
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model  = PipelineStep
        fields = [
            'id', 'pipeline_run', 'name', 'image', 'script',
            'status', 'exit_code', 'order',
            'started_at', 'finished_at', 'duration_seconds',
        ]
        read_only_fields = ['id']

    def get_duration_seconds(self, obj):
        if obj.started_at and obj.finished_at:
            return int((obj.finished_at - obj.started_at).total_seconds())
        return None


class ContainerSerializer(serializers.ModelSerializer):
    memory_percent = serializers.SerializerMethodField()

    class Meta:
        model  = Container
        fields = [
            'id', 'pipeline_step', 'pipeline_run', 'model_flow_id',
            'image', 'status', 'cpu_usage',
            'memory_usage_mb', 'memory_limit_mb', 'memory_percent',
            'started_at', 'finished_at',
        ]

    def get_memory_percent(self, obj):
        if obj.memory_limit_mb and obj.memory_limit_mb > 0:
            return round((obj.memory_usage_mb / obj.memory_limit_mb) * 100, 1)
        return 0.0


class ArtifactSerializer(serializers.ModelSerializer):
    file_url       = serializers.SerializerMethodField()
    size_human     = serializers.SerializerMethodField()

    class Meta:
        model  = Artifact
        fields = [
            'id', 'pipeline_run', 'model_version', 'name',
            'artifact_type', 'file', 'file_url', 'size_bytes', 'size_human',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_size_human(self, obj):
        b = obj.size_bytes
        for unit in ['B', 'KB', 'MB', 'GB']:
            if b < 1024:
                return f"{b:.1f} {unit}"
            b /= 1024
        return f"{b:.1f} TB"


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Report
        fields = ['id', 'pipeline_run', 'model_version', 'title', 'data', 'created_at']
        read_only_fields = ['id', 'created_at']


class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Metric
        fields = ['id', 'pipeline_run', 'model_version', 'metric_name', 'value', 'step', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


# ── Nested run serializer for list views ──────────────────────────────────────

class PipelineRunSerializer(serializers.ModelSerializer):
    pipeline_name     = serializers.ReadOnlyField(source='pipeline.name')
    triggered_by_name = serializers.ReadOnlyField(source='triggered_by.username')
    duration_seconds  = serializers.SerializerMethodField()
    steps             = PipelineStepSerializer(many=True, read_only=True)
    artifact_count    = serializers.SerializerMethodField()
    metric_count      = serializers.SerializerMethodField()

    class Meta:
        model  = PipelineRun
        fields = [
            'id', 'pipeline', 'pipeline_name', 'status', 'trigger',
            'triggered_by', 'triggered_by_name',
            'branch', 'commit_sha', 'run_number',
            'started_at', 'finished_at', 'duration_seconds', 'created_at',
            'steps', 'artifact_count', 'metric_count',
        ]
        read_only_fields = ['id', 'created_at']

    def get_duration_seconds(self, obj):
        if obj.started_at and obj.finished_at:
            return int((obj.finished_at - obj.started_at).total_seconds())
        return None

    def get_artifact_count(self, obj):
        return obj.artifacts.count()

    def get_metric_count(self, obj):
        return obj.metrics.count()