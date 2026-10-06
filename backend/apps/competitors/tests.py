from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APITestCase

from apps.competitors.models import Competitor

User = get_user_model()


class DemoAccountIsReadOnly(APITestCase):
    """The demo login is public, so it must not be able to change or spend anything."""

    def setUp(self):
        call_command("seed_demo", verbosity=0)
        self.demo = User.objects.get(email=settings.DEMO_USER_EMAIL)
        self.competitor = Competitor.objects.filter(user=self.demo).first()
        self.client.force_authenticate(self.demo)

    def test_demo_can_read(self):
        response = self.client.get("/api/competitors/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

    def test_demo_cannot_create(self):
        response = self.client.post(
            "/api/competitors/", {"name": "X", "url": "https://x.example"}
        )
        self.assertEqual(response.status_code, 403)

    def test_demo_cannot_edit_or_delete(self):
        url = f"/api/competitors/{self.competitor.id}/"
        self.assertEqual(self.client.patch(url, {"name": "X"}).status_code, 403)
        self.assertEqual(self.client.delete(url).status_code, 403)
        self.assertTrue(Competitor.objects.filter(pk=self.competitor.pk).exists())

    def test_demo_cannot_trigger_a_scrape(self):
        response = self.client.post(f"/api/competitors/{self.competitor.id}/scrape/")
        self.assertEqual(response.status_code, 403)

    def test_a_regular_account_can_still_write(self):
        user = User.objects.create_user(email="owner@example.com", password="x" * 12)
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/competitors/", {"name": "X", "url": "https://x.example"}
        )
        self.assertEqual(response.status_code, 201)


class SeedDemo(APITestCase):
    def test_seeds_the_demo_account_even_when_another_user_came_first(self):
        User.objects.create_user(email="first@example.com", password="x" * 12)
        call_command("seed_demo", verbosity=0)
        demo = User.objects.get(email=settings.DEMO_USER_EMAIL)
        self.assertTrue(demo.check_password(settings.DEMO_USER_PASSWORD))
        self.assertEqual(Competitor.objects.filter(user=demo).count(), 3)

    def test_competitors_are_fictional(self):
        call_command("seed_demo", verbosity=0)
        for competitor in Competitor.objects.all():
            self.assertTrue(
                competitor.url.split("/")[2].endswith(".example"), competitor.url
            )
