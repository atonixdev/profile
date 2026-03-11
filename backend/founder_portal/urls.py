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

    # Resource endpoints
    path('directives/',                     views.DirectiveListView.as_view(),          name='directives'),
    path('stakeholders/',                   views.StakeholderListView.as_view(),        name='stakeholders'),
    path('audit/',                          views.AuditLogListView.as_view(),           name='audit'),
]
