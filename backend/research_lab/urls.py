from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ExperimentViewSet, ExperimentRunViewSet
from . import space_views

router = DefaultRouter()
router.register(r'experiments', ExperimentViewSet, basename='research-lab-experiment')
router.register(r'runs', ExperimentRunViewSet, basename='research-lab-run')

urlpatterns = [
    path('', include(router.urls)),

    # Space Lab proxy endpoints (NASA/ISS)
    path('space/apod/', space_views.apod, name='space-apod'),
    path('space/iss/', space_views.iss_now, name='space-iss-now'),
    path('space/neo/', space_views.neo_summary, name='space-neo-summary'),
    path('space/donki/', space_views.donki_summary, name='space-donki-summary'),
]
