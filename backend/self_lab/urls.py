from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BiometricReadingViewSet,
    CognitiveTestResultViewSet,
    EvolutionMetricViewSet,
    JournalEntryViewSet,
    SummaryViewSet,
)

router = DefaultRouter()
router.register(r'biometrics', BiometricReadingViewSet, basename='self-lab-biometrics')
router.register(r'cognitive-tests', CognitiveTestResultViewSet, basename='self-lab-cognitive-tests')
router.register(r'evolution-metrics', EvolutionMetricViewSet, basename='self-lab-evolution-metrics')
router.register(r'journals', JournalEntryViewSet, basename='self-lab-journals')
router.register(r'overview', SummaryViewSet, basename='self-lab-overview')

urlpatterns = [
    path('', include(router.urls)),
]
