from django.urls import re_path

from .consumers import CommandStreamConsumer, DeviceStreamConsumer, TelemetryStreamConsumer, NetworkStreamConsumer, AlertsStreamConsumer


websocket_urlpatterns = [
    re_path(r'^ws/iot-lab/commands/(?P<command_id>\d+)/$', CommandStreamConsumer.as_asgi()),
    re_path(r'^ws/iot-lab/devices/(?P<device_id>\d+)/$', DeviceStreamConsumer.as_asgi()),
    re_path(r'^ws/iot-lab/telemetry/(?P<device_id>\d+)/$', TelemetryStreamConsumer.as_asgi()),
    re_path(r'^ws/iot-lab/network/$', NetworkStreamConsumer.as_asgi()),
    re_path(r'^ws/iot-lab/alerts/$', AlertsStreamConsumer.as_asgi()),
]
