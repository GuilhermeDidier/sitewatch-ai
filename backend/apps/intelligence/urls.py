from django.urls import path

from . import views

urlpatterns = [
    path("snapshots/", views.SnapshotListView.as_view(), name="snapshot-list"),
    path("changes/", views.ChangeListView.as_view(), name="change-list"),
    path("insights/", views.InsightListView.as_view(), name="insight-list"),
]
