from django.shortcuts import render
from django.http import JsonResponse


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