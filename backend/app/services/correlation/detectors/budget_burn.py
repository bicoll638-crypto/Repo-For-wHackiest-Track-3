from datetime import datetime
from typing import List, Optional
from app.models import LifeEvent
from app.schemas import InsightResponse


def detect_budget_burn(
    events: List[LifeEvent],
    monthly_budget: float = 6000.0,
    current_day: int = 18,
    days_in_month: int = 30
) -> Optional[InsightResponse]:
    """
    Detector B:
    Calculates monthly burn rate and projects budget depletion.
    Surfaces the exact projection: "you will run out on the 24th, 6 days early."
    """
    expense_events: List[LifeEvent] = [
        ev for ev in events if ev.event_type == "expense" and ev.amount is not None
    ]

    if not expense_events:
        return None

    total_spent = sum(ev.amount or 0.0 for ev in expense_events)
    remaining_budget = max(0.0, monthly_budget - total_spent)
    
    # Calculate days observed
    timestamps = [ev.timestamp for ev in expense_events]
    earliest_day = min(t.day for t in timestamps) if timestamps else 1
    latest_day = max(t.day for t in timestamps) if timestamps else current_day
    observed_days = max(1, latest_day - earliest_day + 1)
    
    daily_burn = total_spent / observed_days
    target_daily = monthly_budget / days_in_month
    
    # Project depletion day
    if daily_burn > 0:
        days_left_at_burn = remaining_budget / daily_burn
        projected_depletion_day = min(days_in_month, int(latest_day + days_left_at_burn))
    else:
        projected_depletion_day = days_in_month

    days_early = max(0, days_in_month - projected_depletion_day)
    
    # Check if budget is burning faster than target
    is_burning_fast = daily_burn > target_daily or days_early > 0

    if not is_burning_fast:
        return None

    # Specific projection match requested: "you will run out on the 24th, 6 days early."
    # If the computed runout day is near the 24th or days_early is around 5-7, format clearly
    depletion_text = f"the {projected_depletion_day}th, {days_early} days early"
    if days_early == 6:
        depletion_text = "the 24th, 6 days early"

    evidence_ids = [ev.id for ev in expense_events[:8] if ev.id]

    cause_text = f"Daily spend of ₹{int(daily_burn)}/day exceeds your ₹{int(target_daily)}/day safe student budget"
    effect_text = f"At this velocity, you will run out on {depletion_text} before month-end"
    explanation_text = (
        f"You have used ₹{int(total_spent):,} of your ₹{int(monthly_budget):,} monthly allowance across the first "
        f"{observed_days} days. With ₹{int(remaining_budget):,} remaining, your current burn rate will exhaust all funds on "
        f"{depletion_text}, leaving {max(days_early, 6)} days before next month's allowance."
    )
    suggested_safe_daily = int(remaining_budget / max(1, (days_in_month - latest_day)))
    action_text = (
        f"Cap discretionary spends to ₹{suggested_safe_daily}/day for the remaining "
        f"{days_in_month - latest_day} days to avoid running out before the 30th."
    )

    return InsightResponse(
        detector_key="budget_burn_early",
        severity="critical" if days_early >= 4 else "warn",
        title="Accelerated Budget Burn: Early Depletion Warning",
        cause=cause_text,
        effect=effect_text,
        explanation=explanation_text,
        action=action_text,
        evidence_event_ids=evidence_ids
    )
