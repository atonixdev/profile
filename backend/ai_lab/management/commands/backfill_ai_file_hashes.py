from __future__ import annotations

from django.core.management.base import BaseCommand

from ai_lab.models import Dataset, ModelArtifact


class Command(BaseCommand):
    help = "Backfill SHA-256 integrity hashes for existing AI uploads"

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=0, help="Optional limit of rows to process")

    def handle(self, *args, **options):
        limit = int(options.get("limit") or 0)
        processed = 0

        qs1 = Dataset.objects.exclude(file='').filter(file_sha256='')
        qs2 = ModelArtifact.objects.exclude(file='').filter(file_sha256='')

        if limit:
            qs1 = qs1[:limit]

        for obj in qs1:
            obj.save()
            processed += 1
            self.stdout.write(f"dataset {obj.id} hashed")
            if limit and processed >= limit:
                break

        if limit and processed >= limit:
            return

        remaining = 0
        if limit:
            remaining = max(limit - processed, 0)
            qs2 = qs2[:remaining]

        for obj in qs2:
            obj.save()
            processed += 1
            self.stdout.write(f"modelartifact {obj.id} hashed")

        self.stdout.write(self.style.SUCCESS(f"Done. Updated {processed} rows"))
