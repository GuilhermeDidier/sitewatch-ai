import socket
from unittest import mock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase

from apps.competitors.models import Competitor
from apps.scraping.services import fetch_public
from apps.scraping.urlsafety import UnsafeURL

User = get_user_model()

# Hostnames the tests resolve without touching the network.
FAKE_DNS = {
    "localhost": "127.0.0.1",
    "x.example": "93.184.215.14",
    "public.example": "93.184.215.14",
    "internal.example": "10.0.0.5",
    "metadata.example": "169.254.169.254",
}


def fake_getaddrinfo(host, port, *args, **kwargs):
    try:
        ip = FAKE_DNS[host]
    except KeyError:
        ip = host  # an IP literal resolves to itself
    return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, port or 80))]


resolve = mock.patch("apps.scraping.urlsafety.socket.getaddrinfo", side_effect=fake_getaddrinfo)


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

    @resolve
    def test_a_regular_account_can_still_write(self, _dns):
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


@resolve
class ScraperOnlyReachesThePublicInternet(APITestCase):
    """Sign-up is open, so a user-supplied URL must not let anyone read our own network."""

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(email="owner@example.com", password="x" * 12)
        self.client.force_authenticate(self.user)

    def add(self, url):
        return self.client.post("/api/competitors/", {"name": "X", "url": url})

    def test_refuses_private_loopback_and_metadata_addresses(self, _dns):
        for url in (
            "http://127.0.0.1:8000/admin/",
            "http://localhost/",
            "http://10.0.0.5/",
            "http://[::1]/",
            "http://169.254.169.254/latest/meta-data/",
            "http://internal.example/",
            "http://metadata.example/",
        ):
            with self.subTest(url=url):
                response = self.add(url)
                self.assertEqual(response.status_code, 400, url)
                self.assertIn("url", response.data)
        self.assertFalse(Competitor.objects.exists())

    def test_refuses_non_http_schemes(self, _dns):
        self.assertEqual(self.add("ftp://public.example/").status_code, 400)

    def test_accepts_a_public_site(self, _dns):
        self.assertEqual(self.add("https://public.example/pricing").status_code, 201)

    def test_cannot_move_an_existing_competitor_onto_a_private_address(self, _dns):
        competitor = Competitor.objects.create(user=self.user, name="X", url="https://public.example/")
        response = self.client.patch(f"/api/competitors/{competitor.id}/", {"url": "http://10.0.0.5/"})
        self.assertEqual(response.status_code, 400)

    def test_a_redirect_into_the_private_network_is_not_followed(self, _dns):
        redirect = mock.Mock(is_redirect=True, headers={"location": "http://169.254.169.254/"})
        with mock.patch("apps.scraping.services.requests.get", return_value=redirect) as get:
            with self.assertRaises(UnsafeURL):
                fetch_public("https://public.example/")
        self.assertEqual(get.call_count, 1)

    def test_scan_of_a_url_that_now_resolves_privately_is_refused(self, _dns):
        competitor = Competitor.objects.create(user=self.user, name="X", url="https://internal.example/")
        with mock.patch("apps.scraping.services.requests.get") as get:
            response = self.client.post(f"/api/competitors/{competitor.id}/scrape/")
        self.assertEqual(response.status_code, 400)
        get.assert_not_called()


@resolve
class ScanCostIsBounded(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(email="owner@example.com", password="x" * 12)
        self.client.force_authenticate(self.user)

    def test_an_account_cannot_add_unlimited_competitors(self, _dns):
        for i in range(settings.MAX_COMPETITORS_PER_USER):
            Competitor.objects.create(user=self.user, name=f"C{i}", url=f"https://public.example/{i}")
        response = self.client.post("/api/competitors/", {"name": "X", "url": "https://public.example/more"})
        self.assertEqual(response.status_code, 400)

    def test_scans_are_rate_limited_per_account(self, _dns):
        competitor = Competitor.objects.create(user=self.user, name="X", url="https://public.example/")
        limit = int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["scrape"].split("/")[0])
        with mock.patch("apps.scraping.tasks.scrape_competitor.delay") as delay:
            delay.return_value = mock.Mock(result={})
            codes = [
                self.client.post(f"/api/competitors/{competitor.id}/scrape/").status_code
                for _ in range(limit + 1)
            ]
        self.assertEqual(codes[:limit], [200] * limit)
        self.assertEqual(codes[-1], 429)
        self.assertEqual(delay.call_count, limit)

    def test_sign_up_is_rate_limited(self, _dns):
        self.client.force_authenticate(None)
        limit = int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["register"].split("/")[0])
        codes = [
            self.client.post(
                "/api/auth/register/", {"email": f"u{i}@example.com", "password": "x" * 12}
            ).status_code
            for i in range(limit + 1)
        ]
        self.assertEqual(codes[:limit], [201] * limit)
        self.assertEqual(codes[-1], 429)
