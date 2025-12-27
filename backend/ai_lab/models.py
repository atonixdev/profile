from django.conf import settings
from django.db import models


def dataset_upload_path(instance, filename: str) -> str:
    return f"ai_lab/datasets/{instance.created_by_id or 'anonymous'}/{filename}"


def model_upload_path(instance, filename: str) -> str:
    safe_version = instance.version or 'v0'
    return f"ai_lab/models/{instance.created_by_id or 'anonymous'}/{instance.name}/{safe_version}/{filename}"


class Dataset(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=dataset_upload_path)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_datasets',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.name


class ModelArtifact(models.Model):
    name = models.CharField(max_length=200)
    version = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    file = models.FileField(upload_to=model_upload_path)
    metrics = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_model_artifacts',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        if self.version:
            return f"{self.name} ({self.version})"
        return self.name
