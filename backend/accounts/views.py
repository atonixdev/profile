from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import transaction
from .models import Profile
from .serializers import ProfileSerializer, CurrentUserProfileSerializer, RegisterSerializer
from community.models import CommunityMember

import pyotp


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read access to everyone,
    but write access only to admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

            first_name = getattr(user, 'first_name', '') or ''
            last_name = getattr(user, 'last_name', '') or ''
            full_name = f"{first_name} {last_name}".strip() or user.username

            Profile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': full_name,
                    'title': 'Community Member',
                    'bio': 'New community member.',
                    'about': 'New community member.',
                    'email': user.email,
                    'skills': [],
                    'is_active': True,
                },
            )

            CommunityMember.objects.get_or_create(
                user=user,
                defaults={
                    'role': 'member',
                    'bio': '',
                    'is_active': True,
                },
            )

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'message': 'User registered successfully',
            },
            status=status.HTTP_201_CREATED,
        )


class MFASetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': getattr(request.user, 'username', 'User'),
                'title': 'Community Member',
                'bio': 'New community member.',
                'about': 'New community member.',
                'email': getattr(request.user, 'email', '') or '',
                'skills': [],
                'is_active': True,
            },
        )

        # Generate a new secret for setup (does not enable MFA until verified)
        secret = pyotp.random_base32()
        profile.set_totp_secret(secret)
        profile.mfa_enabled = False
        # Avoid update_fields here to handle edge cases where the instance is newly created
        # and an UPDATE would not affect any rows.
        profile.save()

        issuer = 'AtonixDev'
        label = getattr(request.user, 'email', '') or request.user.get_username()
        totp = pyotp.TOTP(secret)
        otpauth_url = totp.provisioning_uri(name=label, issuer_name=issuer)

        return Response({'otpauth_url': otpauth_url}, status=status.HTTP_200_OK)


class MFAEnableView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp = request.data.get('otp')
        if not otp:
            return Response({'detail': 'otp is required'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': getattr(request.user, 'username', 'User'),
                'title': 'Community Member',
                'bio': 'New community member.',
                'about': 'New community member.',
                'email': getattr(request.user, 'email', '') or '',
                'skills': [],
                'is_active': True,
            },
        )
        if not profile.mfa_totp_secret:
            return Response({'detail': 'MFA not set up. Call /mfa/setup first.'}, status=status.HTTP_400_BAD_REQUEST)

        secret = profile.get_totp_secret()
        if not secret:
            return Response({'detail': 'MFA secret unavailable'}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(secret)
        if not totp.verify(str(otp), valid_window=1):
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        profile.mfa_enabled = True
        profile.save()
        return Response({'message': 'MFA enabled'}, status=status.HTTP_200_OK)


class MFADisableView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp = request.data.get('otp')
        if not otp:
            return Response({'detail': 'otp is required'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': getattr(request.user, 'username', 'User'),
                'title': 'Community Member',
                'bio': 'New community member.',
                'about': 'New community member.',
                'email': getattr(request.user, 'email', '') or '',
                'skills': [],
                'is_active': True,
            },
        )

        if profile.mfa_enabled and profile.mfa_totp_secret:
            secret = profile.get_totp_secret()
            if not secret:
                return Response({'detail': 'MFA secret unavailable'}, status=status.HTTP_400_BAD_REQUEST)
            totp = pyotp.TOTP(secret)
            if not totp.verify(str(otp), valid_window=1):
                return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        profile.mfa_enabled = False
        profile.mfa_totp_secret = ''
        profile.save()
        return Response({'message': 'MFA disabled'}, status=status.HTTP_200_OK)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.filter(is_active=True)
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get the current user's profile"""
        user = request.user
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() or getattr(user, 'username', 'User')
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': full_name,
                'title': 'Community Member',
                'bio': 'New community member.',
                'about': 'New community member.',
                'email': getattr(user, 'email', '') or '',
                'skills': [],
                'is_active': True,
            },
        )
        serializer = CurrentUserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get the public profile (first active profile)"""
        try:
            profile = Profile.objects.filter(is_active=True).first()
            if profile:
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            return Response(
                {'error': 'No active profile found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
