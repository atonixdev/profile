import uuid

from django.contrib.auth.models import User
from django.db import models


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('billing',          'Billing'),
        ('technical',        'Technical Issue'),
        ('account_access',   'Account Access'),
        ('deployment',       'Deployment Issue'),
        ('general',          'General Inquiry'),
        ('compliance',       'Compliance / Legal'),
        ('developer_tools',  'Developer Tools'),
        ('api',              'API Issues'),
    ]

    STATUS_CHOICES = [
        ('open',                'Open'),
        ('pending',             'Pending'),
        ('awaiting_user',       'Awaiting User Response'),
        ('resolved',            'Resolved'),
        ('escalated',           'Escalated'),
        ('closed',              'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('low',      'Low'),
        ('medium',   'Medium'),
        ('high',     'High'),
        ('critical', 'Critical'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
    # Submitter info
    user        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='support_tickets')
    name        = models.CharField(max_length=200)
    email       = models.EmailField(db_index=True)
    # Ticket content
    category    = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general', db_index=True)
    subject     = models.CharField(max_length=300)
    message     = models.TextField()
    attachment  = models.FileField(upload_to='support/attachments/', null=True, blank=True)
    priority    = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', db_index=True)
    # Management
    status      = models.CharField(max_length=30, choices=STATUS_CHOICES, default='open', db_index=True)
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets'
    )
    internal_notes = models.TextField(blank=True)
    # Metadata
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    user_agent  = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
        ]

    @property
    def ticket_ref(self) -> str:
        """Short display reference, e.g. SUP-A1B2C3."""
        return f'SUP-{str(self.id)[:6].upper()}'

    def __str__(self) -> str:
        return f'[{self.ticket_ref}] {self.subject} — {self.status}'


class TicketReply(models.Model):
    SENDER_CHOICES = [
        ('user',    'User'),
        ('support', 'Support Agent'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket      = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='replies')
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES, default='support')
    sender_user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ticket_replies'
    )
    sender_name = models.CharField(max_length=200, blank=True)  # populated for guest replies
    message     = models.TextField()
    is_internal = models.BooleanField(default=False, help_text='Internal note — not sent to user')
    attachment  = models.FileField(upload_to='support/reply_attachments/', null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Ticket Reply'
        verbose_name_plural = 'Ticket Replies'

    def __str__(self) -> str:
        return f'Reply to [{self.ticket.ticket_ref}] by {self.sender_type}'


class TicketAuditLog(models.Model):
    """Immutable audit trail for all ticket state changes."""
    ticket      = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='audit_logs')
    actor       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action      = models.CharField(max_length=100)  # e.g. 'status_changed', 'assigned', 'reply_sent'
    detail      = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ticket Audit Log'

    def __str__(self) -> str:
        return f'{self.action} on [{self.ticket.ticket_ref}]'
