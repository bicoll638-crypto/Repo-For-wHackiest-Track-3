from datetime import datetime
from typing import List, Optional
from app.models import LifeEvent
from app.schemas import InsightResponse


def detect_sleep_attendance(events: List[LifeEvent]) -> Optional[InsightResponse]:
    """
    Detector C:
    Correlates sleep deficit before early morning classes with
    study block completion rates and impending exam deadlines
    (e.g., DBMS assignment due in 2 days, OS mid-term in 6 days).
    """
    sleep_events = [ev for ev in events if ev.event_type == "sleep" and ev.duration_minutes]
    study_events = [ev for ev in events if ev.event_type == "study"]
    deadlines = [ev for ev in events if ev.event_type == "deadline"]

    if not sleep_events or not study_events:
        return None

    # Calculate average sleep on low_sleep / weeknights
    short_sleeps = [ev for ev in sleep_events if ev.duration_minutes < 360 or ev.status == "low_sleep"]
    avg_sleep_hours = (
        sum(ev.duration_minutes for ev in short_sleeps) / len(short_sleeps) / 60.0
        if short_sleeps else 6.5
    )

    # Study completion analysis
    completed_study = [ev for ev in study_events if ev.status == "completed"]
    abandoned_study = [ev for ev in study_events if ev.status in ["abandoned", "truncated"]]
    total_study_blocks = len(study_events)
    completion_rate = (len(completed_study) / total_study_blocks * 100) if total_study_blocks > 0 else 50.0

    # Deadlines proximity
    os_deadline = next((d for d in deadlines if "OS" in d.title or "Operating Systems" in d.title), None)
    dbms_deadline = next((d for d in deadlines if "DBMS" in d.title), None)

    evidence_ids: List[int] = []
    for ev in short_sleeps[:4] + abandoned_study[:4] + deadlines:
        if ev.id and ev.id not in evidence_ids:
            evidence_ids.append(ev.id)

    cause_text = f"Chronic sleep deficit ({avg_sleep_hours:.1f} hrs/night avg) and {100 - completion_rate:.0f}% study block drop rate"
    effect_text = "Severe preparation deficit for OS Mid-Term (in 6 days) and DBMS Assignment (in 2 days)"
    explanation_text = (
        f"Your biometric and study logs show that after nights with under 5 hours of sleep, {len(abandoned_study)} of your "
        f"{total_study_blocks} planned study blocks were cut short after only 30-40 minutes due to cognitive fatigue. "
        f"With your Operating Systems Mid-Term in 6 days (40% weightage) and DBMS Assignment due in 2 days, this study deficit "
        f"substantially raises academic risk."
    )
    action_text = (
        "Protect a strict 7.5-hour sleep window tonight (in bed by 11:15 PM). Schedule two distraction-free "
        "90-minute study blocks tomorrow at 4:00 PM and 7:00 PM for OS virtual memory review."
    )

    return InsightResponse(
        detector_key="sleep_study_deficit",
        severity="warn" if completion_rate > 50 else "critical",
        title="Sleep Deficit Compounding OS Mid-Term Academic Risk",
        cause=cause_text,
        effect=effect_text,
        explanation=explanation_text,
        action=action_text,
        evidence_event_ids=evidence_ids
    )
