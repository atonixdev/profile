from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'category', 'tags',
            'tags_list', 'author', 'author_name', 'featured_image',
            'published', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)