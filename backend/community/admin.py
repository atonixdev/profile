from django.contrib import admin
from .models import CommunityMember, Discussion, DiscussionReply, Event, EventAttendee, Resource, CommunityStatistic


@admin.register(CommunityMember)
class CommunityMemberAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'role', 'contribution_points', 'joined_date', 'is_active')
    list_filter = ('role', 'is_active', 'joined_date')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'bio')
    readonly_fields = ('joined_date', 'updated_at', 'contribution_points')
    fieldsets = (
        ('User Info', {'fields': ('user', 'role', 'is_active')}),
        ('Profile', {'fields': ('bio', 'expertise_areas', 'profile_image', 'location')}),
        ('Links', {'fields': ('website_url', 'github_url', 'linkedin_url', 'twitter_url')}),
        ('Stats', {'fields': ('contribution_points', 'joined_date', 'updated_at')}),
    )
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Full Name'


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'status', 'view_count', 'like_count', 'created_at')
    list_filter = ('category', 'status', 'is_pinned', 'created_at')
    search_fields = ('title', 'content', 'tags')
    readonly_fields = ('slug', 'view_count', 'like_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'content', 'author')}),
        ('Settings', {'fields': ('category', 'status', 'is_pinned')}),
        ('Meta', {'fields': ('tags', 'view_count', 'like_count', 'created_at', 'updated_at')}),
    )
    actions = ['pin_discussions', 'unpin_discussions', 'close_discussions']
    
    def pin_discussions(self, request, queryset):
        queryset.update(is_pinned=True)
    pin_discussions.short_description = 'Pin selected discussions'
    
    def unpin_discussions(self, request, queryset):
        queryset.update(is_pinned=False)
    unpin_discussions.short_description = 'Unpin selected discussions'
    
    def close_discussions(self, request, queryset):
        queryset.update(status='closed')
    close_discussions.short_description = 'Close selected discussions'


@admin.register(DiscussionReply)
class DiscussionReplyAdmin(admin.ModelAdmin):
    list_display = ('get_author_name', 'discussion', 'is_solution', 'like_count', 'created_at')
    list_filter = ('is_solution', 'created_at')
    search_fields = ('content', 'author__user__username', 'discussion__title')
    readonly_fields = ('created_at', 'updated_at', 'like_count')
    fieldsets = (
        ('Reply', {'fields': ('discussion', 'author', 'content')}),
        ('Settings', {'fields': ('is_solution',)}),
        ('Meta', {'fields': ('like_count', 'created_at', 'updated_at')}),
    )
    actions = ['mark_as_solution', 'unmark_as_solution']
    
    def get_author_name(self, obj):
        return obj.author.user.get_full_name() or obj.author.user.username
    get_author_name.short_description = 'Author'
    
    def mark_as_solution(self, request, queryset):
        queryset.update(is_solution=True)
    mark_as_solution.short_description = 'Mark as solution'
    
    def unmark_as_solution(self, request, queryset):
        queryset.update(is_solution=False)
    unmark_as_solution.short_description = 'Unmark as solution'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'event_date', 'is_online', 'attendee_count', 'is_published')
    list_filter = ('event_type', 'is_online', 'is_published', 'event_date')
    search_fields = ('title', 'description', 'tags')
    readonly_fields = ('slug', 'created_at', 'updated_at', 'attendee_count')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Event Info', {'fields': ('title', 'slug', 'description', 'event_type', 'organizer')}),
        ('Schedule', {'fields': ('event_date', 'end_date')}),
        ('Location', {'fields': ('is_online', 'location', 'meeting_link')}),
        ('Media', {'fields': ('featured_image',)}),
        ('Registration', {'fields': ('capacity', 'registration_link', 'attendee_count')}),
        ('Publishing', {'fields': ('is_published', 'tags', 'created_at', 'updated_at')}),
    )


@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('get_member_name', 'event', 'attended', 'registered_at')
    list_filter = ('attended', 'registered_at', 'event')
    search_fields = ('member__user__username', 'event__title')
    readonly_fields = ('registered_at',)
    
    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username
    get_member_name.short_description = 'Member'


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource_type', 'category', 'difficulty_level', 'featured', 'view_count', 'is_published')
    list_filter = ('resource_type', 'category', 'difficulty_level', 'featured', 'is_published')
    search_fields = ('title', 'description', 'tags')
    readonly_fields = ('slug', 'view_count', 'like_count', 'created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'description', 'content', 'author')}),
        ('Settings', {'fields': ('resource_type', 'category', 'difficulty_level')}),
        ('Links', {'fields': ('resource_url',)}),
        ('Publishing', {'fields': ('is_published', 'featured', 'tags')}),
        ('Stats', {'fields': ('view_count', 'like_count', 'created_at', 'updated_at')}),
    )
    actions = ['feature_resources', 'unfeature_resources', 'publish_resources', 'unpublish_resources']
    
    def feature_resources(self, request, queryset):
        queryset.update(featured=True)
    feature_resources.short_description = 'Feature selected resources'
    
    def unfeature_resources(self, request, queryset):
        queryset.update(featured=False)
    unfeature_resources.short_description = 'Unfeature selected resources'
    
    def publish_resources(self, request, queryset):
        queryset.update(is_published=True)
    publish_resources.short_description = 'Publish selected resources'
    
    def unpublish_resources(self, request, queryset):
        queryset.update(is_published=False)
    unpublish_resources.short_description = 'Unpublish selected resources'


@admin.register(CommunityStatistic)
class CommunityStatisticAdmin(admin.ModelAdmin):
    list_display = ('total_members', 'total_discussions', 'total_events', 'total_resources', 'last_updated')
    readonly_fields = ('total_members', 'total_discussions', 'total_events', 'total_resources', 'weekly_active_members', 'last_updated')
