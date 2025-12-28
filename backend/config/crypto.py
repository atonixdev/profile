from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from hashlib import sha256
from typing import Optional

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PrivateKey,
        Ed25519PublicKey,
    )
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        NoEncryption,
        PrivateFormat,
        PublicFormat,
        load_pem_private_key,
        load_pem_public_key,
    )
except Exception as e:  # pragma: no cover
    raise ImproperlyConfigured(
        "cryptography package is required. Add 'cryptography' to requirements.txt"
    ) from e


def _b64decode(s: str) -> bytes:
    return base64.b64decode(s.encode("utf-8"))


def _b64encode(b: bytes) -> str:
    return base64.b64encode(b).decode("utf-8")


def get_field_encryption_key() -> bytes:
    """Return a 32-byte key for AES-256-GCM.

    In production (DEBUG=False), this must be provided via env var.
    In DEBUG, we allow deriving from SECRET_KEY to keep local dev simple.
    """

    key_b64 = os.getenv("FIELD_ENCRYPTION_KEY_B64") or os.getenv("FIELD_ENCRYPTION_KEY")
    if key_b64:
        key = _b64decode(key_b64)
        if len(key) != 32:
            raise ImproperlyConfigured("FIELD_ENCRYPTION_KEY_B64 must decode to 32 bytes")
        return key

    if settings.DEBUG:
        # Dev fallback: derive a 32-byte key from Django SECRET_KEY.
        # Not intended for production use.
        return sha256((settings.SECRET_KEY + "|field-encryption").encode("utf-8")).digest()

    raise ImproperlyConfigured("FIELD_ENCRYPTION_KEY_B64 is required when DEBUG=False")


def encrypt_text(plaintext: str) -> str:
    if plaintext is None:
        return ""
    if plaintext == "":
        return ""

    key = get_field_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), associated_data=None)
    return _b64encode(nonce + ct)


def decrypt_text(token: str) -> str:
    if not token:
        return ""

    raw = _b64decode(token)
    if len(raw) < 13:
        return ""

    nonce = raw[:12]
    ct = raw[12:]
    key = get_field_encryption_key()
    aesgcm = AESGCM(key)
    pt = aesgcm.decrypt(nonce, ct, associated_data=None)
    return pt.decode("utf-8")


@dataclass(frozen=True)
class Ed25519Keypair:
    key_id: str
    private_key: Optional[Ed25519PrivateKey]
    public_key: Optional[Ed25519PublicKey]


def load_ed25519_keys_from_settings(prefix: str) -> Ed25519Keypair:
    """Loads Ed25519 keys from settings.

    Expected settings keys:
    - {PREFIX}_KEY_ID
    - {PREFIX}_PRIVATE_KEY_B64 or {PREFIX}_PRIVATE_KEY_PEM
    - {PREFIX}_PUBLIC_KEY_B64 or {PREFIX}_PUBLIC_KEY_PEM

    For B64, use raw 32-byte seeds/public keys.
    """

    key_id = getattr(settings, f"{prefix}_KEY_ID", "v1")

    priv_b64 = getattr(settings, f"{prefix}_PRIVATE_KEY_B64", None)
    priv_pem = getattr(settings, f"{prefix}_PRIVATE_KEY_PEM", None)
    pub_b64 = getattr(settings, f"{prefix}_PUBLIC_KEY_B64", None)
    pub_pem = getattr(settings, f"{prefix}_PUBLIC_KEY_PEM", None)

    private_key = None
    public_key = None

    if priv_b64:
        seed = _b64decode(priv_b64)
        if len(seed) != 32:
            raise ImproperlyConfigured(f"{prefix}_PRIVATE_KEY_B64 must decode to 32 bytes")
        private_key = Ed25519PrivateKey.from_private_bytes(seed)
        public_key = private_key.public_key()
    elif priv_pem:
        private_key = load_pem_private_key(priv_pem.encode("utf-8"), password=None)
        if isinstance(private_key, Ed25519PrivateKey):
            public_key = private_key.public_key()
        else:
            raise ImproperlyConfigured(f"{prefix}_PRIVATE_KEY_PEM must be an Ed25519 private key")

    if pub_b64:
        raw = _b64decode(pub_b64)
        if len(raw) != 32:
            raise ImproperlyConfigured(f"{prefix}_PUBLIC_KEY_B64 must decode to 32 bytes")
        public_key = Ed25519PublicKey.from_public_bytes(raw)
    elif pub_pem:
        loaded = load_pem_public_key(pub_pem.encode("utf-8"))
        if isinstance(loaded, Ed25519PublicKey):
            public_key = loaded
        else:
            raise ImproperlyConfigured(f"{prefix}_PUBLIC_KEY_PEM must be an Ed25519 public key")

    return Ed25519Keypair(key_id=key_id, private_key=private_key, public_key=public_key)


def canonical_json_bytes(data: dict) -> bytes:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return sha256(data).hexdigest()


def generate_ed25519_keypair_b64() -> tuple[str, str]:
    """Returns (private_seed_b64, public_key_b64)."""
    private = Ed25519PrivateKey.generate()
    seed = private.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
    pub = private.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    return _b64encode(seed), _b64encode(pub)
