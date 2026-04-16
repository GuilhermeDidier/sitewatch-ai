from rest_framework import serializers

from apps.scraping.models import Snapshot

from .models import Change, Insight


class SnapshotSerializer(serializers.ModelSerializer):
    competitor_name = serializers.CharField(source="competitor.name", read_only=True)

    class Meta:
        model = Snapshot
        fields = (
            "id",
            "competitor",
            "competitor_name",
            "screenshot",
            "page_title",
            "status_code",
            "captured_at",
        )


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ("id", "analysis", "recommendations", "created_at")


class ChangeSerializer(serializers.ModelSerializer):
    competitor_name = serializers.CharField(
        source="competitor.name", read_only=True
    )
    insight = InsightSerializer(read_only=True)

    class Meta:
        model = Change
        fields = (
            "id",
            "competitor",
            "competitor_name",
            "change_type",
            "summary",
            "significance",
            "snapshot_before",
            "snapshot_after",
            "insight",
            "detected_at",
        )
