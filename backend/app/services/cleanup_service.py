from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.config import settings
from app.models import WaterReport


def cleanup_old_resolved_reports(db: Session) -> int:
    """
    Delete resolved reports that are older than the configured
    retention period.

    Returns the number of reports deleted.
    """

    cutoff_date = datetime.now(timezone.utc) - timedelta(
        days=settings.REPORT_RETENTION_DAYS
    )

    result = db.execute(
        delete(WaterReport).where(
            WaterReport.status == "RESOLVED",
            WaterReport.resolved_at.is_not(None),
            WaterReport.resolved_at < cutoff_date,
        )
    )

    deleted_count = result.rowcount or 0

    db.commit()

    return deleted_count
