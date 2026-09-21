from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models import User, WaterReport
from app.schemas import AdminStatsResponse, ReportStatusUpdate


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


VALID_STATUSES = {
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
}

VALID_PRIORITIES = {
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
}

VALID_CATEGORIES = {
    "PIPE_LEAK",
    "BROKEN_TAP",
    "TANK_OVERFLOW",
    "DAMAGED_PIPELINE",
    "WATER_CONTAMINATION",
    "DRAINAGE_PROBLEM",
    "NO_WATER_SUPPLY",
    "PUBLIC_WATER_WASTAGE",
    "OTHER",
}


def report_to_dict(report: WaterReport, user: User | None = None):
    """
    Convert database report into JSON-safe response.

    image_data is intentionally NOT returned here.
    Images are loaded separately using:
    GET /api/reports/{id}/image
    """

    return {
        "id": report.id,
        "user_id": report.user_id,
        "citizen_name": user.name if user else None,
        "citizen_phone": user.phone if user else None,
        "description": report.description,
        "image_type": report.image_type,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "severity_rating": report.severity_rating,
        "category": report.category,
        "priority": report.priority,
        "status": report.status,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "resolved_at": report.resolved_at,
    }


# ---------------------------------------------------------
# GET ALL REPORTS
# ---------------------------------------------------------

@router.get("/reports")
def get_all_reports(
    report_status: str | None = Query(
        default=None,
        alias="status",
    ),
    priority: str | None = None,
    category: str | None = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Return all citizen reports.

    Optional filters:

    ?status=OPEN
    ?priority=CRITICAL
    ?category=DAMAGED_PIPELINE
    """

    query = (
        select(WaterReport, User)
        .join(User, WaterReport.user_id == User.id)
    )

    if report_status is not None:
        report_status = report_status.upper()

        if report_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid status filter",
            )

        query = query.where(
            WaterReport.status == report_status
        )

    if priority is not None:
        priority = priority.upper()

        if priority not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid priority filter",
            )

        query = query.where(
            WaterReport.priority == priority
        )

    if category is not None:
        category = category.upper()

        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid category filter",
            )

        query = query.where(
            WaterReport.category == category
        )

    # Critical first, then high, medium, low
    priority_order = {
        "CRITICAL": 1,
        "HIGH": 2,
        "MEDIUM": 3,
        "LOW": 4,
    }

    rows = db.execute(
        query.order_by(
            WaterReport.created_at.desc()
        )
    ).all()

    reports = [
        report_to_dict(report, user)
        for report, user in rows
    ]

    reports.sort(
        key=lambda item: (
            priority_order.get(item["priority"], 99),
            -item["id"],
        )
    )

    return reports


# ---------------------------------------------------------
# GET ONE REPORT
# ---------------------------------------------------------

@router.get("/reports/{report_id}")
def get_admin_report(
    report_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.execute(
        select(WaterReport, User)
        .join(User, WaterReport.user_id == User.id)
        .where(WaterReport.id == report_id)
    ).first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    report, user = row

    return report_to_dict(report, user)


# ---------------------------------------------------------
# UPDATE REPORT STATUS
# ---------------------------------------------------------

@router.patch("/reports/{report_id}/status")
def update_report_status(
    report_id: int,
    data: ReportStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    report = db.get(WaterReport, report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    report.status = data.status

    if data.status == "RESOLVED":
        report.resolved_at = datetime.now(timezone.utc)

    else:
        # If changed back from RESOLVED, clear resolved time
        report.resolved_at = None

    db.commit()
    db.refresh(report)

    citizen = db.get(User, report.user_id)

    return report_to_dict(
        report,
        citizen,
    )


# ---------------------------------------------------------
# ADMIN DASHBOARD STATS
# ---------------------------------------------------------

@router.get(
    "/stats",
    response_model=AdminStatsResponse,
)
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total = db.scalar(
        select(func.count(WaterReport.id))
    ) or 0

    open_count = db.scalar(
        select(func.count(WaterReport.id))
        .where(WaterReport.status == "OPEN")
    ) or 0

    in_progress = db.scalar(
        select(func.count(WaterReport.id))
        .where(WaterReport.status == "IN_PROGRESS")
    ) or 0

    resolved = db.scalar(
        select(func.count(WaterReport.id))
        .where(WaterReport.status == "RESOLVED")
    ) or 0

    critical = db.scalar(
        select(func.count(WaterReport.id))
        .where(WaterReport.priority == "CRITICAL")
    ) or 0

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical": critical,
    }
