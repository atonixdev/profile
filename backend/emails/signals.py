"""
Email + Audit signals.

Wires Django auth signals (login, password reset, etc.) to EmailService
so all transactional emails are dispatched automatically.
"""
import logging

from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver, Signal
from django.db.models.signals import post_save

logger = logging.getLogger(__name__)

# Custom internal signals — any view can fire these
password_reset_requested = Signal()   # kwargs: user, request
password_changed         = Signal()   # kwargs: user, request
email_changed            = Signal()   # kwargs: user, old_email, request
role_changed             = Signal()   # kwargs: user, role, action ('assigned'/'removed'), actor, request
account_created          = Signal()   # kwargs: user, request
mfa_changed              = Signal()   # kwargs: user, enabled (bool), request
incident_fired           = Signal()   # kwargs: title, body, severity, affected_users (list of User)


def _get_ip(request):
    if not request:
        return ''
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', '')


def _get_ua(request):
    return request.META.get('HTTP_USER_AGENT', '') if request else ''


# ── Django built-in auth signals ─────────────────────────────────────────────

@receiver(user_logged_in)
def on_login(sender, request, user, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        ua = _get_ua(request)
        name = (user.get_full_name() or user.username).strip()
        EmailService.send(
            email_type='new_login',
            recipient=user.email,
            ip_address=ip,
            actor=user,
            audit_description=f'Login from {ip}',
            context={
                'name': name,
                'ip_address': ip or 'Unknown',
                'device': ua[:120] if ua else 'Unknown device',
                'time': __import__('django.utils.timezone', fromlist=['now']).now().strftime('%Y-%m-%d %H:%M UTC'),
                'action_label': 'Secure my account',
                'action_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/settings/security",
            },
        )
        # Write audit even if email was already logged above
        EmailService.log_security_event(
            action='login_success',
            actor=user,
            ip_address=ip,
            user_agent=ua,
            description=f'Login from {ip}',
        )
    except Exception as exc:
        logger.error('on_login signal: %s', exc)


@receiver(user_login_failed)
def on_login_failed(sender, credentials, request, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        EmailService.log_security_event(
            action='login_failed',
            ip_address=ip,
            user_agent=_get_ua(request),
            target_email=credentials.get('email') or credentials.get('username', ''),
            description=f'Failed login attempt from {ip}',
        )
    except Exception as exc:
        logger.error('on_login_failed signal: %s', exc)


# ── Custom signals ────────────────────────────────────────────────────────────

@receiver(account_created)
def on_account_created(sender, user, request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        EmailService.send(
            email_type='account_created',
            recipient=user.email,
            ip_address=ip,
            actor=user,
            context={
                'name': name,
                'dashboard_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/dashboard",
            },
        )
    except Exception as exc:
        logger.error('on_account_created signal: %s', exc)


@receiver(password_reset_requested)
def on_password_reset_requested(sender, user, request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        # The reset_url should be passed by the caller via kwargs
        reset_url = kwargs.get('reset_url', '#')
        EmailService.send(
            email_type='password_reset',
            recipient=user.email,
            ip_address=ip,
            actor=user,
            audit_description='Password reset requested',
            context={
                'name': name,
                'reset_url': reset_url,
                'ip_address': ip or 'Unknown',
                'expires_in': '30 minutes',
            },
        )
    except Exception as exc:
        logger.error('on_password_reset_requested signal: %s', exc)


@receiver(password_changed)
def on_password_changed(sender, user, request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        EmailService.send(
            email_type='password_changed',
            recipient=user.email,
            ip_address=ip,
            actor=user,
            audit_description='Password changed',
            context={
                'name': name,
                'ip_address': ip or 'Unknown',
                'alert_title': 'Your password was changed',
                'alert_body': 'Your AtonixDev account password was successfully changed. If you did not make this change, contact our security team immediately.',
                'action_label': 'Secure my account',
                'action_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/settings/security",
            },
        )
    except Exception as exc:
        logger.error('on_password_changed signal: %s', exc)


@receiver(email_changed)
def on_email_changed(sender, user, old_email='', request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        ctx = {
            'name': name,
            'ip_address': ip or 'Unknown',
            'alert_title': 'Your email address was changed',
            'alert_body': f'The email address on your AtonixDev account was changed from {old_email} to {user.email}. If you did not make this change, contact us immediately.',
            'action_label': 'Contact Support',
            'action_url': 'mailto:security@atonixdev.com',
        }
        # Notify both old and new addresses
        for addr in {old_email, user.email}:
            if addr:
                EmailService.send(
                    email_type='email_changed',
                    recipient=addr,
                    ip_address=ip,
                    actor=user,
                    audit_description='Email address changed',
                    context=ctx,
                )
    except Exception as exc:
        logger.error('on_email_changed signal: %s', exc)


@receiver(role_changed)
def on_role_changed(sender, user, role='', action='assigned', actor=None, request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        EmailService.send(
            email_type='role_changed',
            recipient=user.email,
            ip_address=ip,
            actor=actor,
            audit_description=f'Role {role} {action}',
            context={
                'name': name,
                'alert_title': f'Your account role has been {action}',
                'alert_body': f'The role "{role}" has been {action} on your AtonixDev account.',
                'ip_address': ip or 'Unknown',
                'action_label': 'View account settings',
                'action_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/settings/account",
            },
        )
    except Exception as exc:
        logger.error('on_role_changed signal: %s', exc)


@receiver(mfa_changed)
def on_mfa_changed(sender, user, enabled=True, request=None, **kwargs):
    from emails.service import EmailService
    try:
        ip = _get_ip(request)
        name = (user.get_full_name() or user.username).strip()
        verb = 'enabled' if enabled else 'disabled'
        EmailService.send(
            email_type='mfa_changed',
            recipient=user.email,
            ip_address=ip,
            actor=user,
            audit_description=f'MFA {verb}',
            context={
                'name': name,
                'alert_title': f'Two-factor authentication {verb}',
                'alert_body': f'Two-factor authentication has been {verb} on your AtonixDev account. If this was not you, contact security immediately.',
                'ip_address': ip or 'Unknown',
                'action_label': 'Review security settings',
                'action_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/settings/security",
            },
        )
    except Exception as exc:
        logger.error('on_mfa_changed signal: %s', exc)


@receiver(incident_fired)
def on_incident_fired(sender, title='', body='', severity='medium', affected_users=None, **kwargs):
    from emails.service import EmailService
    try:
        for user in (affected_users or []):
            name = (user.get_full_name() or user.username).strip()
            EmailService.send(
                email_type='incident_alert',
                recipient=user.email,
                audit_description=f'Incident: {title}',
                context={
                    'name': name,
                    'incident_title': title,
                    'incident_body': body,
                    'severity': severity,
                    'status_url': f"{__import__('django.conf', fromlist=['settings']).settings.FRONTEND_URL}/status",
                },
            )
    except Exception as exc:
        logger.error('on_incident_fired signal: %s', exc)
