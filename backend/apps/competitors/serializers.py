from rest_framework import serializers

from .models import Competitor


class CompetitorSerializer(serializers.ModelSerializer):
    snapshot_count = serializers.IntegerField(source="snapshots.count", read_only=True)
    change_count = serializers.IntegerField(source="changes.count", read_only=True)

    class Meta:
        model = Competitor
        fields = (
            "id",
            "name",
            "url",
            "context",
            "is_active",
            "snapshot_count",
            "change_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
