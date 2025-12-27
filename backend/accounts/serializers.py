from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id', 'full_name', 'title', 'bio', 'about', 'avatar', 'resume',
            'email', 'phone', 'location', 'linkedin_url', 'github_url',
            'twitter_url', 'gitlab_url', 'website_url', 'skills', 'is_active',
            'updated_at', 'created_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CurrentUserProfileSerializer(ProfileSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta(ProfileSerializer.Meta):
        fields = ['username', 'first_name', 'last_name', 'user_email'] + list(ProfileSerializer.Meta.fields)


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
