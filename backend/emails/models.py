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


# ── Email Template Library ────────────────────────────────────────────────────

class EmailTemplate(models.Model):
    """User-selectable email templates stored in the database."""

    CATEGORY_CHOICES = [
        ('system',      'System (Default)'),
        ('security',    'Security'),
        ('notification','Notification'),
        ('marketing',   'Marketing'),
        ('custom',      'Custom'),
    ]

    PERMISSION_CHOICES = [
        ('global',    'Global — visible to all users'),
        ('personal',  'Personal — creator only'),
        ('marketing', 'Marketing — marketing team'),
    ]

    template_id     = models.CharField(max_length=32, unique=True,
                                       help_text='Short slug, e.g. TMPL-01')
    name            = models.CharField(max_length=128)
    category        = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='custom')
    permission      = models.CharField(max_length=16, choices=PERMISSION_CHOICES, default='global')
    subject         = models.CharField(max_length=255)
    html_body       = models.TextField(help_text='HTML source; use {{variable}} placeholders')
    text_body       = models.TextField(blank=True, default='', help_text='Plain-text fallback')
    variables       = models.JSONField(default=list, blank=True,
                                       help_text='List of variable names, e.g. ["name","link","date"]')
    preview_text    = models.CharField(max_length=200, blank=True, default='')
    version         = models.PositiveSmallIntegerField(default=1)
    is_active       = models.BooleanField(default=True)
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='email_templates',
    )
    last_edited_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='email_templates_edited',
    )
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['permission', 'created_by']),
        ]
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'

    def __str__(self):
        return f"[{self.template_id}] {self.name} (v{self.version})"


# ── Sender Identity ───────────────────────────────────────────────────────────

class SenderIdentity(models.Model):
    """Configured sending identities (from-addresses + display names)."""

    USAGE_CHOICES = [
        ('transactional', 'Transactional (auth, security, system)'),
        ('marketing',     'Marketing (campaigns, newsletters, promos)'),
        ('both',          'Both'),
    ]

    email           = models.EmailField(unique=True)
    display_name    = models.CharField(max_length=100)
    domain          = models.CharField(max_length=100)
    is_verified     = models.BooleanField(default=False)
    usage           = models.CharField(max_length=16, choices=USAGE_CHOICES, default='transactional')
    reply_to        = models.EmailField(blank=True, default='')
    spf_verified    = models.BooleanField(default=False)
    dkim_verified   = models.BooleanField(default=False)
    dmarc_verified  = models.BooleanField(default=False)
    notes           = models.TextField(blank=True, default='')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['domain', 'email']
        verbose_name = 'Sender Identity'
        verbose_name_plural = 'Sender Identities'

    def __str__(self):
        return f"{self.display_name} <{self.email}> [{self.get_usage_display()}]"

    @property
    def dns_status(self):
        ok = self.spf_verified and self.dkim_verified and self.dmarc_verified
        return 'verified' if ok else 'partial' if any([self.spf_verified, self.dkim_verified, self.dmarc_verified]) else 'unverified'


# ── Marketing Campaign ────────────────────────────────────────────────────────

class Campaign(models.Model):
    """A marketing email campaign."""

    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('scheduled', 'Scheduled'),
        ('sending',   'Sending'),
        ('sent',      'Sent'),
        ('paused',    'Paused'),
        ('cancelled', 'Cancelled'),
        ('failed',    'Failed'),
    ]

    name            = models.CharField(max_length=200)
    template        = models.ForeignKey(
        EmailTemplate,
        on_delete=models.PROTECT,
        related_name='campaigns',
        null=True, blank=True,
    )
    sender_identity = models.ForeignKey(
        SenderIdentity,
        on_delete=models.PROTECT,
        related_name='campaigns',
        null=True, blank=True,
    )
    subject         = models.CharField(max_length=255, blank=True, default='',
                                       help_text='Override template subject if set')
    recipients      = models.JSONField(default=list, blank=True,
                                       help_text='List of email strings or {email,name} dicts')
    recipient_count = models.PositiveIntegerField(default=0)
    status          = models.CharField(max_length=16, choices=STATUS_CHOICES, default='draft')
    scheduled_at    = models.DateTimeField(null=True, blank=True)
    sent_at         = models.DateTimeField(null=True, blank=True)
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='campaigns_created',
    )
    # Metrics — updated as emails are processed
    delivered_count = models.PositiveIntegerField(default=0)
    open_count      = models.PositiveIntegerField(default=0)
    click_count     = models.PositiveIntegerField(default=0)
    bounce_count    = models.PositiveIntegerField(default=0)
    unsubscribe_count = models.PositiveIntegerField(default=0)
    notes           = models.TextField(blank=True, default='')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['scheduled_at']),
        ]
        verbose_name = 'Campaign'
        verbose_name_plural = 'Campaigns'

    def __str__(self):
        return f"{self.name} [{self.status}]"

    @property
    def delivery_rate(self):
        if not self.recipient_count:
            return 0.0
        return round(self.delivered_count / self.recipient_count * 100, 1)

    @property
    def open_rate(self):
        if not self.delivered_count:
            return 0.0
        return round(self.open_count / self.delivered_count * 100, 1)

    @property
    def click_rate(self):
        if not self.delivered_count:
            return 0.0
        return round(self.click_count / self.delivered_count * 100, 1)

    @property
    def bounce_rate(self):
        if not self.recipient_count:
            return 0.0
        return round(self.bounce_count / self.recipient_count * 100, 1)


class CampaignLog(models.Model):
    """Per-recipient log entry for a campaign send."""

    STATUS_CHOICES = [
        ('queued',    'Queued'),
        ('sent',      'Sent'),
        ('delivered', 'Delivered'),
        ('opened',    'Opened'),
        ('clicked',   'Clicked'),
        ('bounced',   'Bounced'),
        ('failed',    'Failed'),
        ('unsubscribed', 'Unsubscribed'),
    ]

    campaign        = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='logs')
    recipient       = models.EmailField()
    status          = models.CharField(max_length=16, choices=STATUS_CHOICES, default='queued')
    error_message   = models.TextField(blank=True, default='')
    metadata        = models.JSONField(default=dict, blank=True)
    sent_at         = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['recipient', 'created_at']),
        ]
        verbose_name = 'Campaign Log'
        verbose_name_plural = 'Campaign Logs'

    def __str__(self):
        return f"[{self.campaign.name}] → {self.recipient} ({self.status})"


# ── Inbound Email Inbox ───────────────────────────────────────────────────────

class InboundEmail(models.Model):
    """
    Received email stored via the inbound webhook.
    Compatible with Brevo Inbound Parsing and similar services
    (Mailgun inbound, SendGrid Inbound Parse, etc.).
    """

    STATUS_CHOICES = [
        ('unread',   'Unread'),
        ('read',     'Read'),
        ('archived', 'Archived'),
        ('spam',     'Spam'),
    ]

    # Envelope
    message_id      = models.CharField(max_length=512, blank=True, default='', db_index=True)
    from_email      = models.EmailField()
    from_name       = models.CharField(max_length=255, blank=True, default='')
    to_email        = models.CharField(max_length=512)   # may be comma-separated
    cc              = models.TextField(blank=True, default='')
    reply_to        = models.EmailField(blank=True, default='')
    in_reply_to     = models.CharField(max_length=512, blank=True, default='')

    # Content
    subject         = models.CharField(max_length=998, blank=True, default='(no subject)')
    html_body       = models.TextField(blank=True, default='')
    text_body       = models.TextField(blank=True, default='')
    preview_text    = models.CharField(max_length=255, blank=True, default='')

    # Meta
    status          = models.CharField(max_length=16, choices=STATUS_CHOICES, default='unread')
    has_attachments = models.BooleanField(default=False)
    attachments     = models.JSONField(default=list, blank=True)
    headers         = models.JSONField(default=dict, blank=True)
    raw_payload     = models.JSONField(default=dict, blank=True,
                                       help_text='Full raw webhook payload for debugging')
    spam_score      = models.FloatField(null=True, blank=True)
    received_at     = models.DateTimeField(null=True, blank=True,
                                           help_text='Date header from the email itself')
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['from_email', 'created_at']),
            models.Index(fields=['message_id']),
        ]
        verbose_name = 'Inbound Email'
        verbose_name_plural = 'Inbound Emails'

    def __str__(self):
        return f"[{self.status}] From {self.from_email}: {self.subject}"

