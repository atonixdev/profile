"""
AtonixDev — Centralized Email Service

All outbound email MUST go through EmailService.send().
No module should call django.core.mail directly.

Usage:
    from emails.service import EmailService

    EmailService.send(
        email_type='new_login',
        recipient='user@example.com',
        context={
            'name': 'Samuel',
            'ip_address': '41.77.12.8',
            'device': 'Chrome / macOS',
            'time': '2026-03-09 11:42 UTC',
        },
        ip_address='41.77.12.8',  # optional — for audit trail
    )
"""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)

# ── Template registry ────────────────────────────────────────────────────────
# Maps email_type → (template_name, default_subject, from_address)

TEMPLATE_REGISTRY: dict[str, tuple[str, str, str]] = {
    # Auth
    'account_created':    ('emails/account_created.html',   'Welcome to AtonixDev — Your Account is Ready',           'no-reply@atonixdev.com'),
    'email_verification': ('emails/email_verification.html','Verify your AtonixDev email address',                    'no-reply@atonixdev.com'),
    'password_reset':     ('emails/password_reset.html',    'Reset your AtonixDev password',                          'no-reply@atonixdev.com'),
    'new_login':          ('emails/new_login.html',         'New login to your AtonixDev account',                    'security@atonixdev.com'),
    'new_device_login':   ('emails/new_login.html',         'New device login detected — AtonixDev',                  'security@atonixdev.com'),
    # Security
    'security_alert':        ('emails/security_alert.html', 'Security Alert — AtonixDev',                            'security@atonixdev.com'),
    'suspicious_login':      ('emails/security_alert.html', 'Suspicious login attempt on your account',              'security@atonixdev.com'),
    'failed_logins':         ('emails/security_alert.html', 'Multiple failed login attempts detected',               'security@atonixdev.com'),
    'password_changed':      ('emails/security_alert.html', 'Your AtonixDev password was changed',                   'security@atonixdev.com'),
    'email_changed':         ('emails/security_alert.html', 'Your AtonixDev email address was changed',              'security@atonixdev.com'),
    'mfa_changed':           ('emails/security_alert.html', 'Two-factor authentication settings changed',            'security@atonixdev.com'),
    'role_changed':          ('emails/security_alert.html', 'Your account role has been updated — AtonixDev',        'security@atonixdev.com'),
    # Incident
    'incident_alert':         ('emails/incident_alert.html', '[Incident] AtonixDev service notification',            'alerts@atonixdev.com'),
    'service_outage':         ('emails/incident_alert.html', '[Outage] AtonixDev service disruption',                'alerts@atonixdev.com'),
    'pipeline_failure':       ('emails/incident_alert.html', '[Alert] Pipeline failure — AtonixDev',                 'alerts@atonixdev.com'),
    'degraded_performance':   ('emails/incident_alert.html', '[Notice] Degraded performance — AtonixDev',            'alerts@atonixdev.com'),
    # Billing
    'billing_change':  ('emails/billing_alert.html', 'Your AtonixDev subscription has changed',           'no-reply@atonixdev.com'),
    'payment_failed':  ('emails/billing_alert.html', 'Action required: Payment failed — AtonixDev',      'no-reply@atonixdev.com'),
    'invoice_issued':  ('emails/billing_alert.html', 'Your AtonixDev invoice is ready',                  'no-reply@atonixdev.com'),
    # System / admin
    'admin_action': ('emails/security_alert.html', 'Admin action on your account — AtonixDev', 'security@atonixdev.com'),
    'compliance':   ('emails/security_alert.html', 'Important compliance notice — AtonixDev',  'no-reply@atonixdev.com'),
}


class EmailService:
    """
    Centralized AtonixDev email dispatcher.

    All emails are:
      • Dispatched via the configured Django email backend (Brevo / SendGrid / SMTP)
      • Logged in EmailLog (audit trail)
      • Linked to a SecurityAuditLog entry when security-related
    """

    # ── Public API ────────────────────────────────────────────────────────────

    @classmethod
    def send(
        cls,
        email_type: str,
        recipient: str,
        context: dict[str, Any] | None = None,
        subject_override: str | None = None,
        ip_address: str = '',
        actor=None,
        audit_description: str = '',
    ) -> bool:
        """
        Send a branded email and log the result.

        Returns True on success, False on failure.
        The call never raises — failures are logged internally.
        """
        # Late import to avoid circular imports during app startup
        from emails.models import EmailLog

        context = context or {}

        if email_type not in TEMPLATE_REGISTRY:
            logger.error('EmailService: unknown email_type=%s', email_type)
            return False

        template_name, default_subject, from_email = TEMPLATE_REGISTRY[email_type]
        subject = subject_override or default_subject

        # Merge global context
        ctx = cls._build_context(context, email_type)

        log = EmailLog(
            recipient=recipient,
            subject=subject,
            email_type=email_type,
            template_name=template_name,
            ip_address=ip_address,
            metadata=context,
        )

        try:
            html_body = render_to_string(template_name, ctx)
            text_body = cls._strip_html(html_body)

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=[recipient],
                reply_to=[getattr(settings, 'EMAIL_REPLY_TO', 'support@atonixdev.com')],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.send(fail_silently=False)

            log.status = 'sent'
            log.save()
            logger.info('EmailService: sent %s → %s', email_type, recipient)
            success = True

        except Exception as exc:
            log.status = 'failed'
            log.error_message = str(exc)
            log.save()
            logger.error('EmailService: failed %s → %s: %s', email_type, recipient, exc)
            success = False

        # Write security audit entry when relevant
        if email_type in _SECURITY_EMAIL_TYPES:
            cls._write_audit(
                action=_SECURITY_EMAIL_TYPES[email_type],
                actor=actor,
                target_email=recipient,
                ip_address=ip_address,
                description=audit_description or default_subject,
                email_log=log,
            )

        return success

    @classmethod
    def log_security_event(
        cls,
        action: str,
        actor=None,
        target_user=None,
        target_email: str = '',
        ip_address: str = '',
        user_agent: str = '',
        description: str = '',
        metadata: dict | None = None,
        email_log=None,
    ):
        """Write a SecurityAuditLog entry without sending an email."""
        cls._write_audit(
            action=action,
            actor=actor,
            target_user=target_user,
            target_email=target_email,
            ip_address=ip_address,
            user_agent=user_agent,
            description=description,
            metadata=metadata or {},
            email_log=email_log,
        )

    # ── Internals ─────────────────────────────────────────────────────────────

    @staticmethod
    def _build_context(ctx: dict, email_type: str) -> dict:
        base = {
            'platform_name':    'AtonixDev',
            'platform_url':     getattr(settings, 'FRONTEND_URL', 'https://atonixdev.com'),
            'support_email':    'support@atonixdev.com',
            'year':             timezone.now().year,
            'email_type':       email_type,
        }
        base.update(ctx)
        return base

    @staticmethod
    def _strip_html(html: str) -> str:
        """Minimal HTML → plain text fallback."""
        import re
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    @staticmethod
    def _write_audit(
        action: str,
        actor=None,
        target_user=None,
        target_email: str = '',
        ip_address: str = '',
        user_agent: str = '',
        description: str = '',
        metadata: dict | None = None,
        email_log=None,
    ):
        from emails.models import SecurityAuditLog
        try:
            SecurityAuditLog.objects.create(
                actor=actor,
                action=action,
                target_user=target_user,
                target_email=target_email or (target_user.email if target_user else ''),
                ip_address=ip_address,
                user_agent=user_agent,
                description=description,
                metadata=metadata or {},
                email_log=email_log,
            )
        except Exception as exc:
            logger.error('EmailService: audit write failed: %s', exc)


# ── Security email → audit action mapping ─────────────────────────────────────
_SECURITY_EMAIL_TYPES: dict[str, str] = {
    'new_login':       'login_success',
    'new_device_login': 'login_new_device',
    'password_reset':  'password_reset_req',
    'password_changed': 'password_changed',
    'email_changed':   'email_changed',
    'mfa_changed':     'mfa_enabled',
    'role_changed':    'role_assigned',
    'suspicious_login': 'login_failed',
    'failed_logins':   'login_failed',
    'security_alert':  'admin_action',
    'account_suspended': 'account_suspended',
    'admin_action':    'admin_action',
}
