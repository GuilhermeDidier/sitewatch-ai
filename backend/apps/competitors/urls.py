from django.urls import path

from . import views

urlpatterns = [
    path("", views.CompetitorListCreateView.as_view(), name="competitor-list"),
    path("<int:pk>/", views.CompetitorDetailView.as_view(), name="competitor-detail"),
    path("<int:pk>/scrape/", views.ScrapeCompetitorView.as_view(), name="competitor-scrape"),
]
