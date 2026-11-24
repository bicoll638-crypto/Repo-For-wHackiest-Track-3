from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import LifeEvent
from app.schemas import InsightResponse, LifeEventRead, BudgetSummary
from app.services.correlation.detectors.late_night_spend import detect_late_night_spend
from app.services.correlation.detectors.budget_burn import detect_budget_burn
from app.services.correlation.detectors.sleep_attendance import detect_sleep_attendance


class CorrelationEngine:
    def __init__(self, monthly_budget: float = 6000.0):
        self.monthly_budget = monthly_budget

    def analyze_events(self, events: List[LifeEvent]) -> List[InsightResponse]:
        """
        Runs all detector pure functions across life events and returns
        structured insights with attached evidence events.
        """
        event_map = {ev.id: ev for ev in events if ev.id is not None}
        insights: List[InsightResponse] = []

        # 1. Late night spend -> Missed early class
        insight_a = detect_late_night_spend(events)
        if insight_a:
            insights.append(insight_a)

        # 2. Budget burn rate projection
        insight_b = detect_budget_burn(events, monthly_budget=self.monthly_budget)
        if insight_b:
            insights.append(insight_b)

        # 3. Sleep deficit -> low study completion vs upcoming exam
        insight_c = detect_sleep_attendance(events)
        if insight_c:
            insights.append(insight_c)

        # Attach hydrated evidence events
        for ins in insights:
            ins.evidence_events = [
                LifeEventRead.model_validate(event_map[eid])
                for eid in ins.evidence_event_ids
                if eid in event_map
            ]

        # Sort: critical first, then warn, then info
        severity_order = {"critical": 0, "warn": 1, "info": 2}
        insights.sort(key=lambda x: severity_order.get(x.severity, 3))
        return insights

    def compute_budget_summary(self, events: List[LifeEvent]) -> BudgetSummary:
        expense_events = [ev for ev in events if ev.event_type == "expense" and ev.amount is not None]
        total_spent = sum(ev.amount or 0.0 for ev in expense_events)
        remaining = max(0.0, self.monthly_budget - total_spent)

        timestamps = [ev.timestamp for ev in expense_events]
        observed_days = max(1, (max(t.day for t in timestamps) - min(t.day for t in timestamps) + 1)) if timestamps else 18
        days_in_month = 30
        
        burn_rate = total_spent / observed_days if observed_days > 0 else 0.0
        target_daily = self.monthly_budget / days_in_month
        
        days_left_at_burn = remaining / burn_rate if burn_rate > 0 else 30
        projected_day = min(days_in_month, int(observed_days + days_left_at_burn))
        days_early = max(0, days_in_month - projected_day)
        days_remaining = max(0, days_in_month - observed_days)

        status = "critical_burn" if days_early >= 4 else ("warning" if days_early > 0 else "on_track")

        return BudgetSummary(
            monthly_budget=self.monthly_budget,
            total_spent=round(total_spent, 2),
            remaining_budget=round(remaining, 2),
            burn_rate_daily=round(burn_rate, 2),
            target_daily_budget=round(target_daily, 2),
            projected_depletion_day=projected_day,
            projected_depletion_date=f"November {projected_day}th",
            days_early=days_early,
            days_remaining_in_month=days_remaining,
            status=status
        )


engine = CorrelationEngine()
