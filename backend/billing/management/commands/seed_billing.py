"""
Management command: seed_billing
Usage:
    python manage.py seed_billing
    python manage.py seed_billing --clear   # drop all billing data first

Seeds:
- PricingRules for all 9 services
- 3 sample Organizations (starter / pro / enterprise)
- Sample UsageEvents per org
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid, random, datetime

User = get_user_model()


PRICING_DEFAULTS = [
    # (service,       unit_type,       unit_price)
    ('compute',    'vm_hour',      Decimal('0.045')),
    ('storage',    'gb',           Decimal('0.023')),
    ('email',      'email',        Decimal('0.001')),
    ('domain',     'domain',       Decimal('12.00')),
    ('pipeline',   'pipeline_run', Decimal('0.008')),
    ('networking', 'gb_transfer',  Decimal('0.09')),
    ('monitoring', 'agent_hour',   Decimal('0.02')),
    ('auth',       'api_call',     Decimal('0.0005')),
    ('secrets',    'key',          Decimal('0.10')),
]

ORG_SEEDS = [
    {'name': 'AcmeCorp',   'slug': 'acmecorp',  'plan': 'enterprise'},
    {'name': 'Beta Labs',  'slug': 'beta-labs', 'plan': 'pro'},
    {'name': 'Hobby Dev',  'slug': 'hobby-dev', 'plan': 'starter'},
]

EVENT_TEMPLATES = [
    # (service, event_type, unit_type, min_units, max_units)
    ('compute',    'vm.started',       'vm_hour',      1,    72),
    ('storage',    'object.written',   'gb',           1,   500),
    ('email',      'message.sent',     'email',      100,  5000),
    ('pipeline',   'run.completed',    'pipeline_run', 1,    20),
    ('networking', 'egress.charged',   'gb_transfer',  1,   100),
    ('monitoring', 'agent.heartbeat',  'agent_hour',   1,    24),
    ('auth',       'token.issued',     'api_call',   100, 10000),
]


class Command(BaseCommand):
    help = 'Seed billing data: pricing rules, orgs, sample usage events'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear', action='store_true',
            help='Delete all billing data before seeding'
        )

    def handle(self, *args, **options):
        from billing.models import (
            Organization, PricingRule, UsageEvent, OrgBalance, BillingAuditLog,
            LedgerEntry, Invoice, InvoiceLineItem, Credit, Payment,
        )
        from billing.services import process_event

        if options['clear']:
            self.stdout.write('Clearing billing data…')
            for Model in [
                BillingAuditLog, Payment, Credit, InvoiceLineItem, Invoice,
                LedgerEntry, OrgBalance, UsageEvent, Organization, PricingRule,
            ]:
                deleted, _ = Model.objects.all().delete()
                self.stdout.write(f'  deleted {deleted} {Model.__name__} rows')

        # ── Pricing Rules ─────────────────────────────────────────────────────
        self.stdout.write('Seeding pricing rules…')
        admin_user = User.objects.filter(is_superuser=True).first()
        for service, unit_type, price in PRICING_DEFAULTS:
            rule, created = PricingRule.objects.get_or_create(
                service=service, unit_type=unit_type, version=1,
                defaults={
                    'unit_price':     price,
                    'is_active':      True,
                    'effective_from': timezone.now(),
                    'created_by':     admin_user,
                },
            )
            self.stdout.write(f'  {"+" if created else "~"} {service}/{unit_type} @ ${price}')

        # ── Organizations ─────────────────────────────────────────────────────
        self.stdout.write('Seeding organizations…')
        orgs = []
        for seed in ORG_SEEDS:
            org, created = Organization.objects.get_or_create(
                slug=seed['slug'],
                defaults={
                    'name':   seed['name'],
                    'plan':   seed['plan'],
                    'status': 'active',
                    'owner':  admin_user,
                },
            )
            orgs.append(org)
            self.stdout.write(f'  {"+" if created else "~"} {org.name} ({org.plan})')

        # ── Usage Events ──────────────────────────────────────────────────────
        self.stdout.write('Seeding usage events…')
        now = timezone.now()
        total_created = 0
        for org in orgs:
            multiplier = {'starter': 1, 'pro': 3, 'enterprise': 6}.get(org.plan, 1)
            for service, event_type, unit_type, lo, hi in EVENT_TEMPLATES:
                for _ in range(multiplier):
                    days_ago = random.randint(0, 30)
                    hours_ago = random.randint(0, 23)
                    ts = now - datetime.timedelta(days=days_ago, hours=hours_ago)
                    units = Decimal(str(random.randint(lo, hi)))
                    payload = {
                        'event_id':        str(uuid.uuid4()),
                        'service':         service,
                        'event_type':      event_type,
                        'organization_id': str(org.id),
                        'units':           str(units),
                        'unit_type':       unit_type,
                        'timestamp':       ts.isoformat(),
                    }
                    try:
                        ev = process_event(payload, source_ip='127.0.0.1')
                        if ev.status == 'processed':
                            total_created += 1
                    except Exception as exc:
                        self.stderr.write(f'  !! {service}/{event_type}: {exc}')

        self.stdout.write(self.style.SUCCESS(
            f'Done. {total_created} usage events processed.'
        ))
