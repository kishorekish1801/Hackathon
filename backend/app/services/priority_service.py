"""AquaWatch AI - Priority Service.

Provides an intelligent, multi-factor, explainable scoring engine
to determine incident priority: LOW, MEDIUM, HIGH, CRITICAL.

Scoring Factors:
1. Citizen Severity Rating (1 to 5)
2. Incident Category Base Risk Weight
3. Criticality & Severity Escalation Keywords in Description
4. Proximity / Nearby Report Clustering (Density Escalation)
"""

from typing import Any

# Points derived from citizen rating (1-5 scale)
SEVERITY_RATING_POINTS: dict[int, int] = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
}

# Base risk weight points per incident category
CATEGORY_RISK_POINTS: dict[str, int] = {
    "DAMAGED_PIPELINE": 25,      # High volume destruction & flood risk
    "WATER_CONTAMINATION": 25,   # Direct public health / epidemic hazard
    "DRAINAGE_PROBLEM": 15,      # Sanitation & disease vector risk
    "NO_WATER_SUPPLY": 15,       # Community basic need deprivation
    "TANK_OVERFLOW": 10,         # Continuous untreated wastage
    "PIPE_LEAK": 5,              # Localized seepage / slow pipe leak
    "PUBLIC_WATER_WASTAGE": 5,   # Wastage on public fixtures
    "BROKEN_TAP": 5,             # Localized tap fixture failure
    "OTHER": 0,                  # Unclassified / generic
}

# Critical high-severity emergency keywords (+20 pts)
CRITICAL_EMERGENCY_KEYWORDS: set[str] = {
    "burst", "bursting", "flooding", "flooded", "major", "explosion",
    "hazard", "danger", "dangerous", "submerged", "disaster",
    "heavy damage", "rupture", "ruptured", "collapsed", "blast",
}

# Public health epidemic & toxicity escalators (+20 pts)
HEALTH_EPIDEMIC_KEYWORDS: set[str] = {
    "poison", "poisonous", "toxic", "disease", "cholera", "dengue",
    "epidemic", "hospitalized", "chemical", "vomiting", "illness",
    "fever", "hazardous", "unsafe to drink", "sewage mixed",
}

# High-impact critical public infrastructure (+25 pts)
HIGH_IMPACT_LOCATIONS: set[str] = {
    "hospital", "school", "college", "market", "main road", "highway",
    "bus stand", "railway", "station", "clinic", "dense", "traffic",
}

# Continuous high-volume indicators (+10 pts)
VOLUME_ESCALATION_KEYWORDS: set[str] = {
    "gushing", "continuous", "continuously", "massive", "huge",
    "overflowing", "torrent", "heavy", "force", "stream",
}

# Mitigating keywords that indicate minor / contained issues (-10 pts)
MITIGATING_KEYWORDS: set[str] = {
    "slow", "slowly", "small", "minor", "dripping", "slight",
    "drip", "drops", "tiny", "drop by drop",
}


def compute_keyword_adjustment(description: str | None) -> int:
    """Analyze description text for urgency escalation and mitigation keywords."""
    if not description:
        return 0

    text = description.lower()
    points = 0

    # High severity emergency (+20)
    if any(kw in text for kw in CRITICAL_EMERGENCY_KEYWORDS):
        points += 20

    # Epidemic / acute toxicity escalation (+20)
    if any(kw in text for kw in HEALTH_EPIDEMIC_KEYWORDS):
        points += 20

    # Sensitive public locations (+25)
    if any(kw in text for kw in HIGH_IMPACT_LOCATIONS):
        points += 25

    # Gushing / continuous volume (+10)
    if any(kw in text for kw in VOLUME_ESCALATION_KEYWORDS):
        points += 10

    # Mitigating indicators (slow/minor drip) (-10)
    if any(kw in text for kw in MITIGATING_KEYWORDS):
        points -= 10

    return points


def compute_density_points(nearby_reports_count: int) -> int:
    """Escalate points based on geographic concentration of citizen complaints.

    - 0 nearby reports: 0 points
    - 1 to 2 reports:   10 points (verified by neighbor)
    - 3 to 4 reports:   25 points (localized street hotspot)
    - 5 to 9 reports:   35 points (widespread area issue)
    - 10+ reports:      45 points (massive municipal emergency)
    """
    if nearby_reports_count >= 10:
        return 45
    if nearby_reports_count >= 5:
        return 35
    if nearby_reports_count >= 3:
        return 25
    if nearby_reports_count >= 1:
        return 10
    return 0


def calculate_priority(
    severity_rating: int,
    category: str,
    description: str | None = None,
    nearby_reports_count: int = 0,
) -> str:
    """Calculate incident priority level: LOW, MEDIUM, HIGH, or CRITICAL.

    Transparent scoring formula:
    Total Score = Citizen Rating Pts + Category Risk Pts + Keyword Pts + Nearby Cluster Pts

    Thresholds:
    - Score >= 70: CRITICAL
    - Score >= 50: HIGH
    - Score >= 30: MEDIUM
    - Score <  30: LOW
    """
    # 1. Base points from citizen severity rating (clamped 1 to 5)
    clamped_severity = max(1, min(5, severity_rating))
    rating_pts = SEVERITY_RATING_POINTS.get(clamped_severity, 10)

    # 2. Category risk points
    category_pts = CATEGORY_RISK_POINTS.get(category.upper(), 0)

    # 3. Keyword escalation / mitigation
    keyword_pts = compute_keyword_adjustment(description)

    # 4. Nearby report density escalation
    density_pts = compute_density_points(nearby_reports_count)

    # Total score calculation
    total_score = rating_pts + category_pts + keyword_pts + density_pts

    # Domain Guardrails:
    # Rule A: Rating 5 with damaged pipeline or contamination or severe keyword -> CRITICAL
    if clamped_severity == 5 and (
        category in ("DAMAGED_PIPELINE", "WATER_CONTAMINATION")
        or keyword_pts >= 20
        or nearby_reports_count >= 5
    ):
        return "CRITICAL"

    # Rule B: Rating 1 with localized minor tap and 0 nearby reports -> LOW
    if clamped_severity == 1 and category == "BROKEN_TAP" and nearby_reports_count == 0:
        if keyword_pts <= 0:
            return "LOW"

    # Threshold mapping
    if total_score >= 70:
        return "CRITICAL"
    if total_score >= 50:
        return "HIGH"
    if total_score >= 30:
        return "MEDIUM"
    return "LOW"


def get_priority_breakdown(
    severity_rating: int,
    category: str,
    description: str | None = None,
    nearby_reports_count: int = 0,
) -> dict[str, Any]:
    """Helper for judges, logs, and debugging to explain the exact score breakdown."""
    clamped_severity = max(1, min(5, severity_rating))
    rating_pts = SEVERITY_RATING_POINTS.get(clamped_severity, 10)
    category_pts = CATEGORY_RISK_POINTS.get(category.upper(), 0)
    keyword_pts = compute_keyword_adjustment(description)
    density_pts = compute_density_points(nearby_reports_count)
    total_score = rating_pts + category_pts + keyword_pts + density_pts
    priority = calculate_priority(
        severity_rating=severity_rating,
        category=category,
        description=description,
        nearby_reports_count=nearby_reports_count,
    )

    return {
        "severity_rating_points": rating_pts,
        "category_risk_points": category_pts,
        "keyword_adjustment_points": keyword_pts,
        "nearby_density_points": density_pts,
        "total_score": total_score,
        "priority": priority,
    }
