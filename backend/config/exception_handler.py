from __future__ import annotations

from django.db import DatabaseError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def api_exception_handler(exc, context):
    """Ensure API errors are returned as JSON, even when the DB is down.

    When the database is unreachable (common in container start/restart windows),
    some views can raise OperationalError/DatabaseError. In DEBUG mode Django may
    emit an HTML debug page, which breaks the SPA.
    """

    if isinstance(exc, DatabaseError):
        return Response(
            {"detail": "Service temporarily unavailable. Please try again."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return drf_exception_handler(exc, context)
