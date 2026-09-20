from importlib import import_module

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_citizen, get_current_user
from app.models import User, WaterReport
from app.schemas import ReportResponse


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def run_smart_engine(
    description: str | None,
    severity_rating: int,
    latitude: float,
    longitude: float,
    existing_reports: list,
) -> dict:
    """
    Load Member 3's smart engine dynamically.

    We do not implement smart classification here because
    Member 3 owns app/services/smart_engine.py.
    """

    try:
        smart_engine = import_module("app.services.smart_engine")
        analyze_report = getattr(smart_engine, "analyze_report")
    except (ModuleNotFoundError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Smart analysis service is not available yet",
        )

    result = analyze_report(
        description,
        severity_rating,
        latitude,
        longitude,
        existing_reports,
    )

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Smart engine returned an invalid response",
        )

    category = result.get("category")
    priority = result.get("priority")

    valid_categories = {
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

    valid_priorities = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    if category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Smart engine returned an invalid category",
        )

    if priority not in valid_priorities:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Smart engine returned an invalid priority",
        )

    return {
        "category": category,
        "priority": priority,
    }


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_report(
    severity_rating: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str | None = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Validate severity
    # -----------------------------------------------------

    if severity_rating < 1 or severity_rating > 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Severity rating must be between 1 and 5",
        )

    # -----------------------------------------------------
    # Validate GPS
    # -----------------------------------------------------

    if latitude < -90 or latitude > 90:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Latitude must be between -90 and 90",
        )

    if longitude < -180 or longitude > 180:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Longitude must be between -180 and 180",
        )

    # -----------------------------------------------------
    # Validate image type
    # -----------------------------------------------------

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed",
        )

    image_data = await image.read()

    if not image_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty",
        )

    max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024

    if len(image_data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image must be smaller than {settings.MAX_IMAGE_SIZE_MB} MB",
        )

    # -----------------------------------------------------
    # Get existing reports for Member 3's location analysis
    # -----------------------------------------------------

    existing_reports = db.scalars(
        select(WaterReport)
    ).all()

    # -----------------------------------------------------
    # Smart analysis
    # -----------------------------------------------------

    analysis = run_smart_engine(
        description=description,
        severity_rating=severity_rating,
        latitude=latitude,
        longitude=longitude,
        existing_reports=list(existing_reports),
    )

    # -----------------------------------------------------
    # Store report + actual image bytes in PostgreSQL
    # -----------------------------------------------------

    report = WaterReport(
        user_id=current_user.id,
        description=description.strip() if description else None,
        image_data=image_data,
        image_type=image.content_type,
        latitude=latitude,
        longitude=longitude,
        severity_rating=severity_rating,
        category=analysis["category"],
        priority=analysis["priority"],
        status="OPEN",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.get(
    "/me",
    response_model=list[ReportResponse],
)
def get_my_reports(
    current_user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    reports = db.scalars(
        select(WaterReport)
        .where(WaterReport.user_id == current_user.id)
        .order_by(WaterReport.created_at.desc())
    ).all()

    return list(reports)


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.get(WaterReport, report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    # Citizens can only view their own reports.
    # Admins may view every report.
    if current_user.role != "ADMIN" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this report",
        )

    return report


@router.get("/{report_id}/image")
def get_report_image(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.get(WaterReport, report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if current_user.role != "ADMIN" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this image",
        )

    return Response(
        content=report.image_data,
        media_type=report.image_type,
    )

