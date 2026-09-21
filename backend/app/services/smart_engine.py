"""AquaWatch AI - Smart Engine.

Main coordination module for:
1. Automatic Categorisation
2. Intelligent Prioritisation
3. Location Proximity & Hotspots (Haversine Formula)
4. Safe fallback for missing descriptions

Member 2 Public Interface:
def analyze_report(
    description,
    severity_rating,
    latitude,
    longitude,
    existing_reports,
):
    ...
    return {
        "category": "DAMAGED_PIPELINE",
        "priority": "CRITICAL"
    }

Strict API Contract:
- DOES NOT return 'confidence'
- DOES NOT return 'estimated_water_loss'
"""

import math
import re
import unicodedata
from typing import Any

# =====================================================================
# CATEGORIES & PRIORITIES CONSTANTS
# =====================================================================
VALID_CATEGORIES = [
    "PIPE_LEAK",
    "BROKEN_TAP",
    "TANK_OVERFLOW",
    "DAMAGED_PIPELINE",
    "WATER_CONTAMINATION",
    "DRAINAGE_PROBLEM",
    "NO_WATER_SUPPLY",
    "PUBLIC_WATER_WASTAGE",
    "OTHER",
]
CATEGORIES = VALID_CATEGORIES

VALID_PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]

EARTH_RADIUS_METERS: float = 6371000.0


# =====================================================================
# 1. TEXT NORMALIZATION & MULTILINGUAL SUPPORT
# =====================================================================
TAMIL_COMPOUND_PHRASES: dict[str, str] = {
    "சாக்கடை அடைப்பு": "drainage blocked drain clogged sewage",
    "குடிநீர் வரவில்லை": "no drinking water supply stopped",
    "தண்ணீர் வரவில்லை": "no water supply stopped not getting water",
    "தண்ணி வரல": "no water supply stopped",
    "குழாய் உடைப்பு": "main pipeline burst broken pipe damaged",
    "பைப் உடைப்பு": "main pipeline burst broken pipe",
    "குழாய் ஒழுகுது": "pipe leak leaking dripping",
    "தொட்டி நிரம்பி வழிகிறது": "tank overflow overflowing continuously",
    "தொட்டி நிரம்பி": "tank overflow overflowing",
    "கழிவு நீர்": "sewage drainage water",
    "அழுக்கு நீர்": "dirty contaminated water",
    "மஞ்சள் நிற நீர்": "dirty yellow contaminated water",
    "கருப்பு நிற நீர்": "dirty black contaminated water",
    "சாலை வெள்ளம்": "road is flooding flooded street",
}

TAMIL_SCRIPT_MAPPING: dict[str, str] = {
    "தண்ணீர்": "water",
    "தண்ணி": "water",
    "குடிநீர்": "drinking water",
    "நீர்": "water",
    "வரவில்லை": "no water supply stopped",
    "வரல": "no water supply stopped",
    "இல்லை": "no supply",
    "வழங்கப்படவில்லை": "no water supply",
    "குழாய்": "pipe tap",
    "பைப்ப": "pipe",
    "பைப்": "pipe",
    "குழாயில்": "in pipe",
    "உடைந்தது": "broken burst",
    "உடைந்து": "broken burst",
    "உடைப்பு": "burst broken damaged",
    "வெடித்தது": "burst explosion damaged",
    "வெடிப்பு": "burst damaged",
    "ஒழுகுது": "leaking dripping",
    "ஒழுகுதல்": "leak leaking",
    "கசிகிறது": "leaking seepage",
    "சொட்டுது": "dripping drip",
    "சொட்டுகிறது": "dripping drip",
    "திறந்த": "open",
    "மூடவில்லை": "not closed running wastage",
    "தொட்டி": "tank",
    "வாட்டர் டேங்க்": "water tank",
    "நிரம்பி": "full overflowing",
    "வழிகிறது": "overflowing spilling",
    "வழிகின்றது": "overflowing spilling",
    "அழுக்கு": "dirty contaminated",
    "கழிவு": "sewage",
    "துர்நாற்றம்": "bad smell foul",
    "நாற்றம்": "foul smell",
    "புழு": "worms contamination",
    "மஞ்சள்": "yellow dirty",
    "கருப்பு": "black dirty",
    "மண்": "muddy dirty",
    "கலங்கலாக": "muddy contaminated",
    "சாக்கடை": "drainage sewage drain",
    "கால்வாய்": "drain canal",
    "அடைப்பு": "blocked clogging",
    "தேங்கி": "stagnant water blocked",
    "நிற்கிறது": "stagnant",
    "வீணாகிறது": "wastage wasted",
    "வீணாக": "wastage",
    "வீணாகுது": "wastage running",
    "சாலை": "road street",
    "தெரு": "street road",
    "வெள்ளம்": "flooding flood",
    "மூழ்கியது": "flooded submerged",
}

TANGLISH_MAPPING: dict[str, str] = {
    "thanni": "water",
    "thanneer": "water",
    "thani": "water",
    "kudineer": "drinking water",
    "kuzhai": "pipe tap",
    "kulaai": "pipe tap",
    "kulla": "pipe tap",
    "pipe-la": "in pipe",
    "pipela": "in pipe",
    "udanjiduchu": "broken burst damaged",
    "odanjiduchu": "broken burst damaged",
    "odanju": "broken burst",
    "udaipu": "burst broken damaged",
    "vedichiduchu": "burst explosion",
    "ozhukudhu": "leaking dripping",
    "ozhukuthu": "leaking dripping",
    "kasidhal": "leak leaking",
    "kasithu": "leaking seepage",
    "sottudhu": "dripping drip",
    "sottuthu": "dripping drip",
    "thotti": "tank",
    "nerambi": "full overflowing",
    "valiyudhu": "overflowing spilling",
    "valiyuthu": "overflowing spilling",
    "azhukku": "dirty contamination",
    "azhuku": "dirty contamination",
    "saakadai": "drainage sewage drain",
    "saakada": "drainage sewage drain",
    "adaippu": "blocked clogging",
    "adaichu": "blocked clogging",
    "theangi": "stagnant water blocked",
    "theanguthu": "stagnant water",
    "varala": "no water supply stopped",
    "varavillai": "no water supply stopped",
    "illai": "no water none",
    "veenaguthu": "wastage wasted",
    "veenavuthu": "wastage wasted",
    "vellam": "flood flooding",
    "saalai": "road street",
    "theru": "street road",
}


def normalize_text(text: str | None) -> str:
    """Normalize whitespace, lowercase, remove punctuation, and translate Tamil/Tanglish concepts."""
    if not text:
        return ""

    normalized = unicodedata.normalize("NFC", str(text).strip().lower())
    cleaned = re.sub(r"[^\w\s\u0B80-\u0BFF]", " ", normalized)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned:
        return ""

    translated_tokens: list[str] = []
    # Check compound Tamil phrases first
    for phrase, en_concept in TAMIL_COMPOUND_PHRASES.items():
        if phrase in cleaned:
            translated_tokens.append(en_concept)

    # Translate individual words
    tokens = cleaned.split()
    for token in tokens:
        translated_tokens.append(token)
        if token in TAMIL_SCRIPT_MAPPING:
            translated_tokens.append(TAMIL_SCRIPT_MAPPING[token])
        elif token in TANGLISH_MAPPING:
            translated_tokens.append(TANGLISH_MAPPING[token])

    result = " ".join(translated_tokens)
    return re.sub(r"\s+", " ", result).strip()


# =====================================================================
# 2. AUTOMATIC CATEGORISATION
# =====================================================================
CATEGORY_PHRASES: dict[str, list[tuple[int, str]]] = {
    "DAMAGED_PIPELINE": [
        (10, "pipeline burst"),
        (10, "main line burst"),
        (10, "main pipeline burst"),
        (10, "main pipeline"),
        (9, "water is flooding"),
        (9, "flooding the road"),
        (9, "road is flooding"),
        (9, "road flooded"),
        (9, "street flooded"),
        (9, "street is flooding"),
        (8, "burst pipe"),
        (8, "burst pipeline"),
        (8, "pipe burst"),
        (8, "pipeline exploded"),
        (8, "pipe ruptured"),
        (8, "pipeline ruptured"),
        (7, "underground line damaged"),
        (7, "water jetting out"),
    ],
    "PUBLIC_WATER_WASTAGE": [
        (10, "people left public water tap running"),
        (10, "water being wasted from public tap"),
        (10, "left public water tap running"),
        (10, "water being wasted"),
        (10, "tap left running"),
        (10, "left tap running"),
        (10, "public water wastage"),
        (9, "water tap running"),
        (9, "tap running continuously"),
        (9, "water running continuously"),
        (9, "tap left open"),
        (8, "water wastage"),
        (8, "wasting water"),
        (8, "water is being wasted"),
        (8, "unattended tap"),
        (7, "water flowing on street"),
    ],
    "BROKEN_TAP": [
        (10, "public tap dripping slowly"),
        (10, "public tap dripping continuously"),
        (10, "public tap dripping"),
        (9, "tap dripping slowly"),
        (9, "broken tap"),
        (9, "damaged tap"),
        (9, "tap broken"),
        (8, "dripping tap"),
        (8, "leaking tap"),
        (8, "faucet broken"),
        (8, "tap handle broken"),
        (7, "faucet dripping"),
        (7, "faucet leaking"),
        (7, "tap loose"),
        (6, "public tap"),
    ],
    "TANK_OVERFLOW": [
        (10, "water tank is overflowing"),
        (10, "tank overflowing continuously"),
        (10, "tank is overflowing"),
        (9, "water tank overflow"),
        (9, "tank overflowing"),
        (9, "tank overflow"),
        (8, "overhead tank overflow"),
        (8, "overhead tank"),
        (8, "sump overflowing"),
        (8, "sump overflow"),
        (7, "reservoir overflowing"),
        (7, "sintex tank overflow"),
        (7, "tank full and spilling"),
    ],
    "WATER_CONTAMINATION": [
        (10, "dirty coloured water coming from public pipe"),
        (10, "dirty coloured water coming"),
        (10, "dirty coloured water"),
        (10, "dirty colored water"),
        (10, "dirty water coming from pipe"),
        (10, "dirty water coming"),
        (10, "sewage water mixed"),
        (10, "sewage mixed in drinking"),
        (9, "dirty water"),
        (9, "contaminated water"),
        (9, "foul smelling water"),
        (9, "bad smell water"),
        (8, "muddy water"),
        (8, "brown water"),
        (8, "black water"),
        (8, "yellow water"),
        (8, "worms in water"),
        (7, "smelly tap water"),
        (7, "polluted water"),
        (7, "unhygienic water"),
    ],
    "DRAINAGE_PROBLEM": [
        (10, "drain blocked with stagnant water"),
        (10, "drain blocked"),
        (10, "drainage is blocked"),
        (10, "drainage blocked"),
        (9, "drainage overflow"),
        (9, "sewage overflow"),
        (9, "gutter blocked"),
        (9, "gutter overflowing"),
        (9, "drain clogged"),
        (8, "manhole overflowing"),
        (8, "stagnant drainage water"),
        (8, "blocked drain"),
        (8, "blocked gutter"),
        (7, "open drain overflowing"),
    ],
    "NO_WATER_SUPPLY": [
        (10, "no drinking water supply"),
        (10, "no water supply for this street"),
        (10, "no water supply since morning"),
        (10, "no water supply"),
        (9, "no drinking water"),
        (9, "water supply stopped"),
        (9, "not getting water"),
        (9, "zero water supply"),
        (8, "dry tap"),
        (8, "taps are dry"),
        (8, "water cut"),
        (8, "water shortage"),
        (7, "haven't received water"),
        (7, "no municipal water"),
        (7, "water not coming"),
    ],
    "PIPE_LEAK": [
        (9, "leaking pipe"),
        (9, "pipe leaking"),
        (9, "pipe leak"),
        (8, "pipeline leak"),
        (8, "leak from pipe"),
        (8, "underground pipe leak"),
        (7, "dripping pipe"),
        (7, "water seeping from pipe"),
        (7, "pipe cracked"),
        (6, "pipe puncture"),
    ],
}

CATEGORY_KEYWORDS: dict[str, list[tuple[int, str]]] = {
    "DAMAGED_PIPELINE": [
        (4, "pipeline"), (4, "burst"), (3, "flooding"), (3, "flooded"),
        (3, "rupture"), (3, "ruptured"), (3, "explosion"),
    ],
    "PUBLIC_WATER_WASTAGE": [
        (4, "wastage"), (3, "wasted"), (3, "wasting"), (3, "unattended"),
    ],
    "BROKEN_TAP": [
        (3, "tap"), (3, "faucet"), (2, "dripping"), (2, "spigot"),
    ],
    "TANK_OVERFLOW": [
        (4, "tank"), (4, "overflow"), (4, "overflowing"), (3, "sump"), (3, "reservoir"),
    ],
    "WATER_CONTAMINATION": [
        (4, "contaminated"), (4, "contamination"), (3, "dirty"), (3, "muddy"),
        (3, "smell"), (3, "smelly"), (3, "foul"), (3, "worms"),
    ],
    "DRAINAGE_PROBLEM": [
        (4, "drainage"), (4, "drain"), (4, "gutter"), (4, "manhole"),
        (3, "sewer"), (3, "sewage"), (3, "clogged"), (3, "stagnant"),
    ],
    "NO_WATER_SUPPLY": [
        (4, "shortage"), (3, "dry"), (3, "stopped"), (3, "scarcity"),
    ],
    "PIPE_LEAK": [
        (3, "pipe"), (3, "leak"), (3, "leaking"), (2, "seepage"), (2, "crack"),
    ],
}


def classify_category(description: str | None) -> str:
    """Classify description into one of 9 valid categories. Fallback to OTHER."""
    if not description or not str(description).strip():
        return "OTHER"

    normalized_text = normalize_text(description)
    if not normalized_text:
        return "OTHER"

    scores: dict[str, int] = {cat: 0 for cat in VALID_CATEGORIES if cat != "OTHER"}

    # 1. Multi-word phrase matching
    for category, phrase_rules in CATEGORY_PHRASES.items():
        for weight, phrase in phrase_rules:
            if phrase in normalized_text:
                scores[category] += weight

    # 2. Individual keyword matching
    words = set(re.findall(r"\w+", normalized_text))
    for category, keyword_rules in CATEGORY_KEYWORDS.items():
        for weight, keyword in keyword_rules:
            if keyword in words:
                scores[category] += weight

    # Disambiguation logic
    if scores["DAMAGED_PIPELINE"] > 0 and any(k in normalized_text for k in ("burst", "flood", "flooding", "main")):
        scores["DAMAGED_PIPELINE"] += 5

    if any(k in normalized_text for k in ("left", "wastage", "wasted", "wasting", "running")):
        if "tap" in normalized_text and "broken" not in normalized_text and "damaged" not in normalized_text:
            scores["PUBLIC_WATER_WASTAGE"] += 5

    best_category, highest_score = max(scores.items(), key=lambda x: x[1])

    # Threshold: must accumulate at least 3 points to match
    if highest_score < 3:
        return "OTHER"

    return best_category


# =====================================================================
# 3. LOCATION & HAVERSINE DISTANCE
# =====================================================================
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points on Earth in meters."""
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    sin_dphi = math.sin(delta_phi / 2.0)
    sin_dlam = math.sin(delta_lambda / 2.0)

    a = sin_dphi * sin_dphi + math.cos(phi1) * math.cos(phi2) * sin_dlam * sin_dlam
    a = max(0.0, min(1.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_METERS * c


def _extract_coords(report: Any) -> tuple[float | None, float | None]:
    """Extract coordinates from dict or object."""
    if isinstance(report, dict):
        lat = report.get("latitude") or report.get("lat")
        lon = report.get("longitude") or report.get("lon") or report.get("lng")
    else:
        lat = getattr(report, "latitude", None) or getattr(report, "lat", None)
        lon = getattr(report, "longitude", None) or getattr(report, "lon", None) or getattr(report, "lng", None)

    try:
        if lat is not None and lon is not None:
            return float(lat), float(lon)
    except (ValueError, TypeError):
        pass
    return None, None


def count_nearby_reports(
    lat: float,
    lon: float,
    reports: list[Any] | None,
    radius_meters: float = 500.0,
) -> int:
    """Count existing reports within radius_meters (default 500m)."""
    if not reports:
        return 0

    count = 0
    for r in reports:
        r_lat, r_lon = _extract_coords(r)
        if r_lat is not None and r_lon is not None:
            if haversine_distance(lat, lon, r_lat, r_lon) <= radius_meters:
                count += 1
    return count


# =====================================================================
# 4. INTELLIGENT PRIORITISATION
# =====================================================================
SEVERITY_RATING_POINTS: dict[int, int] = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
}

CATEGORY_RISK_POINTS: dict[str, int] = {
    "DAMAGED_PIPELINE": 25,
    "WATER_CONTAMINATION": 25,
    "DRAINAGE_PROBLEM": 15,
    "NO_WATER_SUPPLY": 15,
    "TANK_OVERFLOW": 10,
    "PIPE_LEAK": 5,
    "PUBLIC_WATER_WASTAGE": 5,
    "BROKEN_TAP": 5,
    "OTHER": 0,
}

CRITICAL_EMERGENCY_KEYWORDS: set[str] = {
    "burst", "bursting", "flooding", "flooded", "major", "explosion",
    "hazard", "danger", "dangerous", "submerged", "disaster",
    "heavy damage", "rupture", "ruptured", "collapsed", "blast",
}

HEALTH_EPIDEMIC_KEYWORDS: set[str] = {
    "poison", "poisonous", "toxic", "disease", "cholera", "dengue",
    "epidemic", "hospitalized", "chemical", "vomiting", "illness",
    "fever", "hazardous", "unsafe to drink", "sewage mixed",
}

HIGH_IMPACT_LOCATIONS: set[str] = {
    "hospital", "school", "college", "market", "main road", "highway",
    "bus stand", "railway", "station", "clinic", "dense", "traffic",
}

VOLUME_ESCALATION_KEYWORDS: set[str] = {
    "gushing", "continuous", "continuously", "massive", "huge",
    "overflowing", "torrent", "heavy", "force", "stream",
}

MITIGATING_KEYWORDS: set[str] = {
    "slow", "slowly", "small", "minor", "dripping", "slight",
    "drip", "drops", "tiny", "drop by drop",
}


def calculate_priority(
    severity_rating: int,
    category: str,
    description: str | None = None,
    nearby_reports_count: int = 0,
) -> str:
    """Calculate priority level: LOW, MEDIUM, HIGH, CRITICAL."""
    try:
        sev_int = int(severity_rating)
    except (ValueError, TypeError):
        sev_int = 3

    clamped_severity = max(1, min(5, sev_int))
    rating_pts = SEVERITY_RATING_POINTS.get(clamped_severity, 10)
    category_pts = CATEGORY_RISK_POINTS.get(category.upper(), 0)

    # Keyword points
    keyword_pts = 0
    if description:
        text = str(description).lower()
        if any(kw in text for kw in CRITICAL_EMERGENCY_KEYWORDS):
            keyword_pts += 20
        if any(kw in text for kw in HEALTH_EPIDEMIC_KEYWORDS):
            keyword_pts += 20
        if any(kw in text for kw in HIGH_IMPACT_LOCATIONS):
            keyword_pts += 25
        if any(kw in text for kw in VOLUME_ESCALATION_KEYWORDS):
            keyword_pts += 10
        if any(kw in text for kw in MITIGATING_KEYWORDS):
            keyword_pts -= 10

    # Density points
    if nearby_reports_count >= 10:
        density_pts = 45
    elif nearby_reports_count >= 5:
        density_pts = 35
    elif nearby_reports_count >= 3:
        density_pts = 25
    elif nearby_reports_count >= 1:
        density_pts = 10
    else:
        density_pts = 0

    total_score = rating_pts + category_pts + keyword_pts + density_pts

    # Guardrails
    if clamped_severity == 5 and (
        category in ("DAMAGED_PIPELINE", "WATER_CONTAMINATION")
        or keyword_pts >= 20
        or nearby_reports_count >= 5
    ):
        return "CRITICAL"

    if clamped_severity == 1 and category == "BROKEN_TAP" and nearby_reports_count == 0:
        if keyword_pts <= 0:
            return "LOW"

    # Thresholds
    if total_score >= 70:
        return "CRITICAL"
    if total_score >= 50:
        return "HIGH"
    if total_score >= 30:
        return "MEDIUM"
    return "LOW"


# =====================================================================
# 5. MAIN PUBLIC FUNCTION (MEMBER 2 API CONTRACT)
# =====================================================================
def analyze_report(
    description,
    severity_rating,
    latitude,
    longitude,
    existing_reports,
):
    """Main analysis engine interface for FastAPI backend (Member 2).

    Inputs:
    - description: str | None
    - severity_rating: int (1-5)
    - latitude: float
    - longitude: float
    - existing_reports: list of active reports

    Returns:
    {
        "category": "DAMAGED_PIPELINE",
        "priority": "CRITICAL"
    }

    Note: Strictly DOES NOT return 'confidence' or 'estimated_water_loss'.
    """
    # 1. Automatic Categorisation (Safe fallback to 'OTHER' if empty/None)
    category = classify_category(description)

    # 2. Location logic: Count nearby reports within 500m using Haversine
    try:
        lat_f = float(latitude)
        lon_f = float(longitude)
    except (ValueError, TypeError):
        lat_f, lon_f = 0.0, 0.0

    nearby_count = count_nearby_reports(
        lat=lat_f,
        lon=lon_f,
        reports=existing_reports,
        radius_meters=500.0,
    )

    # 3. Intelligent Multi-Factor Priority Calculation
    priority = calculate_priority(
        severity_rating=severity_rating,
        category=category,
        description=description,
        nearby_reports_count=nearby_count,
    )

    return {
        "category": category,
        "priority": priority,
    }
