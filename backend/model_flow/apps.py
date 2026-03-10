from django.apps import AppConfig


class ModelFlowConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'model_flow'
    verbose_name = 'Model Flow Engine'
