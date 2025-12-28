from __future__ import annotations

from django.core.management.base import BaseCommand

from accounts.models import Profile


class Command(BaseCommand):
    help = "Encrypt existing plaintext MFA TOTP secrets at rest"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Show what would change without writing")
        parser.add_argument("--limit", type=int, default=0, help="Optional limit of profiles to process")

    def handle(self, *args, **options):
        dry_run = bool(options.get("dry_run"))
        limit = int(options.get("limit") or 0)

        qs = Profile.objects.exclude(mfa_totp_secret='')
        updated = 0
        scanned = 0

        for profile in qs.iterator():
            scanned += 1
            raw = profile.mfa_totp_secret or ''
            if Profile._is_encrypted_secret(raw):
                continue

            if dry_run:
                self.stdout.write(f"would encrypt profile_id={profile.id} user_id={profile.user_id}")
            else:
                secret = raw
                profile.set_totp_secret(secret)
                profile.save(update_fields=["mfa_totp_secret"]) 
                self.stdout.write(f"encrypted profile_id={profile.id} user_id={profile.user_id}")

            updated += 1
            if limit and updated >= limit:
                break

        self.stdout.write(self.style.SUCCESS(f"Scanned {scanned}; updated {updated}{' (dry-run)' if dry_run else ''}"))
