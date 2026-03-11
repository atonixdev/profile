"""AtonixDev Social Hub — URL patterns."""
from django.urls import path
from . import views

urlpatterns = [
    # OAuth
    path('oauth/<str:platform>/initiate', views.OAuthInitiateView.as_view(),  name='social_oauth_initiate'),
    path('oauth/<str:platform>/callback', views.OAuthCallbackView.as_view(),  name='social_oauth_callback'),

    # Accounts
    path('accounts/',        views.SocialAccountListView.as_view(),   name='social_accounts_list'),
    path('accounts/<uuid:pk>/', views.SocialAccountDetailView.as_view(), name='social_account_detail'),

    # Posts
    path('posts/',              views.SocialPostListCreateView.as_view(), name='social_posts_list_create'),
    path('posts/<uuid:pk>/',    views.SocialPostDetailView.as_view(),     name='social_post_detail'),
    path('posts/<uuid:pk>/publish/', views.SocialPostPublishView.as_view(), name='social_post_publish'),

    # Media
    path('media/upload',    views.MediaUploadView.as_view(),      name='social_media_upload'),
    path('media/',          views.MediaAssetListView.as_view(),   name='social_media_list'),
    path('media/<uuid:pk>/', views.MediaAssetDetailView.as_view(), name='social_media_detail'),

    # Analytics
    path('analytics/posts/<uuid:post_pk>/', views.PostAnalyticsView.as_view(),    name='social_post_analytics'),
    path('analytics/overview',              views.AnalyticsOverviewView.as_view(), name='social_analytics_overview'),

    # Audit
    path('audit/', views.SocialAuditLogListView.as_view(), name='social_audit_list'),
]
