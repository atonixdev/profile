from django.contrib import admin
from .models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'client_company', 'rating', 'is_featured', 'is_published', 'order']
    list_filter = ['rating', 'is_featured', 'is_published']
    search_fields = ['client_name', 'client_company', 'content']
    list_editable = ['order', 'is_featured', 'is_published']
