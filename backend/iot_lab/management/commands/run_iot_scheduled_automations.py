from __future__ import annotations

from django.core.management.base import BaseCommand

from iot_lab.automation_engine import run_jobs_for_event


class Command(BaseCommand):
    help = "Run IoT automation jobs for the given event type (default: scheduler)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--event",
            default="scheduler",
            choices=["scheduler", "manual"],
            help="Automation event type (scheduler or manual).",
        )

    def handle(self, *args, **options):
        event_type = options["event"]
        results = run_jobs_for_event(event_type=event_type)

        executed = [r for r in results if r[1] == "executed"]
        failed = [r for r in results if r[1] == "failed"]

        self.stdout.write(self.style.SUCCESS(f"IoT automations: executed={len(executed)} failed={len(failed)}"))
        if failed:
            self.stdout.write(self.style.ERROR(f"Failed jobs: {[job_id for job_id, _ in failed]}"))
            # Non-zero exit to surface failures in cron/CI.
            raise SystemExit(2)
