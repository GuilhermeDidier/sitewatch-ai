from django.conf import settings
from rest_framework import serializers

from apps.scraping.urlsafety import UnsafeURL, ensure_public_url

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

    def validate_url(self, value):
        try:
            ensure_public_url(value)
        except UnsafeURL as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        if self.instance is None and user.competitors.count() >= settings.MAX_COMPETITORS_PER_USER:
            raise serializers.ValidationError(
                f"An account can monitor up to {settings.MAX_COMPETITORS_PER_USER} competitors."
            )
        return attrs
