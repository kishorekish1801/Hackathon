"""AquaWatch AI - Local Verification & Demonstration Script.

Run this script to test all 4 features of Member 3's Smart Engine locally.
"""

import json
import sys
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(root_dir / "backend"))

from app.services.smart_engine import analyze_report, classify_category
from app.services.priority_service import calculate_priority, get_priority_breakdown
from app.services.location_service import (
    haversine_distance,
    find_nearby_reports,
    count_nearby_reports,
    group_reports_by_location,
)
from app.services.language_service import normalize_and_translate


def print_header(title: str):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)


def verify_feature_1_categorisation():
    print_header("FEATURE 1: AUTOMATIC CATEGORISATION")
    test_cases = [
        ("Main pipeline burst and road is flooding", "DAMAGED_PIPELINE"),
        ("Public tap dripping continuously", "BROKEN_TAP"),
        ("Water tank is overflowing", "TANK_OVERFLOW"),
        ("Dirty water coming from public pipe", "WATER_CONTAMINATION"),
        ("Drain blocked with stagnant water", "DRAINAGE_PROBLEM"),
        ("No drinking water supply since morning", "NO_WATER_SUPPLY"),
        ("People left public water tap running", "PUBLIC_WATER_WASTAGE"),
        ("Underground pipe leak causing seepage", "PIPE_LEAK"),
        (None, "OTHER"),
        ("Random text hello how are you", "OTHER"),
    ]

    all_passed = True
    for text, expected in test_cases:
        result = classify_category(text)
        status = "PASSED" if result == expected else "FAILED"
        if status == "FAILED":
            all_passed = False
        display_text = f'"{text}"' if text is not None else "None (empty input)"
        print(f"[{status}] {display_text}")
        print(f"         --> Detected: {result} (Expected: {expected})\n")

    return all_passed


def verify_feature_2_prioritisation():
    print_header("FEATURE 2: INTELLIGENT MULTI-FACTOR PRIORITISATION")
    test_cases = [
        {
            "name": "Prompt Example 1: Critical Burst Pipeline with 5 nearby reports",
            "sev": 5,
            "cat": "DAMAGED_PIPELINE",
            "desc": "Main pipeline burst and road is flooding",
            "nearby": 5,
            "expected": "CRITICAL",
        },
        {
            "name": "Prompt Example 2: Low Broken Tap dripping slowly with 0 nearby",
            "sev": 1,
            "cat": "BROKEN_TAP",
            "desc": "small tap dripping slowly",
            "nearby": 0,
            "expected": "LOW",
        },
        {
            "name": "Severity 3 Pipe Leak (Medium priority)",
            "sev": 3,
            "cat": "PIPE_LEAK",
            "desc": "leaking pipe on roadside",
            "nearby": 0,
            "expected": "MEDIUM",
        },
        {
            "name": "Severity 3 Water Contamination (High priority due to category health risk)",
            "sev": 3,
            "cat": "WATER_CONTAMINATION",
            "desc": "dirty water coming from public pipe",
            "nearby": 0,
            "expected": "HIGH",
        },
        {
            "name": "Nearby Report Escalation: 10 nearby reports escalates to CRITICAL",
            "sev": 2,
            "cat": "PIPE_LEAK",
            "desc": "pipe leak",
            "nearby": 10,
            "expected": "CRITICAL",
        },
    ]

    all_passed = True
    for tc in test_cases:
        res = calculate_priority(
            severity_rating=tc["sev"],
            category=tc["cat"],
            description=tc["desc"],
            nearby_reports_count=tc["nearby"],
        )
        breakdown = get_priority_breakdown(
            severity_rating=tc["sev"],
            category=tc["cat"],
            description=tc["desc"],
            nearby_reports_count=tc["nearby"],
        )
        status = "PASSED" if res == tc["expected"] else "FAILED"
        if status == "FAILED":
            all_passed = False
        print(f"[{status}] {tc['name']}")
        print(f"         Citizen Severity: {tc['sev']} | Category: {tc['cat']} | Nearby Reports: {tc['nearby']}")
        print(f"         Scoring: Rating={breakdown['severity_rating_points']}pts + "
              f"Category={breakdown['category_risk_points']}pts + "
              f"Keywords={breakdown['keyword_adjustment_points']}pts + "
              f"NearbyDensity={breakdown['nearby_density_points']}pts = "
              f"Total={breakdown['total_score']}pts")
        print(f"         --> Priority: {res} (Expected: {tc['expected']})\n")

    return all_passed


def verify_feature_3_location():
    print_header("FEATURE 3: LOCATION SEGREGATION & HAVERSINE HOTSPOTS")
    base_lat, base_lon = 13.0827, 80.2707

    # Point 200m away
    dist_200m = haversine_distance(base_lat, base_lon, 13.0845, 80.2707)
    print(f"[*] Haversine Distance test (approx 200m): {dist_200m:.2f} meters")

    # Sample incident reports across two geographic areas
    reports = [
        # Hotspot 1: T. Nagar cluster (within 300m of each other)
        {"latitude": 13.0418, "longitude": 80.2341, "category": "DAMAGED_PIPELINE", "priority": "CRITICAL"},
        {"latitude": 13.0425, "longitude": 80.2349, "category": "DAMAGED_PIPELINE", "priority": "CRITICAL"},
        {"latitude": 13.0412, "longitude": 80.2335, "category": "WATER_CONTAMINATION", "priority": "HIGH"},
        {"latitude": 13.0430, "longitude": 80.2355, "category": "PIPE_LEAK", "priority": "MEDIUM"},
        # Hotspot 2: Adyar cluster (within 200m of each other, 6km away from T. Nagar)
        {"latitude": 13.0067, "longitude": 80.2570, "category": "BROKEN_TAP", "priority": "LOW"},
        {"latitude": 13.0071, "longitude": 80.2575, "category": "BROKEN_TAP", "priority": "LOW"},
    ]

    nearby_count = count_nearby_reports(13.0418, 80.2341, reports, radius_meters=500.0)
    print(f"[*] Nearby reports within 500m of T. Nagar center: {nearby_count}")

    hotspots = group_reports_by_location(reports, radius_meters=500.0)
    print("\n[*] Identified Water-Problem Hotspots:")
    print(json.dumps(hotspots, indent=2))

    passed = len(hotspots) == 2 and hotspots[0]["report_count"] == 4 and hotspots[0]["critical_count"] == 2
    print(f"\n[{'PASSED' if passed else 'FAILED'}] Hotspot clustering grouping verified!")
    return passed


def verify_feature_4_multilingual():
    print_header("FEATURE 4: MULTILINGUAL SUPPORT (TAMIL + TANGLISH)")
    bilingual_tests = [
        ("எங்கள் தெருவில் குடிநீர் வரவில்லை", "NO_WATER_SUPPLY", "Tamil Script: Drinking water not coming"),
        ("சாக்கடை அடைப்பு மற்றும் கழிவு நீர்", "DRAINAGE_PROBLEM", "Tamil Script: Drainage blockage & sewage"),
        ("inga thanni varala morning la irunthu", "NO_WATER_SUPPLY", "Tanglish: Water has not come since morning"),
        ("motta madi thotti nerambi valiyuthu", "TANK_OVERFLOW", "Tanglish: Rooftop tank overflowing"),
        ("street la pipe odanju thanni waste aaguthu", "DAMAGED_PIPELINE", "Tanglish: Pipe broken and road waste"),
    ]

    all_passed = True
    for text, expected, notes in bilingual_tests:
        cat = classify_category(text)
        status = "PASSED" if cat == expected else "FAILED"
        if status == "FAILED":
            all_passed = False
        print(f"[{status}] Input: \"{text}\" ({notes})")
        print(f"         --> Detected: {cat} (Expected: {expected})\n")

    return all_passed


def verify_main_contract():
    print_header("MAIN FUNCTION CONTRACT (Member 2 API Interface)")
    existing_reports = [
        {"latitude": 13.0827, "longitude": 80.2707, "priority": "CRITICAL"},
        {"latitude": 13.0830, "longitude": 80.2710, "priority": "CRITICAL"},
        {"latitude": 13.0825, "longitude": 80.2705, "priority": "HIGH"},
    ]

    result = analyze_report(
        description="Main pipeline burst and road is flooding",
        severity_rating=5,
        latitude=13.0827,
        longitude=80.2707,
        existing_reports=existing_reports,
    )

    print("[*] Output of analyze_report():")
    print(json.dumps(result, indent=2))

    # Contract verification:
    has_category = "category" in result
    has_priority = "priority" in result
    no_confidence = "confidence" not in result
    no_water_loss = "estimated_water_loss" not in result and "water_loss" not in result

    passed = has_category and has_priority and no_confidence and no_water_loss
    print(f"\n[{'PASSED' if passed else 'FAILED'}] Contract verified!")
    print("      - Has 'category':", has_category)
    print("      - Has 'priority':", has_priority)
    print("      - NO 'confidence' returned (as agreed):", no_confidence)
    print("      - NO 'estimated_water_loss' returned (as agreed):", no_water_loss)
    return passed


if __name__ == "__main__":
    p1 = verify_feature_1_categorisation()
    p2 = verify_feature_2_prioritisation()
    p3 = verify_feature_3_location()
    p4 = verify_feature_4_multilingual()
    p5 = verify_main_contract()

    print_header("FINAL VERIFICATION SUMMARY")
    if p1 and p2 and p3 and p4 and p5:
        print(">>> ALL CHECKS PASSED LOCALLY! <<<")
        print("Ready for Member 2 integration.")
    else:
        print("SOME CHECKS FAILED! Review details above.")
