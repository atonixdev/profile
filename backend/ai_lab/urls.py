from rest_framework.routers import DefaultRouter

from .views import DatasetViewSet, ModelArtifactViewSet

router = DefaultRouter()
router.register(r'datasets', DatasetViewSet, basename='ai-lab-datasets')
router.register(r'models', ModelArtifactViewSet, basename='ai-lab-models')

urlpatterns = router.urls
