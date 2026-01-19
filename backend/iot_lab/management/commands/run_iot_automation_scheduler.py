from __future__ import annotations

import time

from django.core.management.base import BaseCommand

from iot_lab.automation_engine import AutomationContext, run_job
from iot_lab.models import AutomationJob


class Command(BaseCommand):
    help = "Run IoT automation scheduler loop (interval + offline triggers)."

    def add_arguments(self, parser):
        parser.add_argument('--sleep', type=float, default=2.0, help='Sleep between loops (seconds)')
        parser.add_argument('--once', action='store_true', help='Run a single pass then exit')

    def handle(self, *args, **options):
        sleep_s = float(options['sleep'] or 2.0)
        once = bool(options['once'])

        ctx = AutomationContext(event_type='scheduler')

        while True:
            jobs = AutomationJob.objects.filter(is_active=True).order_by('id')
            for job in jobs:
                try:
                    # run_job() will mark skipped/succeeded/failed and handle trigger evaluation.
                    run_job(job, ctx)
                except Exception:
                    # Never crash the scheduler loop on a single job.
                    continue

            if once:
                break
            time.sleep(sleep_s)
