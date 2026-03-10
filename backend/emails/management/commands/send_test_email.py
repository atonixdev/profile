"""
Management command — send a test login notification email.

Usage:
    python manage.py send_test_email --to ofidohub@gmail.com
    python manage.py send_test_email --to ofidohub@gmail.com --type new_login
    python manage.py send_test_email --to ofidohub@gmail.com --type account_created
"""
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Send a test transactional email via EmailService'

    def add_arguments(self, parser):
        parser.add_argument('--to',   required=True, help='Recipient email address')
        parser.add_argument('--type', default='new_login',
                            help='Email type (default: new_login). Options: new_login, account_created, password_reset, security_alert, email_verification')
        parser.add_argument('--name', default='AtonixDev Test User', help='Display name in the email')

    def handle(self, *args, **options):
        from emails.service import EmailService

        recipient  = options['to']
        email_type = options['type']
        name       = options['name']
        now        = timezone.now().strftime('%Y-%m-%d %H:%M UTC')

        # Build context for whichever template type is chosen
        context_map = {
            'new_login': {
                'name':        name,
                'ip_address':  '127.0.0.1 (test)',
                'user_agent':  'Test / Management Command',
                'login_time':  now,
                'secure_url':  'https://atonixdev.org/settings/security',
                'dashboard_url': 'https://atonixdev.org/dashboard',
            },
            'account_created': {
                'name':          name,
                'dashboard_url': 'https://atonixdev.org/dashboard',
            },
            'password_reset': {
                'name':      name,
                'reset_url': 'https://atonixdev.org/reset-password?token=TEST_TOKEN',
                'ip_address': '127.0.0.1 (test)',
            },
            'email_verification': {
                'name':             name,
                'verification_url': 'https://atonixdev.org/verify-email?token=TEST_TOKEN',
            },
            'security_alert': {
                'name':        name,
                'alert_title': 'Test Security Alert',
                'alert_body':  'This is a test security alert sent from the management command to verify your email setup.',
                'ip_address':  '127.0.0.1 (test)',
                'event_time':  now,
                'action_url':  'https://atonixdev.org/settings/security',
                'action_label': 'Review Security',
            },
        }

        context = context_map.get(email_type, context_map['new_login'])

        self.stdout.write(f'Sending [{email_type}] test email to {recipient} ...')

        ok = EmailService.send(
            email_type=email_type,
            recipient=recipient,
            context=context,
            ip_address='127.0.0.1',
        )

        if ok:
            self.stdout.write(self.style.SUCCESS(f'✓ Email sent successfully to {recipient}'))
        else:
            self.stdout.write(self.style.ERROR(f'✗ Email failed — check logs above for details'))
