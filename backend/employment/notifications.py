"""
Employment Console — Notification & Real-Time Event Service
Architecture §2.8 — Notification System Integration
Architecture §2.7 — Real-Time Event System

Provides:
  - Email notifications (application confirmations, interview invites, offers)
  - WebSocket broadcast to employment_admin group
  - Typed event payloads for every hiring milestone
"""

import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

from .models import EmploymentNotification

log = logging.getLogger(__name__)

ADMIN_GROUP = 'employment_admin'


# ─────────────────────────────────────────────────────────────────────────────
# Real-Time Broadcast
# ─────────────────────────────────────────────────────────────────────────────

def broadcast_event(event_name: str, payload: dict):
    """
    Broadcast a real-time event to all connected HR/admin clients.
    Architecture §2.7 — Real-Time Event System.
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            ADMIN_GROUP,
            {
                'type': 'employment_event',
                'event_name': event_name,
                'payload': payload,
            }
        )
    except Exception as exc:
        log.warning('Employment broadcast failed: %s', exc)


# ─────────────────────────────────────────────────────────────────────────────
# Typed Event Dispatchers
# ─────────────────────────────────────────────────────────────────────────────

def notify_application_received(application):
    """Broadcast new application + store notification record."""
    broadcast_event('application.received', {
        'application_id': str(application.id),
        'applicant': application.full_name,
        'job': application.job.title,
        'department': application.job.department,
        'submitted_at': application.submitted_at.isoformat(),
    })
    _create_notification(
        application=application,
        notification_type='application_received',
        subject=f'Application Received — {application.job.title}',
        body=(
            f'Dear {application.first_name},\n\n'
            f'We have received your application for {application.job.title}. '
            f'Our team will review it and contact you within 5 business days.\n\n'
            f'AtonixDev Talent Team'
        ),
    )


def notify_interview_invite(interview):
    """Send interview invitation notification."""
    app = interview.application
    broadcast_event('interview.scheduled', {
        'interview_id': str(interview.id),
        'application_id': str(app.id),
        'applicant': app.full_name,
        'round': interview.round,
        'format': interview.format,
        'scheduled_at': interview.scheduled_at.isoformat() if interview.scheduled_at else None,
    })
    _create_notification(
        application=app,
        notification_type='interview_invite',
        subject=f'Interview Invitation — Round {interview.round} — {app.job.title}',
        body=(
            f'Dear {app.first_name},\n\n'
            f'You have been selected for a Round {interview.round} interview for the '
            f'{app.job.title} position.\n\n'
            f'Format: {interview.get_format_display()}\n'
            f'Scheduled: {interview.scheduled_at.strftime("%B %d, %Y at %H:%M UTC") if interview.scheduled_at else "TBD"}\n'
            f'Duration: {interview.duration_minutes} minutes\n'
            f'{("Meeting Link: " + interview.meeting_link) if interview.meeting_link else ""}\n\n'
            f'AtonixDev Talent Team'
        ),
    )


def notify_rejection(application):
    """Send rejection notice."""
    broadcast_event('application.rejected', {
        'application_id': str(application.id),
        'applicant': application.full_name,
        'job': application.job.title,
    })
    _create_notification(
        application=application,
        notification_type='application_rejected',
        subject=f'Update on Your Application — {application.job.title}',
        body=(
            f'Dear {application.first_name},\n\n'
            f'Thank you for applying for the {application.job.title} position. '
            f'After careful consideration, we have decided to move forward with other candidates '
            f'whose experience more closely matches our current needs.\n\n'
            f'We encourage you to apply again when new positions open.\n\n'
            f'AtonixDev Talent Team'
        ),
    )


def notify_offer_letter(application):
    """Send offer letter notification."""
    broadcast_event('application.offer_extended', {
        'application_id': str(application.id),
        'applicant': application.full_name,
        'job': application.job.title,
    })
    _create_notification(
        application=application,
        notification_type='offer_letter',
        subject=f'Offer Letter — {application.job.title} — AtonixDev',
        body=(
            f'Dear {application.first_name},\n\n'
            f'Congratulations! We are pleased to extend an offer for the {application.job.title} '
            f'position at AtonixDev.\n\n'
            f'Our HR team will follow up shortly with the full offer details and next steps.\n\n'
            f'Welcome to the AtonixDev team!\n\n'
            f'Samuel Realm\nFounder, AtonixDev'
        ),
    )


def notify_hire_confirmed(application, employee):
    """Broadcast hire confirmation."""
    broadcast_event('employee.hired', {
        'application_id': str(application.id),
        'employee_id': employee.employee_id,
        'name': employee.full_name,
        'department': employee.department,
        'role': employee.role,
    })


def notify_status_changed(application, old_status, new_status):
    """Broadcast real-time status change (HR/admin feed)."""
    broadcast_event('application.status_changed', {
        'application_id': str(application.id),
        'applicant': application.full_name,
        'from_status': old_status,
        'to_status': new_status,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _create_notification(application, notification_type, subject, body, actor=None):
    """Persist notification record. Email delivery stub (extend with email backend)."""
    try:
        EmploymentNotification.objects.create(
            application=application,
            recipient_email=application.email,
            recipient_name=application.full_name,
            notification_type=notification_type,
            subject=subject,
            body=body,
            status='sent',
            sent_at=timezone.now(),
            sent_by=actor,
        )
    except Exception as exc:
        log.warning('Failed to create employment notification: %s', exc)
