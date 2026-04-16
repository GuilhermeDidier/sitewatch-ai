from rest_framework import generics

from apps.scraping.models import Snapshot

from .models import Change, Insight
from .serializers import ChangeSerializer, InsightSerializer, SnapshotSerializer


class SnapshotListView(generics.ListAPIView):
    serializer_class = SnapshotSerializer

    def get_queryset(self):
        qs = Snapshot.objects.filter(competitor__user=self.request.user)
        competitor_id = self.request.query_params.get("competitor")
        if competitor_id:
            qs = qs.filter(competitor_id=competitor_id)
        return qs.select_related("competitor")


class ChangeListView(generics.ListAPIView):
    serializer_class = ChangeSerializer

    def get_queryset(self):
        qs = Change.objects.filter(competitor__user=self.request.user)
        competitor_id = self.request.query_params.get("competitor")
        if competitor_id:
            qs = qs.filter(competitor_id=competitor_id)
        return qs.select_related("competitor", "insight")


class InsightListView(generics.ListAPIView):
    serializer_class = InsightSerializer

    def get_queryset(self):
        return Insight.objects.filter(
            change__competitor__user=self.request.user
        ).select_related("change")
