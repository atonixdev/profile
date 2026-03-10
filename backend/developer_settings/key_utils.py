"""
Utility functions for parsing and validating SSH and GPG public keys.
All validation is done server-side. Client-provided metadata is never trusted.
"""
from __future__ import annotations

import base64
import hashlib
import struct

# ── SSH ───────────────────────────────────────────────────────────────────────

ALLOWED_SSH_ALGORITHMS = frozenset([
    'ssh-rsa',
    'ssh-ed25519',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'sk-ssh-ed25519@openssh.com',
])

_PRIVATE_KEY_MARKERS = [
    'BEGIN OPENSSH PRIVATE KEY',
    'BEGIN RSA PRIVATE KEY',
    'BEGIN EC PRIVATE KEY',
    'BEGIN DSA PRIVATE KEY',
    'BEGIN PGP PRIVATE KEY BLOCK',
]


def parse_ssh_public_key(key_str: str) -> tuple[str, str]:
    """
    Validate an SSH public key string.

    Returns (algorithm, sha256_fingerprint) on success.
    Raises ValueError with a descriptive message on failure.
    """
    key_str = key_str.strip()

    for marker in _PRIVATE_KEY_MARKERS:
        if marker in key_str:
            raise ValueError(
                "Private keys must never be submitted. "
                "Only paste your public key (.pub file)."
            )

    parts = key_str.split()
    if len(parts) < 2:
        raise ValueError(
            "Invalid SSH public key format. "
            "Expected format: <algorithm> <base64-key> [comment]"
        )

    algorithm = parts[0]
    if algorithm not in ALLOWED_SSH_ALGORITHMS:
        raise ValueError(
            f"Unsupported key algorithm '{algorithm}'. "
            f"Supported: {', '.join(sorted(ALLOWED_SSH_ALGORITHMS))}"
        )

    try:
        key_bytes = base64.b64decode(parts[1])
    except Exception:
        raise ValueError("SSH public key contains malformed base64 data.")

    if len(key_bytes) < 4:
        raise ValueError("SSH public key data is too short to be valid.")

    digest = hashlib.sha256(key_bytes).digest()
    fingerprint = "SHA256:" + base64.b64encode(digest).rstrip(b'=').decode()
    return algorithm, fingerprint


# ── GPG ───────────────────────────────────────────────────────────────────────

def _dearmor_pgp(armored_key: str) -> bytes:
    """Strip ASCII armor headers/footers and return raw decoded bytes."""
    lines = armored_key.strip().splitlines()
    body_lines: list[str] = []
    in_body = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('-----BEGIN'):
            in_body = True
            continue
        if stripped.startswith('-----END'):
            break
        if not in_body:
            continue
        # Skip armor headers (e.g. "Version: GnuPG v2") and empty separator line
        if stripped == '' or ':' in stripped:
            # The blank line separates headers from body in armor format
            if stripped == '' and not body_lines:
                continue  # still might be the blank separator
            if ':' in stripped:
                continue
        # Checksum line starts with '='
        if stripped.startswith('='):
            break
        body_lines.append(stripped)

    if not body_lines:
        raise ValueError("Could not extract base64 body from PGP key block.")

    try:
        return base64.b64decode(''.join(body_lines))
    except Exception as exc:
        raise ValueError(f"Base64 decode failed for PGP key block: {exc}") from exc


def _read_packet(data: bytes, offset: int) -> tuple[int | None, bytes, int]:
    """
    Read one OpenPGP packet from *data* starting at *offset*.
    Returns (tag, body_bytes, next_offset).
    Returns (None, b'', offset) at end of data.
    """
    if offset >= len(data):
        return None, b'', offset

    first = data[offset]
    if not (first & 0x80):
        raise ValueError(f"Invalid OpenPGP packet header byte 0x{first:02X} at offset {offset}")

    offset += 1

    if first & 0x40:  # New format (RFC 4880 §4.2)
        tag = first & 0x3F
        if offset >= len(data):
            return tag, b'', offset
        l0 = data[offset]
        offset += 1
        if l0 < 192:
            body_len = l0
        elif l0 < 224:
            if offset >= len(data):
                raise ValueError("Truncated new-format length")
            body_len = ((l0 - 192) << 8) + data[offset] + 192
            offset += 1
        elif l0 == 255:
            if offset + 4 > len(data):
                raise ValueError("Truncated 5-byte length")
            body_len = struct.unpack('>I', data[offset:offset + 4])[0]
            offset += 4
        else:
            # Partial body length — consume rest of data as approximation
            body_len = len(data) - offset
    else:  # Old format (RFC 4880 §4.2)
        tag = (first & 0x3C) >> 2
        len_type = first & 0x03
        if len_type == 0:
            body_len = data[offset]; offset += 1
        elif len_type == 1:
            body_len = struct.unpack('>H', data[offset:offset + 2])[0]; offset += 2
        elif len_type == 2:
            body_len = struct.unpack('>I', data[offset:offset + 4])[0]; offset += 4
        else:
            body_len = len(data) - offset

    body = data[offset:offset + body_len]
    return tag, body, offset + body_len


def parse_gpg_public_key(key_str: str) -> dict:
    """
    Validate and parse an ASCII-armored GPG public key.

    Returns a dict with: fingerprint, key_id, primary_user_id, expires_at.
    Raises ValueError with a descriptive message on failure.
    """
    key_str = key_str.strip()

    for marker in _PRIVATE_KEY_MARKERS:
        if marker in key_str:
            raise ValueError(
                "Private keys must never be submitted. "
                "Only paste your public key block (-----BEGIN PGP PUBLIC KEY BLOCK-----)."
            )

    if '-----BEGIN PGP PUBLIC KEY BLOCK-----' not in key_str:
        raise ValueError(
            "Invalid GPG public key. "
            "The key must begin with '-----BEGIN PGP PUBLIC KEY BLOCK-----'."
        )
    if '-----END PGP PUBLIC KEY BLOCK-----' not in key_str:
        raise ValueError(
            "Incomplete GPG public key block. "
            "Missing '-----END PGP PUBLIC KEY BLOCK-----'."
        )

    try:
        raw = _dearmor_pgp(key_str)
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Could not parse GPG key block: {exc}") from exc

    fingerprint: str | None = None
    key_id: str | None = None
    primary_user_id: str = ''

    offset = 0
    while offset < len(raw):
        try:
            tag, body, offset = _read_packet(raw, offset)
        except Exception:
            break
        if tag is None:
            break

        # Public-Key (6) or Public-Subkey (14) — compute V4 fingerprint
        if tag in (6, 14) and fingerprint is None:
            if len(body) < 6:
                continue
            version = body[0]
            if version == 4:
                # RFC 4880 §12.2: fingerprint = SHA1(0x99 || 2-byte-length || body)
                length_bytes = struct.pack('>H', len(body))
                fp_bytes = hashlib.sha1(b'\x99' + length_bytes + body).digest()
                fingerprint = fp_bytes.hex().upper()
                key_id = '0x' + fingerprint[-16:]

        # User ID packet (tag 13)
        elif tag == 13 and not primary_user_id:
            try:
                primary_user_id = body.decode('utf-8', errors='replace')
            except Exception:
                pass

    if fingerprint is None:
        raise ValueError(
            "Could not extract a valid fingerprint from the provided GPG key. "
            "Ensure the key is a V4 OpenPGP public key."
        )

    return {
        'fingerprint': fingerprint,
        'key_id': key_id or ('0x' + fingerprint[-16:]),
        'primary_user_id': primary_user_id,
        'expires_at': None,
    }
