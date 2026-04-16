import base64
import difflib
import hashlib
import logging
from io import BytesIO
from pathlib import Path

from bs4 import BeautifulSoup
from django.conf import settings
from django.core.files.base import ContentFile
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)


class ScrapingService:
    """Captures screenshots and HTML from competitor websites."""

    def capture(self, competitor):
        """
        Visit competitor URL, take screenshot, extract HTML.
        Returns the created Snapshot instance.
        """
        from .models import Snapshot

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                response = page.goto(
                    competitor.url,
                    wait_until="networkidle",
                    timeout=30000,
                )
                status_code = response.status if response else None

                # Wait for page to settle
                page.wait_for_timeout(2000)

                # Take full-page screenshot
                screenshot_bytes = page.screenshot(full_page=True)

                # Extract page title and clean HTML
                page_title = page.title()
                html_content = page.content()

            except Exception as e:
                logger.error(f"Failed to scrape {competitor.url}: {e}")
                browser.close()
                raise

            browser.close()

        # Clean HTML for comparison (remove scripts, styles, etc.)
        clean_html = self._clean_html(html_content)

        # Save snapshot
        snapshot = Snapshot(
            competitor=competitor,
            html_content=clean_html,
            page_title=page_title,
            status_code=status_code,
        )

        # Save screenshot as image file
        filename = f"{competitor.id}_{hashlib.md5(screenshot_bytes[:1024]).hexdigest()[:8]}.png"
        snapshot.screenshot.save(filename, ContentFile(screenshot_bytes), save=False)
        snapshot.save()

        logger.info(f"Captured snapshot for {competitor.name}: {snapshot.id}")
        return snapshot

    def _clean_html(self, html):
        """Strip scripts, styles, and normalize HTML for diffing."""
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup(["script", "style", "noscript", "iframe"]):
            tag.decompose()

        return soup.get_text(separator="\n", strip=True)


class DiffService:
    """Detects meaningful changes between two snapshots."""

    def compare(self, old_snapshot, new_snapshot):
        """
        Compare two snapshots and return change data if significant.
        Returns dict with diff info, or None if no meaningful changes.
        """
        old_lines = old_snapshot.html_content.splitlines()
        new_lines = new_snapshot.html_content.splitlines()

        diff = list(difflib.unified_diff(
            old_lines, new_lines,
            fromfile="before", tofile="after",
            lineterm="",
        ))

        if not diff:
            return None

        added = [l[1:] for l in diff if l.startswith("+") and not l.startswith("+++")]
        removed = [l[1:] for l in diff if l.startswith("-") and not l.startswith("---")]

        # Filter out trivial changes (timestamps, session IDs, etc.)
        meaningful_added = [l for l in added if len(l.strip()) > 10]
        meaningful_removed = [l for l in removed if len(l.strip()) > 10]

        if not meaningful_added and not meaningful_removed:
            return None

        return {
            "added": meaningful_added[:50],  # Cap to avoid huge payloads
            "removed": meaningful_removed[:50],
            "added_count": len(meaningful_added),
            "removed_count": len(meaningful_removed),
            "diff_text": "\n".join(diff[:200]),
        }
