import difflib
import hashlib
import logging

import requests
from bs4 import BeautifulSoup
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}


class ScrapingService:
    """Captures HTML from competitor websites."""

    def capture(self, competitor):
        from .models import Snapshot

        try:
            resp = requests.get(
                competitor.url,
                headers=HEADERS,
                timeout=30,
                allow_redirects=True,
            )
            status_code = resp.status_code
            html_raw = resp.text
        except Exception as e:
            logger.error(f"Failed to fetch {competitor.url}: {e}")
            raise

        soup = BeautifulSoup(html_raw, "html.parser")
        page_title = soup.title.string.strip() if soup.title and soup.title.string else ""
        clean_html = self._clean_html(html_raw)

        snapshot = Snapshot(
            competitor=competitor,
            html_content=clean_html,
            page_title=page_title,
            status_code=status_code,
        )
        snapshot.save()

        logger.info(f"Captured snapshot for {competitor.name}: {snapshot.id}")
        return snapshot

    def _clean_html(self, html):
        """Strip scripts, styles, and normalize HTML for diffing."""
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup(["script", "style", "noscript", "iframe", "svg"]):
            tag.decompose()

        return soup.get_text(separator="\n", strip=True)


class DiffService:
    """Detects meaningful changes between two snapshots."""

    def compare(self, old_snapshot, new_snapshot):
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

        meaningful_added = [l for l in added if len(l.strip()) > 10]
        meaningful_removed = [l for l in removed if len(l.strip()) > 10]

        if not meaningful_added and not meaningful_removed:
            return None

        return {
            "added": meaningful_added[:50],
            "removed": meaningful_removed[:50],
            "added_count": len(meaningful_added),
            "removed_count": len(meaningful_removed),
            "diff_text": "\n".join(diff[:200]),
        }
