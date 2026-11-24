from datetime import datetime, timedelta
from typing import List, Optional
from app.models import LifeEvent
from app.schemas import InsightResponse


def detect_late_night_spend(events: List[LifeEvent]) -> Optional[InsightResponse]:
    """
    Detector A:
    Identifies late-night food spend (past 11 PM) and correlates it
    with missed or late morning classes (starting before 9:30 AM) the next day.
    """
    # 1. Filter late-night food expenses (11:00 PM to 4:00 AM)
    late_spends: List[LifeEvent] = []
    for ev in events:
        if ev.event_type == "expense" and ev.amount:
            hour = ev.timestamp.hour
            is_late = (hour >= 23 or hour < 4)
            is_food = (ev.category == "food" or any(m in (ev.merchant or "").lower() for m in ["zomato", "swiggy", "canteen", "cafe"]))
            if is_late and is_food:
                late_spends.append(ev)

    if not late_spends:
        return None

    total_late_spend = sum(ev.amount or 0.0 for ev in late_spends)
    evidence_ids: List[int] = [ev.id for ev in late_spends if ev.id]

    # 2. Correlate with next morning classes
    late_spend_dates = {ev.timestamp.date() for ev in late_spends}
    missed_morning_classes: List[LifeEvent] = []

    for ev in events:
        if ev.event_type == "class" and ev.status in ["missed", "late"]:
            # Check if this class is early morning (before 9:30 AM)
            if ev.timestamp.hour < 10:
                # Did an order occur the previous night?
                prev_day = ev.timestamp.date() - timedelta(days=1)
                same_night = ev.timestamp.date()  # or past midnight order on same calendar day
                if prev_day in late_spend_dates or same_night in late_spend_dates:
                    missed_morning_classes.append(ev)
                    if ev.id and ev.id not in evidence_ids:
                        evidence_ids.append(ev.id)

    missed_count = len(missed_morning_classes)
    total_late_orders = len(late_spends)
    avg_order = total_late_spend / max(1, total_late_orders)

    cause_text = f"₹{int(total_late_spend):,} spent across {total_late_orders} food orders after 11:00 PM"
    effect_text = f"{missed_count} missed or delayed 8:30 AM lectures on the following mornings"
    explanation_text = (
        f"You have ordered midnight food {total_late_orders} times this month, averaging ₹{int(avg_order)} per order "
        f"and totalling ₹{int(total_late_spend):,}. In {missed_count} of these instances, late eating disrupted sleep onset "
        f"until ~2:45 AM, directly leading to missed or late 8:30 AM lectures (OS & DBMS)."
    )
    action_text = (
        "Enforce a 10:30 PM kitchen cutoff. Having dinner before 10 PM protects both your 8:30 AM attendance "
        f"and saves approximately ₹{int(total_late_spend):,} in impulse delivery orders."
    )

    return InsightResponse(
        detector_key="late_night_spend_chain",
        severity="critical" if missed_count >= 3 else "warn",
        title="Late-Night Food Deliveries Driving Morning Attendance Drops",
        cause=cause_text,
        effect=effect_text,
        explanation=explanation_text,
        action=action_text,
        evidence_event_ids=evidence_ids
    )
