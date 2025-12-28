import os
import sys
import time

import django
import pyotp


def main() -> None:
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    from rest_framework.test import APIClient

    client = APIClient()

    ts = int(time.time())
    username = f"testuser_{ts}"
    email = f"test_{ts}@example.com"
    password = "StrongPass!123"

    resp = client.post(
        "/api/accounts/register/",
        {
            "username": username,
            "email": email,
            "first_name": "Test",
            "last_name": "User",
            "password": password,
        },
        format="json",
    )
    print("register", resp.status_code, getattr(resp, "data", resp.content))
    assert resp.status_code == 201

    resp = client.post("/api/token/", {"username": email, "password": password}, format="json")
    print("token", resp.status_code, list(resp.data.keys()) if hasattr(resp, "data") else resp.content)
    assert resp.status_code == 200

    access = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    resp = client.post("/api/accounts/mfa/setup/", {}, format="json")
    print("mfa_setup", resp.status_code, "otpauth_url" in resp.data)
    assert resp.status_code == 200

    from django.contrib.auth.models import User

    user = User.objects.get(username=username)
    otp_secret = user.profile.get_totp_secret() if hasattr(user.profile, 'get_totp_secret') else user.profile.mfa_totp_secret
    otp = pyotp.TOTP(otp_secret).now()

    resp = client.post("/api/accounts/mfa/enable/", {"otp": otp}, format="json")
    print("mfa_enable", resp.status_code, getattr(resp, "data", resp.content))
    assert resp.status_code == 200

    client2 = APIClient()
    resp = client2.post("/api/token/", {"username": email, "password": password}, format="json")
    print("token_no_otp", resp.status_code, getattr(resp, "data", resp.content))
    assert resp.status_code == 400

    otp2 = pyotp.TOTP(otp_secret).now()
    resp = client2.post(
        "/api/token/", {"username": email, "password": password, "otp": otp2}, format="json"
    )
    print("token_with_otp", resp.status_code, list(resp.data.keys()) if hasattr(resp, "data") else resp.content)
    assert resp.status_code == 200

    # Cookie auth + CSRF flow
    client3 = APIClient(enforce_csrf_checks=True)

    resp = client3.get("/api/auth/csrf/")
    print("csrf", resp.status_code)
    assert resp.status_code == 200
    csrf_token = client3.cookies.get("csrftoken").value

    # Missing CSRF header should be rejected
    resp = client3.post(
        "/api/auth/login/",
        {"username": email, "password": password, "otp": pyotp.TOTP(otp_secret).now()},
        format="json",
    )
    print("cookie_login_no_csrf", resp.status_code)
    assert resp.status_code in (403, 400)

    resp = client3.post(
        "/api/auth/login/",
        {"username": email, "password": password, "otp": pyotp.TOTP(otp_secret).now()},
        format="json",
        HTTP_X_CSRFTOKEN=csrf_token,
    )
    print("cookie_login", resp.status_code)
    assert resp.status_code == 200

    resp = client3.get("/api/accounts/profiles/me/")
    print("cookie_me", resp.status_code)
    assert resp.status_code == 200

    resp = client3.post("/api/auth/refresh/", {}, format="json", HTTP_X_CSRFTOKEN=csrf_token)
    print("cookie_refresh", resp.status_code)
    assert resp.status_code == 200

    resp = client3.post("/api/auth/logout/", {}, format="json", HTTP_X_CSRFTOKEN=csrf_token)
    print("cookie_logout", resp.status_code)
    assert resp.status_code == 200

    print("OK")


if __name__ == "__main__":
    main()
