from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    CommunityMemberViewSet, DiscussionViewSet, DiscussionReplyViewSet,
    EventViewSet, ResourceViewSet, CommunityStatisticViewSet
)

router = SimpleRouter()
router.register(r'members', CommunityMemberViewSet, basename='community-member')
router.register(r'discussions', DiscussionViewSet, basename='discussion')
router.register(r'replies', DiscussionReplyViewSet, basename='discussion-reply')
router.register(r'events', EventViewSet, basename='event')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'statistics', CommunityStatisticViewSet, basename='community-statistic')

app_name = 'community'

urlpatterns = [
    path('', include(router.urls)),
]
