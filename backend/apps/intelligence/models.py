from django.db import models


class Change(models.Model):
    class ChangeType(models.TextChoices):
        PRICING = "pricing", "Pricing Change"
        FEATURE = "feature", "New Feature"
        CONTENT = "content", "Content Update"
        DESIGN = "design", "Design Change"
        NEW_PAGE = "new_page", "New Page"
        REMOVED = "removed", "Content Removed"
        OTHER = "other", "Other"

    competitor = models.ForeignKey(
        "competitors.Competitor",
        on_delete=models.CASCADE,
        related_name="changes",
    )
    snapshot_before = models.ForeignKey(
        "scraping.Snapshot",
        on_delete=models.CASCADE,
        related_name="changes_before",
    )
    snapshot_after = models.ForeignKey(
        "scraping.Snapshot",
        on_delete=models.CASCADE,
        related_name="changes_after",
    )
    change_type = models.CharField(
        max_length=20,
        choices=ChangeType.choices,
        default=ChangeType.OTHER,
    )
    summary = models.TextField()
    diff_data = models.JSONField(
        default=dict,
        help_text="Structured diff: added/removed text blocks, changed elements",
    )
    significance = models.IntegerField(
        default=5,
        help_text="1-10 scale of how significant the change is",
    )
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-detected_at"]

    def __str__(self):
        return f"{self.get_change_type_display()} - {self.competitor.name}"


class Insight(models.Model):
    change = models.OneToOneField(
        Change,
        on_delete=models.CASCADE,
        related_name="insight",
    )
    analysis = models.TextField(
        help_text="Claude's strategic analysis of what this change means",
    )
    recommendations = models.JSONField(
        default=list,
        help_text="List of actionable recommendations",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Insight for {self.change}"
