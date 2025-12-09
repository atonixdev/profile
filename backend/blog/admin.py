from django.contrib import admin
from .models import BlogPost, BlogComment


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'is_published', 'created_at', 'view_count']
    list_filter = ['category', 'is_published', 'created_at']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'excerpt', 'content')}),
        ('Metadata', {'fields': ('author', 'category', 'tags', 'featured_image')}),
        ('Publishing', {'fields': ('is_published', 'read_time')}),
        ('Stats', {'fields': ('view_count', 'created_at', 'updated_at')}),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'post', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['name', 'email', 'content']
    readonly_fields = ['created_at']
    actions = ['approve_comments']

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = 'Approve selected comments'
