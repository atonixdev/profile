import uuid
import secrets
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from config.crypto import decrypt_text, encrypt_text


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, help_text="e.g., Full-Stack Developer, Designer")
    bio = models.TextField(help_text="Short introduction about yourself")
    about = models.TextField(help_text="Detailed background and story")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Social Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    gitlab_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # Skills
    skills = models.JSONField(default=list, help_text="List of skills")
    
    # Settings
    is_active = models.BooleanField(default=True)

    # MFA (TOTP)
    mfa_enabled = models.BooleanField(default=False)
    # Stores an encrypted token with a prefix (enc:v1:...), or empty string.
    # Max length must accommodate base64 ciphertext.
    mfa_totp_secret = models.CharField(max_length=255, blank=True, default='')

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.full_name

    @staticmethod
    def _is_encrypted_secret(value: str) -> bool:
        return isinstance(value, str) and value.startswith('enc:v1:')

    def set_totp_secret(self, secret: str) -> None:
        if not secret:
            self.mfa_totp_secret = ''
            return
        token = encrypt_text(secret)
        self.mfa_totp_secret = f'enc:v1:{token}'

    def get_totp_secret(self) -> str:
        raw = self.mfa_totp_secret or ''
        if not raw:
            return ''
        if self._is_encrypted_secret(raw):
            token = raw.split('enc:v1:', 1)[1]
            try:
                return decrypt_text(token)
            except Exception:
                # If key changes or data is corrupted, fail closed.
                return ''
        # Legacy plaintext value (pre-encryption)
        return raw


def _gen_verification_code():
    """Generate a cryptographically random 6-digit code."""
    return str(secrets.randbelow(900000) + 100000)  # 100000–999999


class EmailVerificationToken(models.Model):
    """One-time token sent to users after registration to verify their email address."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification_token')
    token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    code = models.CharField(max_length=6, default=_gen_verification_code)
    created_at = models.DateTimeField(auto_now_add=True)

    _EXPIRY_HOURS = 24

    def is_valid(self) -> bool:
        return timezone.now() < self.created_at + timedelta(hours=self._EXPIRY_HOURS)

    def __str__(self):
        return f'VerificationToken({self.user.username})'
