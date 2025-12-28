from __future__ import annotations

from django.core.management.base import BaseCommand

from blog.models import BlogPost
from config.crypto import generate_ed25519_keypair_b64
from blog.signing import sign_post


class Command(BaseCommand):
    help = "Sign blog posts with Ed25519 for authenticity/integrity"

    def add_arguments(self, parser):
        parser.add_argument("--slug", type=str, default="", help="Sign a single post by slug")
        parser.add_argument(
            "--all-published",
            action="store_true",
            help="Sign all published posts",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-sign even if a signature is already present",
        )

    def handle(self, *args, **options):
        slug = (options.get("slug") or "").strip()
        all_published = bool(options.get("all_published"))
        force = bool(options.get("force"))

        if not slug and not all_published:
            self.stderr.write("Provide --slug <slug> or --all-published")
            return

        qs = BlogPost.objects.all()
        if all_published:
            qs = qs.filter(is_published=True)
        if slug:
            qs = qs.filter(slug=slug)

        posts = list(qs)
        if not posts:
            self.stderr.write("No matching posts")
            return

        try:
            for post in posts:
                if post.integrity_signature and not force:
                    self.stdout.write(f"skip {post.slug} (already signed)")
                    continue

                sig_b64, key_id, signed_at = sign_post(post)
                post.integrity_signature = sig_b64
                post.integrity_key_id = key_id
                post.integrity_signed_at = signed_at
                post.save(update_fields=["integrity_signature", "integrity_key_id", "integrity_signed_at", "integrity_hash", "updated_at"])
                self.stdout.write(f"signed {post.slug} key_id={key_id}")

        except RuntimeError as e:
            self.stderr.write(str(e))
            self.stderr.write("\nGenerate keys (base64) and put them in env vars:")
            priv_b64, pub_b64 = generate_ed25519_keypair_b64()
            self.stderr.write(f"  BLOG_SIGNING_KEY_ID=v1")
            self.stderr.write(f"  BLOG_SIGNING_PRIVATE_KEY_B64={priv_b64}")
            self.stderr.write(f"  BLOG_SIGNING_PUBLIC_KEY_B64={pub_b64}")
            raise
