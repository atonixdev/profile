from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'is_published', 'order', 'created_at']
    list_filter = ['category', 'is_featured', 'is_published']
    search_fields = ['title', 'description', 'client']
    list_editable = ['order', 'is_featured', 'is_published']
