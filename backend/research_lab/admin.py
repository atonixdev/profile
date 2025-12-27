from django.contrib import admin
from .models import Experiment, ExperimentRun


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ('id', 'slug', 'name', 'experiment_type', 'is_active', 'updated_at')
    list_filter = ('experiment_type', 'is_active')
    search_fields = ('slug', 'name')


@admin.register(ExperimentRun)
class ExperimentRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'experiment', 'user', 'status', 'created_at', 'started_at', 'finished_at')
    list_filter = ('status', 'experiment__experiment_type')
    search_fields = ('experiment__slug', 'experiment__name', 'user__username')
