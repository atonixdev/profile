from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SSHKeyViewSet, GPGKeyViewSet

router = DefaultRouter()
router.register(r'ssh-keys', SSHKeyViewSet, basename='ssh-keys')
router.register(r'gpg-keys', GPGKeyViewSet, basename='gpg-keys')

urlpatterns = [
    path('', include(router.urls)),
]
