from django.urls import path
from . import views

urlpatterns = [
    # Platform summaries
    path('summary/platform/', views.PlatformSummaryView.as_view()),
    path('summary/usage/',    views.PlatformUsageSummaryView.as_view()),

    # Event stream
    path('events/',        views.EventListView.as_view()),
    path('events/ingest/', views.EventIngestView.as_view()),

    # Organizations
    path('organizations/',                             views.OrganizationListView.as_view()),
    path('organizations/<uuid:org_id>/',               views.OrganizationDetailView.as_view()),
    path('organizations/<uuid:org_id>/usage/',         views.OrgUsageView.as_view()),
    path('organizations/<uuid:org_id>/invoices/',      views.OrgInvoicesView.as_view()),

    # Invoices
    path('invoices/',                                  views.InvoiceListView.as_view()),
    path('invoices/generate/',                         views.InvoiceGenerateView.as_view()),
    path('invoices/<uuid:invoice_id>/',                views.InvoiceDetailView.as_view()),
    path('invoices/<uuid:invoice_id>/payment/',        views.InvoicePaymentView.as_view()),

    # Credits
    path('credits/',       views.CreditListView.as_view()),
    path('credits/issue/', views.CreditIssueView.as_view()),

    # Ledger
    path('ledger/', views.LedgerView.as_view()),

    # Audit
    path('audit/', views.AuditLogView.as_view()),

    # Pricing rules
    path('pricing/', views.PricingRuleListView.as_view()),

    # User-level endpoints (§3.7)
    path('users/<int:user_id>/usage/',   views.UserUsageView.as_view()),
    path('users/<int:user_id>/billing/', views.UserBillingView.as_view()),

    # Service-level endpoints (§3.7)
    path('services/<str:service>/usage/',   views.ServiceUsageView.as_view()),
    path('services/<str:service>/billing/', views.ServiceBillingView.as_view()),

    # Operational metrics (§4.5 Monitoring & Observability)
    path('metrics/', views.BillingMetricsView.as_view()),
]
