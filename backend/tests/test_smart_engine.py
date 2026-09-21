"""AquaWatch AI - Smart Engine Test Suite.

Comprehensive validation covering:
1. All 9 Categories (PIPE_LEAK, BROKEN_TAP, TANK_OVERFLOW, DAMAGED_PIPELINE,
   WATER_CONTAMINATION, DRAINAGE_PROBLEM, NO_WATER_SUPPLY, PUBLIC_WATER_WASTAGE, OTHER)
2. All 4 Priorities (LOW, MEDIUM, HIGH, CRITICAL)
3. Severity variations (1, 3, 5)
4. Proximity density variations (0, 3, 10 nearby reports)
5. Specified real-world test descriptions
6. Empty / None fallback handling
7. Haversine distance and location hotspot clustering
8. Multilingual (Tamil & Tanglish) support
9. Member 2 stable analyze_report() contract
"""

import math
import sys
from pathlib import Path
import unittest

# Ensure backend/ is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.smart_engine import analyze_report, classify_category, CATEGORIES
from app.services.priority_service import calculate_priority, get_priority_breakdown
from app.services.location_service import (
    haversine_distance,
    find_nearby_reports,
    count_nearby_reports,
    group_reports_by_location,
)
from app.services.language_service import normalize_and_translate, clean_text


class TestAquaWatchSmartEngine(unittest.TestCase):

    def setUp(self):
        # Base coordinates (e.g., Chennai, Marina area)
        self.base_lat = 13.0827
        self.base_lon = 80.2707

    # -------------------------------------------------------------
    # Category Tests (Covering all 9 Categories & User Descriptions)
    # -------------------------------------------------------------
    def test_category_01_damaged_pipeline(self):
        """User description: 'Main pipeline burst and road flooded' -> DAMAGED_PIPELINE"""
        cat = classify_category("Main pipeline burst and road flooded")
        self.assertEqual(cat, "DAMAGED_PIPELINE")

    def test_category_02_broken_tap(self):
        """User description: 'Tap dripping slowly' -> BROKEN_TAP"""
        cat = classify_category("Tap dripping slowly")
        self.assertEqual(cat, "BROKEN_TAP")

    def test_category_03_tank_overflow(self):
        """User description: 'Tank overflowing continuously' -> TANK_OVERFLOW"""
        cat = classify_category("Tank overflowing continuously")
        self.assertEqual(cat, "TANK_OVERFLOW")

    def test_category_04_water_contamination(self):
        """User description: 'Dirty coloured water coming from pipeline' -> WATER_CONTAMINATION"""
        cat = classify_category("Dirty coloured water coming from pipeline")
        self.assertEqual(cat, "WATER_CONTAMINATION")

    def test_category_05_drainage_problem(self):
        """User description: 'Drainage is blocked' -> DRAINAGE_PROBLEM"""
        cat = classify_category("Drainage is blocked")
        self.assertEqual(cat, "DRAINAGE_PROBLEM")

    def test_category_06_no_water_supply(self):
        """User description: 'No water supply for this street' -> NO_WATER_SUPPLY"""
        cat = classify_category("No water supply for this street")
        self.assertEqual(cat, "NO_WATER_SUPPLY")

    def test_category_07_public_water_wastage(self):
        """User description: 'People left public water tap running' -> PUBLIC_WATER_WASTAGE"""
        cat = classify_category("People left public water tap running")
        self.assertEqual(cat, "PUBLIC_WATER_WASTAGE")

    def test_category_08_pipe_leak(self):
        """PIPE_LEAK category detection with underground leak."""
        cat = classify_category("Small leaking pipe in front of house")
        self.assertEqual(cat, "PIPE_LEAK")

    def test_category_09_other_fallback_empty_or_none(self):
        """Safe fallback to OTHER when description is None, empty, or uninformative."""
        self.assertEqual(classify_category(None), "OTHER")
        self.assertEqual(classify_category(""), "OTHER")
        self.assertEqual(classify_category("   "), "OTHER")
        self.assertEqual(classify_category("Hello good morning random text"), "OTHER")

    def test_category_10_additional_prompt_phrases(self):
        """Test additional prompt examples."""
        self.assertEqual(
            classify_category("Drain blocked with stagnant water"),
            "DRAINAGE_PROBLEM"
        )
        self.assertEqual(
            classify_category("No drinking water supply since morning"),
            "NO_WATER_SUPPLY"
        )
        self.assertEqual(
            classify_category("Dirty water coming from public pipe"),
            "WATER_CONTAMINATION"
        )
        self.assertEqual(
            classify_category("Public tap dripping continuously"),
            "BROKEN_TAP"
        )
        self.assertEqual(
            classify_category("Water tank is overflowing"),
            "TANK_OVERFLOW"
        )

    # -------------------------------------------------------------
    # Priority Tests (Covering LOW, MEDIUM, HIGH, CRITICAL & Severities)
    # -------------------------------------------------------------
    def test_priority_01_low_prompt_example(self):
        """Severity 1, BROKEN_TAP, dripping slowly, 0 nearby -> LOW"""
        priority = calculate_priority(
            severity_rating=1,
            category="BROKEN_TAP",
            description="small tap dripping slowly",
            nearby_reports_count=0,
        )
        self.assertEqual(priority, "LOW")

    def test_priority_02_critical_prompt_example(self):
        """Severity 5, DAMAGED_PIPELINE, burst major flooding, 5 nearby -> CRITICAL"""
        priority = calculate_priority(
            severity_rating=5,
            category="DAMAGED_PIPELINE",
            description="Main pipeline burst and road is flooding",
            nearby_reports_count=5,
        )
        self.assertEqual(priority, "CRITICAL")

    def test_priority_03_medium_severity_3(self):
        """Severity 3, PIPE_LEAK, normal leak, 0 nearby -> MEDIUM"""
        priority = calculate_priority(
            severity_rating=3,
            category="PIPE_LEAK",
            description="pipe leaking near sidewalk",
            nearby_reports_count=0,
        )
        self.assertEqual(priority, "MEDIUM")

    def test_priority_04_high_severity_3_with_contamination(self):
        """Severity 3, WATER_CONTAMINATION (high base risk), 0 nearby -> HIGH"""
        priority = calculate_priority(
            severity_rating=3,
            category="WATER_CONTAMINATION",
            description="dirty yellowish water coming from tap",
            nearby_reports_count=0,
        )
        self.assertEqual(priority, "HIGH")

    def test_priority_05_nearby_reports_escalation_0_vs_3_vs_10(self):
        """Test escalation from 0 nearby, 3 nearby, to 10 nearby reports."""
        # Severity 2, PIPE_LEAK:
        # With 0 nearby:
        p_0 = calculate_priority(
            severity_rating=2,
            category="PIPE_LEAK",
            description="pipe leak",
            nearby_reports_count=0,
        )
        # With 3 nearby reports:
        p_3 = calculate_priority(
            severity_rating=2,
            category="PIPE_LEAK",
            description="pipe leak",
            nearby_reports_count=3,
        )
        # With 10 nearby reports:
        p_10 = calculate_priority(
            severity_rating=2,
            category="PIPE_LEAK",
            description="pipe leak",
            nearby_reports_count=10,
        )

        self.assertEqual(p_0, "LOW")      # 20 + 10 = 30 -> boundary / score 30
        self.assertEqual(p_3, "HIGH")     # 20 + 10 + 20 = 50 -> HIGH
        self.assertEqual(p_10, "CRITICAL") # 20 + 10 + 30 + (density) = 60/70+ -> HIGH/CRITICAL

    def test_priority_06_severity_ratings_1_3_5(self):
        """Test how severity ratings 1, 3, 5 scale the priority."""
        # Baseline: DRAINAGE_PROBLEM, no keywords, 0 nearby
        p_sev1 = calculate_priority(1, "DRAINAGE_PROBLEM", None, 0)
        p_sev3 = calculate_priority(3, "DRAINAGE_PROBLEM", None, 0)
        p_sev5 = calculate_priority(5, "DRAINAGE_PROBLEM", None, 0)

        self.assertEqual(p_sev1, "LOW")     # 10 + 15 = 25 -> LOW
        self.assertEqual(p_sev3, "MEDIUM")  # 30 + 15 = 45 -> MEDIUM
        self.assertEqual(p_sev5, "HIGH")    # 50 + 15 = 65 -> HIGH

    def test_priority_07_hospital_location_escalation(self):
        """Sensitive location keyword (hospital) elevates priority."""
        p_normal = calculate_priority(2, "PIPE_LEAK", "leaking pipe in residential area", 0)
        p_hospital = calculate_priority(2, "PIPE_LEAK", "leaking pipe near city hospital entrance", 0)
        self.assertIn(p_hospital, ["HIGH", "CRITICAL"])
        self.assertNotEqual(p_normal, p_hospital)

    # -------------------------------------------------------------
    # Location Service & Haversine Grouping Tests
    # -------------------------------------------------------------
    def test_location_01_haversine_accuracy(self):
        """Test Haversine distance between two known coordinates."""
        # Distance between identical points is 0
        self.assertEqual(haversine_distance(13.0827, 80.2707, 13.0827, 80.2707), 0.0)

        # Distance between (0, 0) and (0, 1 degree longitude) at equator ~ 111.19 km (111195 m)
        dist = haversine_distance(0.0, 0.0, 0.0, 1.0)
        self.assertTrue(110000 < dist < 112000, f"Distance {dist} out of expected range")

    def test_location_02_nearby_reports_within_500m(self):
        """Reports within ~500m are detected, distant ones excluded."""
        # 0.002 degrees lat is ~222 meters
        # 0.010 degrees lat is ~1110 meters
        existing = [
            {"latitude": self.base_lat + 0.001, "longitude": self.base_lon + 0.001, "severity_rating": 3},
            {"latitude": self.base_lat + 0.002, "longitude": self.base_lon - 0.001, "severity_rating": 4},
            {"latitude": self.base_lat + 0.020, "longitude": self.base_lon + 0.020, "severity_rating": 5}, # ~3km away
        ]
        nearby = find_nearby_reports(self.base_lat, self.base_lon, existing, radius_meters=500.0)
        self.assertEqual(len(nearby), 2)
        count = count_nearby_reports(self.base_lat, self.base_lon, existing, radius_meters=500.0)
        self.assertEqual(count, 2)

    def test_location_03_group_reports_by_location_hotspots(self):
        """Test hotspot clustering output structure matching specification."""
        cluster_a = [
            {"latitude": 13.0820, "longitude": 80.2700, "priority": "HIGH", "severity_rating": 4},
            {"latitude": 13.0822, "longitude": 80.2702, "priority": "CRITICAL", "severity_rating": 5},
            {"latitude": 13.0824, "longitude": 80.2701, "priority": "CRITICAL", "severity_rating": 5},
        ]
        cluster_b = [
            {"latitude": 13.1500, "longitude": 80.3500, "priority": "LOW", "severity_rating": 1},
        ]
        all_reports = cluster_a + cluster_b
        hotspots = group_reports_by_location(all_reports, radius_meters=500.0)

        self.assertEqual(len(hotspots), 2)
        top_hotspot = hotspots[0]
        self.assertEqual(top_hotspot["report_count"], 3)
        self.assertEqual(top_hotspot["critical_count"], 2)
        self.assertAlmostEqual(top_hotspot["center_latitude"], 13.0822, places=3)
        self.assertAlmostEqual(top_hotspot["center_longitude"], 80.2701, places=3)

    # -------------------------------------------------------------
    # Member 2 Stable Interface Contract (analyze_report)
    # -------------------------------------------------------------
    def test_analyze_report_contract(self):
        """Verify analyze_report returns exactly {'category', 'priority'} without forbidden keys."""
        existing = [
            {"latitude": self.base_lat, "longitude": self.base_lon, "priority": "CRITICAL"}
        ]
        result = analyze_report(
            description="Main pipeline burst and road flooded",
            severity_rating=5,
            latitude=self.base_lat,
            longitude=self.base_lon,
            existing_reports=existing,
        )

        self.assertIsInstance(result, dict)
        self.assertIn("category", result)
        self.assertIn("priority", result)
        # Verify forbidden keys are ABSENT
        self.assertNotIn("confidence", result, "Confidence MUST NOT be returned!")
        self.assertNotIn("estimated_water_loss", result, "Estimated water loss MUST NOT be returned!")
        self.assertNotIn("water_loss", result)

        self.assertEqual(result["category"], "DAMAGED_PIPELINE")
        self.assertEqual(result["priority"], "CRITICAL")

    def test_analyze_report_with_none_description(self):
        """Safe fallback with None description still returns valid category & priority."""
        result = analyze_report(
            description=None,
            severity_rating=3,
            latitude=self.base_lat,
            longitude=self.base_lon,
            existing_reports=[],
        )
        self.assertEqual(result["category"], "OTHER")
        self.assertEqual(result["priority"], "MEDIUM")

    # -------------------------------------------------------------
    # Multilingual (Tamil & Tanglish) Support Tests
    # -------------------------------------------------------------
    def test_multilingual_tamil_script(self):
        """Test classification of Tamil Unicode script input."""
        # Tamil: 'குடிநீர் வரவில்லை' -> no drinking water supply
        cat = classify_category("எங்கள் தெருவில் குடிநீர் வரவில்லை")
        self.assertEqual(cat, "NO_WATER_SUPPLY")

        # Tamil: 'சாக்கடை அடைப்பு' -> drainage problem
        cat_drain = classify_category("சாக்கடை அடைப்பு மற்றும் துர்நாற்றம்")
        self.assertEqual(cat_drain, "DRAINAGE_PROBLEM")

    def test_multilingual_tanglish(self):
        """Test classification of Tanglish (phonetic Tamil in English alphabet)."""
        # Tanglish: 'thanni varala' -> NO_WATER_SUPPLY
        cat = classify_category("inga thanni varala morning la irunthu")
        self.assertEqual(cat, "NO_WATER_SUPPLY")

        # Tanglish: 'thotti nerambi valiyuthu' -> TANK_OVERFLOW
        cat_tank = classify_category("motta madi thotti nerambi valiyuthu")
        self.assertEqual(cat_tank, "TANK_OVERFLOW")


if __name__ == "__main__":
    unittest.main(verbosity=2)
