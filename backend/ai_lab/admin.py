from django.contrib import admin

from .models import Dataset, ModelArtifact


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'created_by', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(ModelArtifact)
class ModelArtifactAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'version', 'created_at', 'created_by', 'is_active')
    search_fields = ('name', 'version')
    list_filter = ('is_active',)
