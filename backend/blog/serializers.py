from rest_framework import serializers
from .models import BlogPost, BlogComment

class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['id', 'name', 'email', 'content', 'created_at', 'is_approved']
        read_only_fields = ['id', 'created_at', 'is_approved']


class BlogPostSerializer(serializers.ModelSerializer):
    comments = BlogCommentSerializer(many=True, read_only=True)
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'author',
            'category', 'featured_image', 'tags', 'tags_list', 'is_published',
            'created_at', 'updated_at', 'read_time', 'view_count', 'comments'
            , 'integrity_hash', 'integrity_signature', 'integrity_key_id', 'integrity_signed_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'view_count', 'integrity_hash', 'integrity_signature', 'integrity_key_id', 'integrity_signed_at']

    def get_tags_list(self, obj):
        return obj.get_tags_list()


class BlogPostListSerializer(serializers.ModelSerializer):
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'category',
            'featured_image', 'tags', 'tags_list', 'created_at',
            'read_time', 'view_count'
        ]

    def get_tags_list(self, obj):
        return obj.get_tags_list()
