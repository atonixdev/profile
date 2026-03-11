from django.urls import path
from . import views

urlpatterns = [
    # 8 Financial Dashboards
    path('dashboard/master/',               views.MasterFinanceDashboardView.as_view()),
    path('dashboard/revenue/',              views.ProductRevenueView.as_view()),
    path('dashboard/cost/',                 views.ProductCostView.as_view()),
    path('dashboard/budget-forecast/',      views.BudgetForecastingView.as_view()),
    path('dashboard/billing-payments/',     views.BillingPaymentsView.as_view()),
    path('dashboard/department/',           views.DepartmentFinancialView.as_view()),
    path('dashboard/vendor-procurement/',   views.VendorProcurementView.as_view()),
    path('dashboard/compliance-audit/',     views.ComplianceAuditView.as_view()),

    # Resource Lists/Details
    path('departments/',                    views.DepartmentListView.as_view()),
    path('budgets/',                        views.BudgetListView.as_view()),
    path('forecasts/',                      views.ForecastListView.as_view()),
    path('vendors/',                        views.VendorListView.as_view()),
    path('procurement/',                    views.ProcurementListView.as_view()),
    path('compliance/',                     views.ComplianceListView.as_view()),
    path('audit/',                          views.AuditListView.as_view()),
]
