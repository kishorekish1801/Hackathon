"""AquaWatch AI - Smart Water Management Engine Services.

Member 3 Responsibility:
- smart_engine.py
- priority_service.py
- location_service.py
- language_service.py
"""

from .smart_engine import analyze_report, classify_category
from .priority_service import calculate_priority
from .location_service import (
    haversine_distance,
    find_nearby_reports,
    count_nearby_reports,
    group_reports_by_location,
)
from .language_service import normalize_and_translate

__all__ = [
    "analyze_report",
    "classify_category",
    "calculate_priority",
    "haversine_distance",
    "find_nearby_reports",
    "count_nearby_reports",
    "group_reports_by_location",
    "normalize_and_translate",
]
