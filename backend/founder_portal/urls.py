from django.urls import path
from . import views

app_name = 'founder_portal'

urlpatterns = [
    # Dashboard endpoints
    path('dashboard/executive/',            views.ExecutiveDashboardView.as_view(),     name='executive'),
    path('dashboard/investor/',             views.InvestorHubView.as_view(),            name='investor'),
    path('dashboard/team/',                 views.TeamManagementView.as_view(),         name='team'),
    path('dashboard/financial-compliance/', views.FinancialComplianceView.as_view(),    name='financial-compliance'),
    path('dashboard/vision/',               views.VisionNarrativeView.as_view(),        name='vision'),
    path('dashboard/developer/',            views.DeveloperDashboardView.as_view(),     name='developer'),
    path('dashboard/marketing/',            views.MarketingDashboardView.as_view(),     name='marketing'),
    path('dashboard/branding/',             views.BrandingSystemsView.as_view(),        name='branding'),

    # Resource endpoints (read-only lists)
    path('directives/',                     views.DirectiveListView.as_view(),          name='directives'),
    path('stakeholders/',                   views.StakeholderListView.as_view(),        name='stakeholders'),
    path('audit/',                          views.AuditLogListView.as_view(),           name='audit'),

    # Directive CRUD
    path('directives/manage/',              views.DirectiveCRUDView.as_view(),          name='directive-manage'),

    # Cultural Guideline CRUD
    path('guidelines/',                     views.GuidelineCRUDView.as_view(),          name='guidelines'),

    # Tasks (Kanban)
    path('tasks/',                          views.TaskListView.as_view(),               name='tasks'),
    path('tasks/<uuid:pk>/',                views.TaskDetailView.as_view(),             name='task-detail'),

    # OKRs
    path('okrs/',                           views.OKRListView.as_view(),                name='okrs'),
    path('okrs/<uuid:pk>/',                 views.OKRDetailView.as_view(),              name='okr-detail'),

    # Secure Messaging
    path('messages/',                       views.MessageListView.as_view(),            name='messages'),
    path('messages/<uuid:pk>/read/',        views.MessageReadView.as_view(),            name='message-read'),

    # Deployments
    path('deployments/',                    views.DeploymentListView.as_view(),         name='deployments'),
    path('deployments/<uuid:pk>/',          views.DeploymentDetailView.as_view(),       name='deployment-detail'),

    # Monitoring Alerts
    path('alerts/',                         views.AlertListView.as_view(),              name='alerts'),
    path('alerts/<uuid:pk>/action/',        views.AlertActionView.as_view(),            name='alert-action'),

    # Campaigns
    path('campaigns/',                      views.CampaignListView.as_view(),           name='campaigns'),
    path('campaigns/<uuid:pk>/',            views.CampaignDetailView.as_view(),         name='campaign-detail'),

    # Design Standards
    path('design-standards/',               views.DesignStandardListView.as_view(),     name='design-standards'),

    # Investor Updates
    path('investor-updates/',               views.InvestorUpdateListView.as_view(),     name='investor-updates'),
    path('investor-updates/<uuid:pk>/',     views.InvestorUpdateDetailView.as_view(),   name='investor-update-detail'),
    path('investor-updates/<uuid:pk>/send/',views.InvestorUpdateSendView.as_view(),     name='investor-update-send'),

    # Integrations
    path('integrations/',                   views.IntegrationListView.as_view(),        name='integrations'),

    # Working Dashboard (Registry & Permission Management)
    path('working-dashboard/',              views.WorkingDashboardView.as_view(),       name='working-dashboard'),
    path('dashboard-permissions/',          views.DashboardPermissionView.as_view(),    name='dashboard-permissions'),
    path('dashboard-permissions/<uuid:pk>/', views.DashboardPermissionView.as_view(),   name='dashboard-permission-detail'),
]
