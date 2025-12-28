from __future__ import annotations

from django.http import JsonResponse


def csrf_failure(request, reason: str = ""):
    """Return JSON for CSRF failures on API requests.

    Django's default CSRF failure view returns an HTML page, which is noisy for
    SPA clients. For /api/* requests (or clients explicitly requesting JSON),
    return a compact JSON error instead.
    """

    accept = (request.headers.get("Accept") or "").lower()
    wants_json = "application/json" in accept or request.path.startswith("/api/")

    if wants_json:
        detail = "CSRF failed. Refresh the page and try again."
        if reason:
            detail = f"CSRF failed: {reason}"
        return JsonResponse({"detail": detail}, status=403)

    # Fall back to Django's default behavior (HTML) for non-API requests.
    from django.views.csrf import csrf_failure as default_csrf_failure

    return default_csrf_failure(request, reason=reason)
