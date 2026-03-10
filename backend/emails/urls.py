from django.urls import path
from .views import (
    EmailLogListView, SecurityAuditLogListView,
    EmailTemplateListView, EmailTemplateDetailView, EmailTemplatePreviewView,
    SenderIdentityListView, SenderIdentityDetailView,
    CampaignListView, CampaignDetailView, CampaignSendView, CampaignLogListView,
)

urlpatterns = [
    # Email logs
    path('email-logs/',           EmailLogListView.as_view(),        name='admin-email-logs'),
    path('security-audit/',       SecurityAuditLogListView.as_view(), name='admin-security-audit'),
    # Templates
    path('templates/',            EmailTemplateListView.as_view(),    name='admin-email-templates'),
    path('templates/<str:template_id>/',         EmailTemplateDetailView.as_view(),  name='admin-email-template-detail'),
    path('templates/<str:template_id>/preview/', EmailTemplatePreviewView.as_view(), name='admin-email-template-preview'),
    # Sender identities
    path('senders/',              SenderIdentityListView.as_view(),   name='admin-senders'),
    path('senders/<int:pk>/',     SenderIdentityDetailView.as_view(), name='admin-sender-detail'),
    # Campaigns
    path('campaigns/',            CampaignListView.as_view(),         name='admin-campaigns'),
    path('campaigns/<int:pk>/',   CampaignDetailView.as_view(),       name='admin-campaign-detail'),
    path('campaigns/<int:pk>/send/', CampaignSendView.as_view(),      name='admin-campaign-send'),
    path('campaigns/<int:pk>/logs/', CampaignLogListView.as_view(),   name='admin-campaign-logs'),
]
