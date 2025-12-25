import time
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from .models import ActivityEvent


class ActivityLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._activity_start = time.time()

    def process_response(self, request, response):
        if not getattr(settings, 'ACTIVITY_TRACKING_ENABLED', True):
            return response

        path = request.path
        exclude = set(getattr(settings, 'ACTIVITY_EXCLUDE_PATHS', ['/admin/', '/static/', '/media/']))
        if any(path.startswith(p) for p in exclude):
            return response

        duration_ms = None
        if hasattr(request, '_activity_start'):
            duration_ms = int((time.time() - request._activity_start) * 1000)

        user = getattr(request, 'user', None)
        actor = None if isinstance(user, AnonymousUser) else user

        ip = request.META.get('HTTP_X_FORWARDED_FOR')
        if ip:
            ip = ip.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        ua = request.META.get('HTTP_USER_AGENT')
        ref = request.META.get('HTTP_REFERER')

        try:
            ActivityEvent.objects.create(
                actor=actor,
                action='api_call' if path.startswith('/api/') else 'view',
                path=path,
                method=request.method,
                status_code=getattr(response, 'status_code', None),
                duration_ms=duration_ms,
                ip_address=ip,
                user_agent=ua,
                referrer=ref,
            )
        except Exception:
            # Do not break request flow due to logging failures
            pass

        return response
