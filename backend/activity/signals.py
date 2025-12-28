from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from .models import ActivityEvent


def _should_track(instance):
    # Prevent infinite recursion: creating an ActivityEvent triggers post_save again.
    if isinstance(instance, ActivityEvent):
        return False
    # Avoid tracking ContentType churn from get_for_model.
    if isinstance(instance, ContentType):
        return False

    # Allow configuration to limit tracked apps/models
    include_apps = getattr(settings, 'ACTIVITY_INCLUDE_APPS', [])
    exclude_apps = set(getattr(settings, 'ACTIVITY_EXCLUDE_APPS', []))
    app_label = instance._meta.app_label
    if include_apps and app_label not in include_apps:
        return False
    if app_label in exclude_apps:
        return False
    return True


@receiver(post_save)
def on_post_save(sender, instance, created, **kwargs):
    if not getattr(settings, 'ACTIVITY_TRACKING_ENABLED', True):
        return
    if not _should_track(instance):
        return
    try:
        ct = ContentType.objects.get_for_model(instance.__class__)
        ActivityEvent.objects.create(
            actor=None,  # actor unknown at signal time
            action='create' if created else 'update',
            object_type=ct,
            object_id=str(getattr(instance, 'pk')),
            path=f"signal:{ct.app_label}.{ct.model}",
            method='SIGNAL',
        )
    except Exception:
        pass


@receiver(post_delete)
def on_post_delete(sender, instance, **kwargs):
    if not getattr(settings, 'ACTIVITY_TRACKING_ENABLED', True):
        return
    if not _should_track(instance):
        return
    try:
        ct = ContentType.objects.get_for_model(instance.__class__)
        ActivityEvent.objects.create(
            actor=None,
            action='delete',
            object_type=ct,
            object_id=str(getattr(instance, 'pk')),
            path=f"signal:{ct.app_label}.{ct.model}",
            method='SIGNAL',
        )
    except Exception:
        pass
