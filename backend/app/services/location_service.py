"""AquaWatch AI - Location Service.

Provides Haversine distance calculation, proximity filtering,
and hotspot clustering for water incident reports.
"""

import math
from typing import Any

# Average radius of the Earth in meters
EARTH_RADIUS_METERS: float = 6371000.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth surface in meters.

    Uses the Haversine formula.
    """
    # Quick check for identical points
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    sin_dphi_2 = math.sin(delta_phi / 2.0)
    sin_dlambda_2 = math.sin(delta_lambda / 2.0)

    a = sin_dphi_2 * sin_dphi_2 + math.cos(phi1) * math.cos(phi2) * sin_dlambda_2 * sin_dlambda_2

    # Clamp 'a' to [0.0, 1.0] to prevent math domain error in sqrt
    a = max(0.0, min(1.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_METERS * c


def _extract_coords(report: Any) -> tuple[float | None, float | None]:
    """Extract (latitude, longitude) from either a dictionary or an object."""
    if isinstance(report, dict):
        lat = report.get("latitude") or report.get("lat")
        lon = (
            report.get("longitude")
            or report.get("lon")
            or report.get("lng")
        )
    else:
        lat = getattr(report, "latitude", None) or getattr(report, "lat", None)
        lon = (
            getattr(report, "longitude", None)
            or getattr(report, "lon", None)
            or getattr(report, "lng", None)
        )

    try:
        if lat is not None and lon is not None:
            return float(lat), float(lon)
    except (ValueError, TypeError):
        pass

    return None, None


def _is_critical_report(report: Any) -> bool:
    """Check if a report has CRITICAL priority or severity >= 5."""
    if isinstance(report, dict):
        priority = str(report.get("priority", "")).upper()
        severity = report.get("severity_rating", 0)
    else:
        priority = str(getattr(report, "priority", "")).upper()
        severity = getattr(report, "severity_rating", 0)

    try:
        severity_val = int(severity)
    except (ValueError, TypeError):
        severity_val = 0

    return priority == "CRITICAL" or severity_val >= 5


def find_nearby_reports(
    lat: float,
    lon: float,
    reports: list[Any],
    radius_meters: float = 500.0,
) -> list[Any]:
    """Return all reports from `reports` that fall within `radius_meters` of (lat, lon)."""
    nearby = []
    for report in reports:
        r_lat, r_lon = _extract_coords(report)
        if r_lat is None or r_lon is None:
            continue
        dist = haversine_distance(lat, lon, r_lat, r_lon)
        if dist <= radius_meters:
            nearby.append(report)
    return nearby


def count_nearby_reports(
    lat: float,
    lon: float,
    reports: list[Any],
    radius_meters: float = 500.0,
) -> int:
    """Count reports that fall within `radius_meters` of (lat, lon)."""
    return len(find_nearby_reports(lat, lon, reports, radius_meters=radius_meters))


def group_reports_by_location(
    reports: list[Any],
    radius_meters: float = 500.0,
) -> list[dict[str, Any]]:
    """Group reports by spatial proximity (within `radius_meters`).

    Uses connected-component spatial clustering to group incidents that belong to the same
    physical hotspot.

    Returns:
        list of dicts:
        [
            {
                "center_latitude": float,
                "center_longitude": float,
                "report_count": int,
                "critical_count": int
            }
        ]
    """
    if not reports:
        return []

    # Filter out reports with invalid coordinates
    valid_reports: list[tuple[float, float, Any]] = []
    for r in reports:
        lat, lon = _extract_coords(r)
        if lat is not None and lon is not None:
            valid_reports.append((lat, lon, r))

    if not valid_reports:
        return []

    visited = [False] * len(valid_reports)
    clusters: list[list[tuple[float, float, Any]]] = []

    for i in range(len(valid_reports)):
        if visited[i]:
            continue

        visited[i] = True
        cluster = [valid_reports[i]]
        queue = [valid_reports[i]]

        while queue:
            curr_lat, curr_lon, _ = queue.pop(0)
            for j in range(len(valid_reports)):
                if not visited[j]:
                    cand_lat, cand_lon, cand_item = valid_reports[j]
                    dist = haversine_distance(curr_lat, curr_lon, cand_lat, cand_lon)
                    if dist <= radius_meters:
                        visited[j] = True
                        cluster.append(valid_reports[j])
                        queue.append(valid_reports[j])

        clusters.append(cluster)

    output: list[dict[str, Any]] = []
    for cluster in clusters:
        total_lat = sum(item[0] for item in cluster)
        total_lon = sum(item[1] for item in cluster)
        count = len(cluster)
        critical_count = sum(1 for item in cluster if _is_critical_report(item[2]))

        center_lat = round(total_lat / count, 6)
        center_lon = round(total_lon / count, 6)

        output.append(
            {
                "center_latitude": center_lat,
                "center_longitude": center_lon,
                "report_count": count,
                "critical_count": critical_count,
            }
        )

    # Sort descending by report_count, then critical_count
    output.sort(key=lambda x: (x["report_count"], x["critical_count"]), reverse=True)
    return output
