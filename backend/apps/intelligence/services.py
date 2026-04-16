import base64
import json
import logging

import anthropic
from django.conf import settings

from .models import Change, Insight

logger = logging.getLogger(__name__)


class IntelligenceService:
    """Uses Claude to analyze competitor changes and generate insights."""

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def analyze_change(self, change: Change) -> Insight:
        """
        Send change data + screenshots to Claude for strategic analysis.
        Returns created Insight instance.
        """
        # Build the prompt with context
        competitor = change.competitor
        prompt = self._build_prompt(competitor, change)

        # Build message content
        content = []

        # Add before screenshot if available
        before_img = self._read_screenshot(change.snapshot_before)
        if before_img:
            content.append({
                "type": "text",
                "text": "BEFORE screenshot:",
            })
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": before_img,
                },
            })

        # Add after screenshot
        after_img = self._read_screenshot(change.snapshot_after)
        if after_img:
            content.append({
                "type": "text",
                "text": "AFTER screenshot:",
            })
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": after_img,
                },
            })

        content.append({"type": "text", "text": prompt})

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": content}],
            )

            result = response.content[0].text
            parsed = self._parse_response(result)

            # Classify the change type based on analysis
            change.change_type = parsed.get("change_type", Change.ChangeType.OTHER)
            change.significance = parsed.get("significance", 5)
            change.save()

            insight = Insight.objects.create(
                change=change,
                analysis=parsed["analysis"],
                recommendations=parsed.get("recommendations", []),
            )

            logger.info(f"Generated insight for change {change.id}")
            return insight

        except Exception as e:
            logger.error(f"Failed to analyze change {change.id}: {e}")
            raise

    def _build_prompt(self, competitor, change):
        diff_data = change.diff_data

        return f"""You are a competitive intelligence analyst. Analyze the following website change.

COMPETITOR: {competitor.name}
URL: {competitor.url}
BUSINESS CONTEXT: {competitor.context or 'Not provided'}

CONTENT CHANGES DETECTED:
- Lines added: {diff_data.get('added_count', 0)}
- Lines removed: {diff_data.get('removed_count', 0)}

ADDED CONTENT (sample):
{chr(10).join(diff_data.get('added', [])[:20])}

REMOVED CONTENT (sample):
{chr(10).join(diff_data.get('removed', [])[:20])}

Respond in this exact JSON format:
{{
    "change_type": one of ["pricing", "feature", "content", "design", "new_page", "removed", "other"],
    "significance": integer 1-10 (10 = major strategic move),
    "analysis": "2-4 sentences explaining what changed and what it likely means strategically",
    "recommendations": ["actionable recommendation 1", "actionable recommendation 2"]
}}

Be specific and strategic. Don't just describe what changed — explain WHY they likely made this change and what it signals about their strategy."""

    def _read_screenshot(self, snapshot):
        """Read screenshot file and return base64 string."""
        try:
            if snapshot.screenshot and snapshot.screenshot.path:
                with open(snapshot.screenshot.path, "rb") as f:
                    return base64.b64encode(f.read()).decode("utf-8")
        except Exception as e:
            logger.warning(f"Could not read screenshot for snapshot {snapshot.id}: {e}")
        return None

    def _parse_response(self, text):
        """Parse Claude's JSON response, with fallback."""
        try:
            # Try to extract JSON from response
            start = text.index("{")
            end = text.rindex("}") + 1
            return json.loads(text[start:end])
        except (ValueError, json.JSONDecodeError):
            # Fallback: return raw text as analysis
            return {
                "change_type": "other",
                "significance": 5,
                "analysis": text,
                "recommendations": [],
            }
