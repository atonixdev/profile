from rest_framework import serializers
from .models import CommunityMember, Discussion, DiscussionReply, Event, EventAttendee, Resource, CommunityStatistic


class CommunityMemberSerializer(serializers.ModelSerializer):
    """Serializer for community member profiles"""
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = CommunityMember
        fields = [
            'id', 'user', 'username', 'full_name', 'email', 'role', 'bio', 'expertise_areas',
            'profile_image', 'location', 'website_url', 'github_url', 'linkedin_url', 'twitter_url',
            'is_active', 'joined_date', 'updated_at', 'contribution_points'
        ]
        read_only_fields = ['id', 'joined_date', 'updated_at']


class CommunityMemberListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for member listings"""
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CommunityMember
        fields = [
            'id', 'username', 'full_name', 'role', 'bio', 'profile_image', 'location',
            'contribution_points', 'joined_date'
        ]


class DiscussionReplySerializer(serializers.ModelSerializer):
    """Serializer for discussion replies"""
    author_info = CommunityMemberListSerializer(source='author', read_only=True)
    
    class Meta:
        model = DiscussionReply
        fields = ['id', 'discussion', 'author', 'author_info', 'content', 'is_solution', 'like_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'like_count']


class DiscussionSerializer(serializers.ModelSerializer):
    """Full discussion serializer with replies"""
    author_info = CommunityMemberListSerializer(source='author', read_only=True)
    replies = DiscussionReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'author_info', 'category', 'status', 'tags',
            'is_pinned', 'created_at', 'updated_at', 'view_count', 'like_count', 'replies', 'reply_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'view_count', 'like_count']
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class DiscussionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for discussion listings"""
    author_info = CommunityMemberListSerializer(source='author', read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'slug', 'author_info', 'category', 'status', 'is_pinned',
            'created_at', 'view_count', 'like_count', 'reply_count'
        ]
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class EventAttendeeSerializer(serializers.ModelSerializer):
    """Serializer for event attendees"""
    member_info = CommunityMemberListSerializer(source='member', read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = ['id', 'event', 'member', 'member_info', 'registered_at', 'attended']
        read_only_fields = ['id', 'registered_at']


class EventSerializer(serializers.ModelSerializer):
    """Full event serializer with attendees"""
    organizer_info = CommunityMemberListSerializer(source='organizer', read_only=True)
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'event_type', 'organizer', 'organizer_info',
            'event_date', 'end_date', 'location', 'is_online', 'meeting_link', 'capacity',
            'registration_link', 'featured_image', 'tags', 'is_published', 'created_at',
            'updated_at', 'attendee_count', 'attendees'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'attendees']


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event listings"""
    organizer_info = CommunityMemberListSerializer(source='organizer', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'event_type', 'organizer_info', 'event_date',
            'is_online', 'location', 'featured_image', 'attendee_count'
        ]


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for community resources"""
    author_info = CommunityMemberListSerializer(source='author', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'description', 'content', 'resource_type', 'author',
            'author_info', 'category', 'tags', 'resource_url', 'difficulty_level',
            'is_published', 'featured', 'created_at', 'updated_at', 'view_count', 'like_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'view_count', 'like_count']


class ResourceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for resource listings"""
    author_info = CommunityMemberListSerializer(source='author', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'description', 'resource_type', 'author_info', 'category',
            'difficulty_level', 'featured', 'created_at', 'view_count', 'like_count'
        ]


class CommunityStatisticSerializer(serializers.ModelSerializer):
    """Serializer for community statistics"""
    
    class Meta:
        model = CommunityStatistic
        fields = [
            'total_members', 'total_discussions', 'total_events', 'total_resources',
            'weekly_active_members', 'last_updated'
        ]
