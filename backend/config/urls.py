from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/competitors/", include("apps.competitors.urls")),
    path("api/intelligence/", include("apps.intelligence.urls")),
]
