"""Seed realistic demo data for portfolio showcase."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.competitors.models import Competitor
from apps.intelligence.models import Change, Insight
from apps.scraping.models import Snapshot

User = get_user_model()

COMPETITORS = [
    {
        "name": "Stripe",
        "url": "https://stripe.com",
        "context": "Leading payment processor — monitor pricing tiers, new API features, and developer tool launches",
    },
    {
        "name": "Lemonsqueezy",
        "url": "https://www.lemonsqueezy.com",
        "context": "Merchant of record for SaaS — watch for new integrations, pricing changes, and feature announcements",
    },
    {
        "name": "Paddle",
        "url": "https://www.paddle.com",
        "context": "Billing platform for SaaS — track positioning shifts, enterprise features, and global expansion",
    },
]

DEMO_CHANGES = [
    # Stripe changes
    {
        "competitor_idx": 0,
        "change_type": "pricing",
        "significance": 9,
        "summary": "Detected 14 additions and 8 removals in pricing section",
        "days_ago": 1,
        "diff_data": {
            "added": [
                "New: Starter plan at 2.7% + 30¢ per transaction",
                "Volume discounts now available for 100K+ transactions/month",
                "Custom enterprise pricing with dedicated support",
                "Free tier extended to $50K in processing volume",
            ],
            "removed": [
                "Standard rate: 2.9% + 30¢ per transaction",
                "Volume pricing available upon request",
            ],
            "added_count": 14,
            "removed_count": 8,
            "diff_text": "--- before\n+++ after\n-Standard rate: 2.9% + 30¢\n+Starter plan at 2.7% + 30¢",
        },
        "analysis": "Stripe has introduced a new tiered pricing structure, lowering their base rate from 2.9% to 2.7% with a 'Starter' plan. This is a direct competitive response to Lemonsqueezy and Paddle undercutting on fees. The free tier extension to $50K signals aggressive pursuit of early-stage startups — they're willing to sacrifice short-term revenue to lock in long-term platform dependency.",
        "recommendations": [
            "Consider matching or undercutting the 2.7% rate for your core segment before Stripe captures price-sensitive merchants",
            "Highlight value-added features (tax handling, subscription management) that justify any premium over Stripe's new rates",
            "Target the $50K-$100K revenue range where Stripe's new free tier ends — these merchants will be price-shopping",
        ],
    },
    {
        "competitor_idx": 0,
        "change_type": "feature",
        "significance": 8,
        "summary": "Detected 22 additions and 3 removals in product features",
        "days_ago": 5,
        "diff_data": {
            "added": [
                "Introducing Stripe AI Fraud Shield — ML-powered fraud detection",
                "Real-time fraud scoring with 99.7% accuracy",
                "Adaptive rules engine learns from your business patterns",
                "Zero additional cost for Stripe Scale users",
            ],
            "removed": [
                "Radar for Fraud Teams: $0.07 per screened transaction",
            ],
            "added_count": 22,
            "removed_count": 3,
            "diff_text": "--- before\n+++ after\n+Stripe AI Fraud Shield\n-Radar: $0.07/transaction",
        },
        "analysis": "Stripe is bundling AI-powered fraud detection into their platform at no extra cost for Scale users, replacing their paid Radar product. This is a classic platform play — by making fraud detection free, they increase switching costs and make it harder for merchants to justify using third-party fraud tools. The 99.7% accuracy claim, if validated, would be industry-leading.",
        "recommendations": [
            "Evaluate whether your fraud detection offering can compete with a 'free' bundled solution — consider partnerships with fraud-detection specialists",
            "Use this as a case study in sales conversations: 'Unlike Stripe, we don't lock features behind volume tiers'",
            "Monitor merchant forums for feedback on the accuracy claims — early bugs could be a competitive opening",
        ],
    },
    # Lemonsqueezy changes
    {
        "competitor_idx": 1,
        "change_type": "feature",
        "significance": 7,
        "summary": "Detected 18 additions and 5 removals in integrations page",
        "days_ago": 2,
        "diff_data": {
            "added": [
                "New: Native Webflow integration — sell digital products directly from Webflow sites",
                "Zapier integration now supports 40+ trigger events",
                "New webhook events: subscription.paused, license.expired",
                "API v2 beta: GraphQL endpoint for advanced queries",
            ],
            "removed": [
                "Zapier integration supports 12 trigger events",
                "REST API documentation (v1)",
            ],
            "added_count": 18,
            "removed_count": 5,
            "diff_text": "--- before\n+++ after\n+Native Webflow integration\n+API v2 beta: GraphQL",
        },
        "analysis": "Lemonsqueezy is expanding its integration ecosystem aggressively, with the Webflow integration being the most strategically significant. This positions them as the go-to payment solution for the no-code/low-code creator economy. The GraphQL API beta suggests they're also courting more technical users, creating a two-pronged growth strategy.",
        "recommendations": [
            "Prioritize partnerships with no-code platforms (Webflow, Framer, Carrd) before Lemonsqueezy locks in exclusive integrations",
            "Consider launching a GraphQL API to match — developer experience is becoming a key differentiator",
            "Create migration guides from Lemonsqueezy to your platform targeting creators who outgrow their feature set",
        ],
    },
    {
        "competitor_idx": 1,
        "change_type": "content",
        "significance": 6,
        "summary": "Detected 11 additions and 9 removals in homepage messaging",
        "days_ago": 8,
        "diff_data": {
            "added": [
                "Trusted by 45,000+ creators worldwide",
                "Process payments in 135+ countries",
                "New: Built-in email marketing tools",
                "SOC 2 Type II certified",
            ],
            "removed": [
                "Trusted by 30,000+ creators worldwide",
                "Process payments in 100+ countries",
                "Coming soon: email marketing integration",
            ],
            "added_count": 11,
            "removed_count": 9,
            "diff_text": "--- before\n+++ after\n-30,000+ creators\n+45,000+ creators\n+SOC 2 Type II",
        },
        "analysis": "Lemonsqueezy grew from 30K to 45K creators (50% increase) and expanded country coverage from 100 to 135. The SOC 2 Type II certification is a strong signal they're moving upmarket toward enterprise customers. Their email marketing feature has moved from 'coming soon' to 'built-in', suggesting rapid feature development velocity.",
        "recommendations": [
            "The 50% creator growth in one quarter is noteworthy — analyze which creator segments they're winning and whether your positioning overlaps",
            "SOC 2 certification signals enterprise ambitions — if you don't have it, fast-track compliance to avoid losing enterprise deals",
            "Monitor their email marketing feature closely — bundled email could reduce churn by keeping creators within their ecosystem",
        ],
    },
    # Paddle changes
    {
        "competitor_idx": 2,
        "change_type": "pricing",
        "significance": 8,
        "summary": "Detected 16 additions and 11 removals in pricing page",
        "days_ago": 3,
        "diff_data": {
            "added": [
                "New Paddle Billing: Transparent pricing at 5% + 50¢",
                "No hidden fees — tax filing, compliance, and fraud protection included",
                "Volume-based discounts starting at $100K MRR",
                "Free migration assistance from any payment provider",
                "14-day free trial with full feature access",
            ],
            "removed": [
                "Custom pricing — contact sales",
                "Paddle takes 5% + 50¢ per transaction",
                "Enterprise plans available on request",
            ],
            "added_count": 16,
            "removed_count": 11,
            "diff_text": "--- before\n+++ after\n-Custom pricing — contact sales\n+Transparent pricing at 5% + 50¢\n+Free migration assistance",
        },
        "analysis": "Paddle is pivoting from opaque 'contact sales' pricing to full transparency, signaling a shift toward self-serve growth. The free migration assistance is an aggressive acquisition play aimed at merchants frustrated with switching costs. By leading with 'no hidden fees' and including tax/compliance, they're positioning the 5% rate as an all-in cost versus competitors where add-ons inflate the total.",
        "recommendations": [
            "Audit your own pricing page — if it requires 'contact sales', you're now at a disadvantage against Paddle's transparency play",
            "Counter their migration assistance with a competing offer — switching cost elimination is a powerful acquisition lever",
            "Create a total-cost comparison tool that shows your all-in pricing vs Paddle's 5% with their included services",
        ],
    },
    {
        "competitor_idx": 2,
        "change_type": "new_page",
        "significance": 7,
        "summary": "Detected 31 additions and 0 removals — new page detected",
        "days_ago": 6,
        "diff_data": {
            "added": [
                "Paddle for AI Companies — Purpose-built billing for AI startups",
                "Usage-based billing with real-time metering",
                "Token and compute-based pricing models supported",
                "Integrate with OpenAI, Anthropic, and custom LLM providers",
                "Automatic tax calculation for AI SaaS in 200+ jurisdictions",
            ],
            "removed": [],
            "added_count": 31,
            "removed_count": 0,
            "diff_text": "--- before\n+++ after\n+Paddle for AI Companies\n+Usage-based billing with metering",
        },
        "analysis": "Paddle has launched a dedicated vertical page targeting AI companies, with support for usage-based billing, token metering, and integrations with major LLM providers. This is a strategic bet on the fastest-growing SaaS segment. The timing suggests they've already onboarded enough AI customers to justify a dedicated go-to-market motion.",
        "recommendations": [
            "This is a strong signal — if you're not already targeting AI companies, assess the feasibility of a similar vertical offering",
            "Usage-based billing and token metering are becoming table stakes for AI billing — prioritize these features in your roadmap",
            "Reach out to AI startups in your network before Paddle's marketing reaches them — first-mover advantage in relationships matters",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed demo data for portfolio showcase"

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, help="User email to attach data to")

    def handle(self, *args, **options):
        email = options.get("email")

        if email:
            user = User.objects.get(email=email)
        else:
            user = User.objects.first()
            if not user:
                user = User.objects.create_user(
                    email="demo@sitewatch.ai", password="demo1234"
                )
                self.stdout.write(f"Created demo user: demo@sitewatch.ai")

        self.stdout.write(f"Seeding data for user: {user.email}")

        # Clear existing demo data
        Competitor.objects.filter(user=user).delete()

        now = timezone.now()
        competitors = []

        # Create competitors
        for comp_data in COMPETITORS:
            comp = Competitor.objects.create(user=user, **comp_data)
            competitors.append(comp)
            self.stdout.write(f"  Created competitor: {comp.name}")

        # Create changes with snapshots and insights
        for change_data in DEMO_CHANGES:
            comp = competitors[change_data["competitor_idx"]]
            days_ago = change_data["days_ago"]
            ts = now - timedelta(days=days_ago)

            # Create before/after snapshots
            snap_before = Snapshot.objects.create(
                competitor=comp,
                html_content="[Demo snapshot - before state]",
                page_title=f"{comp.name} - Before",
                status_code=200,
            )
            snap_before.captured_at = ts - timedelta(days=1)
            Snapshot.objects.filter(pk=snap_before.pk).update(captured_at=snap_before.captured_at)

            snap_after = Snapshot.objects.create(
                competitor=comp,
                html_content="[Demo snapshot - after state]",
                page_title=f"{comp.name} - After",
                status_code=200,
            )
            snap_after.captured_at = ts
            Snapshot.objects.filter(pk=snap_after.pk).update(captured_at=snap_after.captured_at)

            # Create change
            change = Change.objects.create(
                competitor=comp,
                snapshot_before=snap_before,
                snapshot_after=snap_after,
                change_type=change_data["change_type"],
                summary=change_data["summary"],
                diff_data=change_data["diff_data"],
                significance=change_data["significance"],
            )
            Change.objects.filter(pk=change.pk).update(detected_at=ts)

            # Create insight
            insight = Insight.objects.create(
                change=change,
                analysis=change_data["analysis"],
                recommendations=change_data["recommendations"],
            )
            Insight.objects.filter(pk=insight.pk).update(created_at=ts)

            self.stdout.write(
                f"  Created {change_data['change_type']} change for {comp.name} "
                f"(significance: {change_data['significance']}/10)"
            )

        total_changes = Change.objects.filter(competitor__user=user).count()
        total_insights = Insight.objects.filter(change__competitor__user=user).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {len(competitors)} competitors, "
                f"{total_changes} changes, {total_insights} insights"
            )
        )
