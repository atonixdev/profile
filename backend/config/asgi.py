"""
ASGI config for Personal Brand Hub project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from importlib import import_module

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from accounts.ws_auth import JwtCookieAuthMiddleware  # noqa: E402


def load_websocket_urlpatterns(module_names):
	patterns = []
	for module_name in module_names:
		try:
			module = import_module(module_name)
		except ModuleNotFoundError:
			continue
		patterns.extend(getattr(module, 'websocket_urlpatterns', []))
	return patterns


websocket_urlpatterns = load_websocket_urlpatterns([
	'employment.routing',
	'iot_lab.routing',
])

application = ProtocolTypeRouter(
	{
		'http': django_asgi_app,
		'websocket': AllowedHostsOriginValidator(
			JwtCookieAuthMiddleware(
				URLRouter(
					websocket_urlpatterns,
				)
			)
		),
	}
)
