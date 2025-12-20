from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from django.views.decorators.http import condition
from django.views.decorators.cache import cache_page
import os
from django.conf import settings


def landing_page(request):
    """
    Landing page for the Personal Brand Hub API backend.
    """
    return render(request, 'landing.html')


def api_status(request):
    """
    API status endpoint to check if the backend is running.
    """
    return JsonResponse({
        'status': 'running',
        'message': 'atonixdev - Personal Brand Hub API',
        'version': '1.0.0',
        'endpoints': {
            'profile': '/api/accounts/profile/',
            'projects': '/api/portfolio/projects/',
            'services': '/api/services/',
            'testimonials': '/api/testimonials/',
            'contact': '/api/contact/',
            'auth': {
                'token': '/api/token/',
                'refresh': '/api/token/refresh/'
            }
        }
    })


@cache_page(60 * 60 * 24)  # Cache for 24 hours
def sitemap(request):
    """
    Serve sitemap.xml for search engines.
    """
    sitemap_path = os.path.join(settings.STATIC_ROOT, 'sitemap.xml')
    if os.path.exists(sitemap_path):
        return FileResponse(open(sitemap_path, 'rb'), content_type='application/xml')
    # Fallback if static files not collected
    return FileResponse(
        open(os.path.join(settings.BASE_DIR, 'static', 'sitemap.xml'), 'rb'),
        content_type='application/xml'
    )


@cache_page(60 * 60 * 24)  # Cache for 24 hours
def robots(request):
    """
    Serve robots.txt for search engines.
    """
    robots_path = os.path.join(settings.STATIC_ROOT, 'robots.txt')
    if os.path.exists(robots_path):
        return FileResponse(open(robots_path, 'rb'), content_type='text/plain')
    # Fallback if static files not collected
    return FileResponse(
        open(os.path.join(settings.BASE_DIR, 'static', 'robots.txt'), 'rb'),
        content_type='text/plain'
    )