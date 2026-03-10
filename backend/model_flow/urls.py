from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ArtifactViewSet, ContainerViewSet, MetricViewSet,
    ModelFlowViewSet, ModelVersionViewSet,
    PipelineRunViewSet, PipelineViewSet, ReportViewSet,
)

router = DefaultRouter()
router.register(r'model-flows',     ModelFlowViewSet,    basename='model-flows')
router.register(r'model-versions',  ModelVersionViewSet, basename='model-versions')
router.register(r'pipelines',       PipelineViewSet,     basename='pipelines')
router.register(r'pipeline-runs',   PipelineRunViewSet,  basename='pipeline-runs')
router.register(r'containers',      ContainerViewSet,    basename='containers')
router.register(r'artifacts',       ArtifactViewSet,     basename='artifacts')
router.register(r'reports',         ReportViewSet,       basename='reports')
router.register(r'metrics',         MetricViewSet,       basename='metrics')

urlpatterns = [
    path('', include(router.urls)),
]
