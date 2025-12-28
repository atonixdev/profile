from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Optional

from django.utils import timezone

from config.crypto import canonical_json_bytes, load_ed25519_keys_from_settings, sha256_hex


def _b64encode(b: bytes) -> str:
    return base64.b64encode(b).decode("utf-8")


def _b64decode(s: str) -> bytes:
    return base64.b64decode(s.encode("utf-8"))


@dataclass(frozen=True)
class BlogSignatureResult:
    valid: bool
    reason: str
    key_id: str


def blog_payload(post) -> dict:
    """Canonical payload for blog post integrity.

    Signatures are intended to prove content authenticity and tamper detection.
    """

    return {
        "id": post.id,
        "slug": post.slug,
        "title": post.title,
        "author": post.author,
        "category": post.category,
        "is_published": bool(post.is_published),
        "content_sha256": post.integrity_hash,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
    }


def compute_integrity_hash(post) -> str:
    # Hash content + important metadata. Keep it stable and easy to recompute.
    blob = f"{post.title}\n{post.excerpt}\n{post.content}".encode("utf-8")
    return sha256_hex(blob)


def sign_post(post) -> tuple[str, str, timezone.datetime]:
    """Returns (signature_b64, key_id, signed_at). Requires private key."""

    keys = load_ed25519_keys_from_settings("BLOG_SIGNING")
    if keys.private_key is None:
        raise RuntimeError("BLOG_SIGNING private key is not configured")

    payload = blog_payload(post)
    msg = canonical_json_bytes(payload)
    sig = keys.private_key.sign(msg)
    return _b64encode(sig), keys.key_id, timezone.now()


def verify_post_signature(post) -> BlogSignatureResult:
    if not post.integrity_signature:
        return BlogSignatureResult(valid=False, reason="missing signature", key_id=post.integrity_key_id or "")
    if not post.integrity_hash:
        return BlogSignatureResult(valid=False, reason="missing hash", key_id=post.integrity_key_id or "")

    keys = load_ed25519_keys_from_settings("BLOG_SIGNING")
    public = keys.public_key
    if public is None and keys.private_key is not None:
        public = keys.private_key.public_key()

    if public is None:
        return BlogSignatureResult(valid=False, reason="public key not configured", key_id=post.integrity_key_id or keys.key_id)

    payload = blog_payload(post)
    msg = canonical_json_bytes(payload)
    try:
        public.verify(_b64decode(post.integrity_signature), msg)
        return BlogSignatureResult(valid=True, reason="ok", key_id=post.integrity_key_id or keys.key_id)
    except Exception:
        return BlogSignatureResult(valid=False, reason="invalid signature", key_id=post.integrity_key_id or keys.key_id)
