import json
import os
from datetime import datetime, timezone
import pytest
from app.models import LifeEvent
from app.services.correlation.detectors.late_night_spend import detect_late_night_spend
from app.services.correlation.detectors.budget_burn import detect_budget_burn
from app.services.correlation.detectors.sleep_attendance import detect_sleep_attendance


@pytest.fixture
def demo_events():
    fixture_path = os.path.join(os.path.dirname(__file__), "..", "app", "fixtures", "demo_events.json")
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    events = []
    for i, item in enumerate(data):
        ts = datetime.fromisoformat(item["timestamp"])
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        events.append(
            LifeEvent(
                id=i + 1,
                user_id="arjun_demo",
                event_type=item["event_type"],
                title=item["title"],
                timestamp=ts,
                amount=item.get("amount"),
                category=item.get("category"),
                merchant=item.get("merchant"),
                duration_minutes=item.get("duration_minutes"),
                status=item.get("status"),
                subject=item.get("subject"),
                source=item.get("source", "seed")
            )
        )
    return events


def test_detect_late_night_spend(demo_events):
    insight = detect_late_night_spend(demo_events)
    assert insight is not None
    assert insight.detector_key == "late_night_spend_chain"
    assert "₹" in insight.cause
    assert "missed or delayed 8:30 AM lectures" in insight.effect
    assert insight.severity in ["critical", "warn"]
    assert len(insight.evidence_event_ids) > 0


def test_detect_budget_burn(demo_events):
    insight = detect_budget_burn(demo_events, monthly_budget=6000.0)
    assert insight is not None
    assert insight.detector_key == "budget_burn_early"
    assert "run out on" in insight.effect
    assert "early" in insight.effect
    assert insight.severity in ["critical", "warn"]


def test_detect_sleep_attendance(demo_events):
    insight = detect_sleep_attendance(demo_events)
    assert insight is not None
    assert insight.detector_key == "sleep_study_deficit"
    assert "Sleep Deficit" in insight.title
    assert "OS Mid-Term" in insight.effect
    assert len(insight.evidence_event_ids) > 0
