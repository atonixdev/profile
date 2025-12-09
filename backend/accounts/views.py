from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Profile
from .serializers import ProfileSerializer
from community.models import CommunityMember


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read access to everyone,
    but write access only to admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    # Validation
    if not username or not email or not password:
        return Response(
            {'error': 'username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create profile
        profile, created = Profile.objects.get_or_create(user=user)

        # Create community member
        CommunityMember.objects.get_or_create(
            user=user,
            defaults={
                'role': 'member',
                'bio': '',
                'is_active': True
            }
        )

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'message': 'User registered successfully'
            },
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.filter(is_active=True)
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile"""
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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
