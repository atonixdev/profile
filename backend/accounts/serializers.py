from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
