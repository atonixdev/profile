from django.apps import AppConfig
import sys


class ActivityConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'activity'

    def ready(self):
        # Avoid registering signals during migrations to prevent FK issues
        if any(cmd in sys.argv for cmd in ('migrate', 'makemigrations', 'collectstatic')):
            return
        from . import signals  # noqa
