import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def scrape_competitor(competitor_id):
    """Scrape a single competitor and analyze changes."""
    from apps.competitors.models import Competitor
    from apps.intelligence.models import Change
    from apps.intelligence.services import IntelligenceService

    from .models import Snapshot
    from .services import DiffService, ScrapingService

    competitor = Competitor.objects.get(id=competitor_id)

    # 1. Capture new snapshot
    scraper = ScrapingService()
    new_snapshot = scraper.capture(competitor)

    # 2. Compare with previous snapshot
    previous = (
        Snapshot.objects.filter(competitor=competitor)
        .exclude(id=new_snapshot.id)
        .first()
    )

    if not previous:
        logger.info(f"First snapshot for {competitor.name}, no diff possible")
        return {"snapshot_id": new_snapshot.id, "changes": False}

    diff_service = DiffService()
    diff_data = diff_service.compare(previous, new_snapshot)

    if not diff_data:
        logger.info(f"No meaningful changes for {competitor.name}")
        return {"snapshot_id": new_snapshot.id, "changes": False}

    # 3. Create Change record
    change = Change.objects.create(
        competitor=competitor,
        snapshot_before=previous,
        snapshot_after=new_snapshot,
        summary=f"Detected {diff_data['added_count']} additions and {diff_data['removed_count']} removals",
        diff_data=diff_data,
    )

    # 4. Analyze with Claude
    try:
        intelligence = IntelligenceService()
        intelligence.analyze_change(change)
    except Exception as e:
        logger.error(f"AI analysis failed for change {change.id}: {e}")

    return {"snapshot_id": new_snapshot.id, "change_id": change.id, "changes": True}


@shared_task
def scrape_all_active():
    """Daily task: scrape all active competitors for all users."""
    from apps.competitors.models import Competitor

    active_ids = list(
        Competitor.objects.filter(is_active=True).values_list("id", flat=True)
    )
    logger.info(f"Starting daily scrape for {len(active_ids)} competitors")

    for competitor_id in active_ids:
        scrape_competitor.delay(competitor_id)
