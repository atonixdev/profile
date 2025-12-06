from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'title', 'is_active']
    search_fields = ['full_name', 'title', 'bio']
