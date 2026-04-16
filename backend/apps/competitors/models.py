from django.conf import settings
from django.db import models


class Competitor(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="competitors",
    )
    name = models.CharField(max_length=200)
    url = models.URLField()
    context = models.TextField(
        blank=True,
        help_text="Business context: what they do, what to watch for",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["user", "url"]

    def __str__(self):
        return f"{self.name} ({self.url})"
