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

    path('space/eonet/', space_views.eonet_events, name='space-eonet-events'),
    path('space/epic/', space_views.epic_latest, name='space-epic-latest'),
    path('space/exoplanet/', space_views.exoplanet_sample, name='space-exoplanet-sample'),
    path('space/images/', space_views.nasa_images_search, name='space-nasa-images-search'),
    path('space/techport/', space_views.techport_projects, name='space-techport-projects'),
    path('space/techtransfer/', space_views.techtransfer_patents, name='space-techtransfer-patents'),
    path('space/ssd-cneos/', space_views.ssd_cneos_close_approach, name='space-ssd-cneos-cad'),
    path('space/tle/', space_views.tle_25544, name='space-tle'),

    # Info endpoints for non-JSON / special services
    path('space/gibs/', space_views.gibs_info, name='space-gibs-info'),
    path('space/trek-wmts/', space_views.trek_wmts_info, name='space-trek-wmts-info'),
    path('space/insight/', space_views.insight_info, name='space-insight-info'),
    path('space/osdr/', space_views.osdr_info, name='space-osdr-info'),
    path('space/ssc/', space_views.ssc_info, name='space-ssc-info'),
]
