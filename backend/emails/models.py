from django.db import models
from django.conf import settings


class EmailLog(models.Model):
    """Append-only record of every outbound email."""

    TYPE_CHOICES = [
        # Auth
        ('account_created',    'Account Created'),
        ('email_verification', 'Email Verification'),
        ('password_reset',     'Password Reset'),
        ('new_login',          'New Login Notification'),
        ('new_device_login',   'New Device / Location Login'),
        # Security
        ('security_alert',         'Security Alert'),
        ('suspicious_login',       'Suspicious Login Attempt'),
        ('failed_logins',          'Multiple Failed Logins'),
        ('password_changed',       'Password Changed'),
        ('email_changed',          'Email Changed'),
        ('mfa_changed',            'MFA Enabled/Disabled'),
        ('role_changed',           'Role / Permission Changed'),
        # Incident
        ('incident_alert',         'Incident Alert'),
        ('service_outage',         'Service Outage'),
        ('pipeline_failure',       'Pipeline Failure'),
        ('degraded_performance',   'Degraded Performance'),
        # Billing
        ('billing_change',         'Billing Change'),
        ('payment_failed',         'Payment Failed'),
        ('invoice_issued',         'Invoice Issued'),
        # System
        ('admin_action',           'Admin Action'),
        ('compliance',             'Compliance Notification'),
    ]

    STATUS_CHOICES = [
        ('sent',    'Sent'),
        ('failed',  'Failed'),
        ('skipped', 'Skipped'),
    ]

    recipient       = models.EmailField()
    subject         = models.CharField(max_length=255)
    email_type      = models.CharField(max_length=64, choices=TYPE_CHOICES)
    template_name   = models.CharField(max_length=128)
    status          = models.CharField(max_length=16, choices=STATUS_CHOICES, default='sent')
    error_message   = models.TextField(blank=True, default='')
    ip_address      = models.CharField(max_length=64, blank=True, default='')
    metadata        = models.JSONField(default=dict, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'created_at']),
            models.Index(fields=['email_type', 'created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'

    def __str__(self):
        return f"[{self.email_type}] → {self.recipient} ({self.status}) @ {self.created_at:%Y-%m-%d %H:%M}"


class SecurityAuditLog(models.Model):
    """Security-sensitive events. Append-only, never deleted."""

    ACTION_CHOICES = [
        ('login_success',      'Login Success'),
        ('login_failed',       'Login Failed'),
        ('login_new_device',   'Login — New Device/Location'),
        ('logout',             'Logout'),
        ('password_reset_req', 'Password Reset Requested'),
        ('password_reset_ok',  'Password Reset Completed'),
        ('password_changed',   'Password Changed'),
        ('email_changed',      'Email Changed'),
        ('mfa_enabled',        'MFA Enabled'),
        ('mfa_disabled',       'MFA Disabled'),
        ('role_assigned',      'Role Assigned'),
        ('role_removed',       'Role Removed'),
        ('account_suspended',  'Account Suspended'),
        ('account_activated',  'Account Activated'),
        ('api_key_created',    'API Key Created'),
        ('api_key_revoked',    'API Key Revoked'),
        ('ip_blocked',         'IP Address Blocked'),
        ('admin_action',       'Admin Action'),
        ('incident_triggered', 'Incident Triggered'),
    ]

    actor           = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='security_audit_logs',
    )
    action          = models.CharField(max_length=64, choices=ACTION_CHOICES)
    target_user     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='security_audit_targets',
    )
    target_email    = models.EmailField(blank=True, default='')
    ip_address      = models.CharField(max_length=64, blank=True, default='')
    user_agent      = models.CharField(max_length=512, blank=True, default='')
    description     = models.CharField(max_length=512, blank=True, default='')
    metadata        = models.JSONField(default=dict, blank=True)
    email_log       = models.ForeignKey(
        EmailLog,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='audit_entries',
        help_text='Email sent as a result of this event (if any)',
    )
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['actor', 'created_at']),
            models.Index(fields=['ip_address', 'created_at']),
        ]
        verbose_name = 'Security Audit Log'
        verbose_name_plural = 'Security Audit Logs'

    def __str__(self):
        actor = self.actor.email if self.actor else 'system'
        return f"[{self.action}] by {actor} @ {self.created_at:%Y-%m-%d %H:%M}"
