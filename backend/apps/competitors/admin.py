from django.contrib import admin

from .models import Competitor


@admin.register(Competitor)
class CompetitorAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "url")
