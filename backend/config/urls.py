"""
URL configuration for Personal Brand Hub project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.jwt import EmailOrUsernameTokenObtainPairView
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('sitemap.xml', views.sitemap, name='sitemap'),
    path('robots.txt', views.robots, name='robots'),
    path('api/status/', views.api_status, name='api_status'),
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/services/', include('services.urls')),
    path('api/testimonials/', include('testimonials.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/community/', include('community.urls')),
    path('api/', include('activity.urls')),
    path('api/chatbot/', include('chatbot_service.urls')),
    path('api/research-lab/', include('research_lab.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
