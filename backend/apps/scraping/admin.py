from django.contrib import admin

from .models import Snapshot


@admin.register(Snapshot)
class SnapshotAdmin(admin.ModelAdmin):
    list_display = ("competitor", "page_title", "status_code", "captured_at")
    list_filter = ("status_code",)
