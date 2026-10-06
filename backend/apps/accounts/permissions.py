from django.conf import settings
from rest_framework.permissions import SAFE_METHODS, BasePermission


class DemoAccountReadOnly(BasePermission):
    """Anyone can sign in as the demo user, so it may look but not change or spend."""

    message = "The demo account is read-only. Create an account to add competitors and run scans."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return not (user and user.is_authenticated and user.email == settings.DEMO_USER_EMAIL)
