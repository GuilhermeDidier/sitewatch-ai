from django.db import models


class Snapshot(models.Model):
    competitor = models.ForeignKey(
        "competitors.Competitor",
        on_delete=models.CASCADE,
        related_name="snapshots",
    )
    screenshot = models.ImageField(upload_to="screenshots/%Y/%m/%d/", blank=True)
    html_content = models.TextField(blank=True)
    page_title = models.CharField(max_length=500, blank=True)
    status_code = models.IntegerField(null=True)
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]
        get_latest_by = "captured_at"

    def __str__(self):
        return f"Snapshot of {self.competitor.name} at {self.captured_at}"
