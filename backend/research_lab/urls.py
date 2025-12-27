from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ExperimentViewSet, ExperimentRunViewSet

router = DefaultRouter()
router.register(r'experiments', ExperimentViewSet, basename='research-lab-experiment')
router.register(r'runs', ExperimentRunViewSet, basename='research-lab-run')

urlpatterns = [
    path('', include(router.urls)),
]
