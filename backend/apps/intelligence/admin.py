from django.contrib import admin

from .models import Change, Insight


@admin.register(Change)
class ChangeAdmin(admin.ModelAdmin):
    list_display = ("competitor", "change_type", "significance", "detected_at")
    list_filter = ("change_type", "significance")


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ("change", "created_at")
