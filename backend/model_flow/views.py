import logging

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Artifact, Container, Metric, ModelFlow, ModelVersion,
    Pipeline, PipelineRun, PipelineStep, Report,
)
from .serializers import (
    ArtifactSerializer, ContainerSerializer, MetricSerializer,
    ModelFlowSerializer, ModelVersionSerializer,
    PipelineRunSerializer, PipelineSerializer, PipelineStepSerializer,
    ReportSerializer,
)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# ModelFlow
# ──────────────────────────────────────────────────────────────────────────────

class ModelFlowViewSet(viewsets.ModelViewSet):
    """CRUD for model flows owned by the authenticated user."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ModelFlowSerializer

    def get_queryset(self):
        return ModelFlow.objects.filter(owner=self.request.user).select_related('owner')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # /api/v1/model-flows/{id}/versions/
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        flow = self.get_object()
        qs   = flow.versions.all()
        serializer = ModelVersionSerializer(qs, many=True)
        return Response(serializer.data)

    # /api/v1/model-flows/{id}/pipelines/
    @action(detail=True, methods=['get'])
    def pipelines(self, request, pk=None):
        flow = self.get_object()
        qs   = flow.pipelines.all()
        serializer = PipelineSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


# ──────────────────────────────────────────────────────────────────────────────
# ModelVersion
# ──────────────────────────────────────────────────────────────────────────────

class ModelVersionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ModelVersionSerializer
    http_method_names  = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        return ModelVersion.objects.filter(
            model_flow__owner=self.request.user
        ).select_related('model_flow', 'pipeline_run')

    # /api/v1/model-versions/{id}/activate/
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        version = self.get_object()
        version.status = ModelVersion.STATUS_ACTIVE
        version.save(update_fields=['status', 'updated_at'])
        return Response(ModelVersionSerializer(version).data)

    # /api/v1/model-versions/{id}/deprecate/
    @action(detail=True, methods=['post'])
    def deprecate(self, request, pk=None):
        version = self.get_object()
        version.status = ModelVersion.STATUS_DEPRECATED
        version.save(update_fields=['status', 'updated_at'])
        return Response(ModelVersionSerializer(version).data)


# ──────────────────────────────────────────────────────────────────────────────
# Pipeline
# ──────────────────────────────────────────────────────────────────────────────

class PipelineViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = PipelineSerializer

    def get_queryset(self):
        return Pipeline.objects.filter(owner=self.request.user).select_related('owner', 'model_flow')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # /api/v1/pipelines/{id}/run/ — trigger a new pipeline run
    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        pipeline = self.get_object()
        last_run = pipeline.runs.first()
        run_number = (last_run.run_number + 1) if last_run else 1

        run = PipelineRun.objects.create(
            pipeline     = pipeline,
            status       = PipelineRun.STATUS_PENDING,
            trigger      = request.data.get('trigger', PipelineRun.TRIGGER_MANUAL),
            triggered_by = request.user,
            branch       = request.data.get('branch', 'main'),
            commit_sha   = request.data.get('commit_sha', ''),
            run_number   = run_number,
            started_at   = timezone.now(),
        )
        logger.info("Pipeline run #%s triggered for pipeline %s by %s", run_number, pipeline.slug, request.user.username)
        return Response(PipelineRunSerializer(run).data, status=status.HTTP_201_CREATED)

    # /api/v1/pipelines/{id}/runs/
    @action(detail=True, methods=['get'])
    def runs(self, request, pk=None):
        pipeline = self.get_object()
        qs = pipeline.runs.prefetch_related('steps').all()
        serializer = PipelineRunSerializer(qs, many=True)
        return Response(serializer.data)

    # /api/v1/pipelines/{id}/graph/
    @action(detail=True, methods=['get'])
    def graph(self, request, pk=None):
        """
        Return the step graph derived from the pipeline definition.
        Shape: { steps: [{name, image, depends_on: []}] }
        """
        pipeline = self.get_object()
        definition = pipeline.definition or {}
        steps = definition.get('steps', [])
        graph = [
            {
                'name':       s.get('name', ''),
                'image':      s.get('image', ''),
                'script':     s.get('script', ''),
                'depends_on': s.get('depends_on', []),
            }
            for s in steps
        ]
        return Response({'pipeline': pipeline.name, 'steps': graph})


# ──────────────────────────────────────────────────────────────────────────────
# PipelineRun
# ──────────────────────────────────────────────────────────────────────────────

class PipelineRunViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = PipelineRunSerializer

    def get_queryset(self):
        return PipelineRun.objects.filter(
            pipeline__owner=self.request.user
        ).select_related('pipeline', 'triggered_by').prefetch_related('steps')

    # /api/v1/pipeline-runs/{id}/cancel/
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        run = self.get_object()
        if run.status not in (PipelineRun.STATUS_PENDING, PipelineRun.STATUS_RUNNING):
            return Response({'detail': 'Run is not cancellable.'}, status=status.HTTP_400_BAD_REQUEST)
        run.status      = PipelineRun.STATUS_CANCELLED
        run.finished_at = timezone.now()
        run.save(update_fields=['status', 'finished_at'])
        return Response(PipelineRunSerializer(run).data)

    # /api/v1/pipeline-runs/{id}/artifacts/
    @action(detail=True, methods=['get'])
    def artifacts(self, request, pk=None):
        run = self.get_object()
        qs  = run.artifacts.all()
        serializer = ArtifactSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    # /api/v1/pipeline-runs/{id}/reports/
    @action(detail=True, methods=['get'])
    def reports(self, request, pk=None):
        run = self.get_object()
        qs  = run.reports.all()
        return Response(ReportSerializer(qs, many=True).data)

    # /api/v1/pipeline-runs/{id}/metrics/
    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        run = self.get_object()
        qs  = run.metrics.all()
        return Response(MetricSerializer(qs, many=True).data)

    # /api/v1/pipeline-runs/{id}/containers/
    @action(detail=True, methods=['get'])
    def containers(self, request, pk=None):
        run = self.get_object()
        qs  = run.containers.all()
        return Response(ContainerSerializer(qs, many=True).data)


# ──────────────────────────────────────────────────────────────────────────────
# Container
# ──────────────────────────────────────────────────────────────────────────────

class ContainerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ContainerSerializer

    def get_queryset(self):
        return Container.objects.filter(
            pipeline_run__pipeline__owner=self.request.user
        ).select_related('pipeline_run', 'pipeline_step')


# ──────────────────────────────────────────────────────────────────────────────
# Artifact
# ──────────────────────────────────────────────────────────────────────────────

class ArtifactViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ArtifactSerializer
    http_method_names  = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Artifact.objects.filter(
            pipeline_run__pipeline__owner=self.request.user
        ).select_related('pipeline_run', 'model_version')


# ──────────────────────────────────────────────────────────────────────────────
# Report
# ──────────────────────────────────────────────────────────────────────────────

class ReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ReportSerializer
    http_method_names  = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return Report.objects.filter(
            pipeline_run__pipeline__owner=self.request.user
        ).select_related('pipeline_run', 'model_version')


# ──────────────────────────────────────────────────────────────────────────────
# Metric
# ──────────────────────────────────────────────────────────────────────────────

class MetricViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = MetricSerializer
    http_method_names  = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Metric.objects.filter(
            pipeline_run__pipeline__owner=self.request.user
        ).select_related('pipeline_run', 'model_version')
