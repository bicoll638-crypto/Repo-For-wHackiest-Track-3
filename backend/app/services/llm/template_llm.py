import re
from datetime import datetime
from typing import List, Dict, Any
from app.models import LifeEvent
from app.schemas import InsightResponse, BudgetSummary, BriefingResponse, WhatIfResponse
from app.services.llm.base import BaseLLMService


class TemplateLLMService(BaseLLMService):
    """
    Template-based LLM engine for Mock Mode.
    Produces high-fidelity, proactive, personalized responses using
    real student metrics and transparent cause-and-effect reasoning.
    """

    def generate_briefing(
        self,
        user_name: str,
        insights: List[InsightResponse],
        budget: BudgetSummary,
        events: List[LifeEvent]
    ) -> BriefingResponse:
        # Pull key figures
        spent = int(budget.total_spent)
        budget_total = int(budget.monthly_budget)
        remaining = int(budget.remaining_budget)
        burn_rate = int(budget.burn_rate_daily)
        safe_daily = int(budget.remaining_budget / max(1, budget.days_remaining_in_month))
        depletion_day = budget.projected_depletion_day
        days_early = budget.days_early

        # Identify late spend stats
        late_spends = [
            e for e in events
            if e.event_type == "expense" and e.amount and (e.timestamp.hour >= 23 or e.timestamp.hour < 4)
        ]
        late_spend_total = int(sum(e.amount or 0 for e in late_spends))

        # Check deadlines
        deadlines = [e for e in events if e.event_type == "deadline"]
        deadline_text = "DBMS assignment due in 2 days and OS Mid-Term in 6 days"
        if deadlines:
            deadline_text = " and ".join(f"{d.title} ({d.subject})" for d in deadlines[:2])

        # Formulate 60-second voice briefing script (~135 words)
        script = (
            f"Good morning {user_name}. Here is your sixty-second data twin briefing. "
            f"First, your budget alert: you've spent ₹{spent:,} of your ₹{budget_total:,} allowance. "
            f"At ₹{burn_rate} per day, your funds are projected to deplete on the {depletion_day}th, "
            f"{days_early} days early. To balance the month, cap discretionary spending to ₹{safe_daily} today. "
            f"Second, your circadian correlation: you have accumulated ₹{late_spend_total:,} in midnight food orders, "
            f"and five of those nights led directly to missed eight-thirty AM lectures. "
            f"Third, academic radar: you have your {deadline_text}. Your study completion dropped to thirty-seven percent "
            f"due to sleep fatigue. "
            f"My recommendation: set a ten-thirty PM food cutoff tonight, get seven hours of sleep, "
            f"and lock in two ninety-minute study blocks tomorrow. Have an intentional day."
        )

        highlights = [
            f"Budget Burn: ₹{spent:,} spent. Projected to run out on the {depletion_day}th ({days_early} days early).",
            f"Attendance Correlation: ₹{late_spend_total:,} midnight orders linked to 5 missed 8:30 AM lectures.",
            f"Academic Deadlines: DBMS Assignment in 2 days, OS Mid-Term in 6 days.",
            f"Recommended Target: Cap today's spend to ₹{safe_daily} & sleep by 11:15 PM."
        ]

        words = len(script.split())

        return BriefingResponse(
            script=script,
            highlights=highlights,
            generated_at=datetime.now().strftime("%I:%M %p, %b %d"),
            word_count=words,
            audio_url=None,
            key_metrics={
                "remaining_budget": remaining,
                "daily_burn": burn_rate,
                "safe_daily": safe_daily,
                "projected_depletion_day": depletion_day,
                "late_spend_total": late_spend_total
            }
        )

    def answer_whatif(
        self,
        question: str,
        events: List[LifeEvent],
        budget: BudgetSummary
    ) -> WhatIfResponse:
        q_lower = question.lower()
        
        # 1. INTENT: LATE NIGHT FOOD ORDER
        if any(w in q_lower for w in ["zomato", "swiggy", "food tonight", "order tonight", "midnight snack", "shawarma", "biryani", "late night order"]):
            est_cost = 280.0
            new_remaining = budget.remaining_budget - est_cost
            risk_score = 84
            consequences = [
                f"Financial: Reduces your remaining buffer to ₹{int(new_remaining):,}, pulling budget depletion forward by 18 hours.",
                "Circadian: Historical logs show 2:45 AM sleep onset following late food orders (avg 4.8h sleep).",
                "Academic: 71% historical probability of being late or missing tomorrow's 8:30 AM lecture."
            ]
            recommendation = (
                "Avoid the order. Have hostel mess dinner or an early snack before 10:30 PM. "
                "This protects both your wallet and tomorrow's 8:30 AM attendance."
            )
            spoken = (
                f"Ordering food tonight carries an 84% risk score. It drains another ₹{int(est_cost)} from your "
                f"tight ₹{int(budget.remaining_budget)} remaining budget and historically gives you a 71% chance of "
                f"missing tomorrow's 8:30 AM class due to delayed sleep. I advise skipping the delivery."
            )
            reasoning = [
                "Analyzed 7 past late-night orders (avg ₹270).",
                "Found 5 correlation links with missed 8:30 AM lectures on following mornings.",
                f"Calculated budget impact: remaining funds decrease from ₹{int(budget.remaining_budget)} to ₹{int(new_remaining)}."
            ]
            return WhatIfResponse(
                question=question,
                intent="late_night_order",
                risk_score=risk_score,
                risk_level="high",
                predicted_consequences=consequences,
                recommendation=recommendation,
                spoken_answer=spoken,
                reasoning_chain=reasoning,
                metrics_delta={"cost": est_cost, "new_remaining": new_remaining, "attendance_risk_increase": "+71%"}
            )

        # 2. INTENT: SKIP CLASS / BUNK LECTURE
        elif any(w in q_lower for w in ["skip class", "skip tomorrow", "miss class", "bunk", "sleep in", "skip 8:30"]):
            risk_score = 92
            consequences = [
                "Academic Regulation: Your attendance in 8:30 AM lectures will drop below the university 75% mandatory threshold.",
                "Mid-Term Impact: Misses core OS synchronization coverage 6 days prior to the 40% weightage mid-term.",
                "Compounding Habits: Past logs show skipping morning lecture increases afternoon study cancellation rate by 50%."
            ]
            recommendation = (
                "Do not skip. Attend tomorrow's lecture. Even with fatigue, physical presence ensures you stay above the 75% cutoff."
            )
            spoken = (
                "Skipping tomorrow's class is critical risk, scored at 92%. You have already missed five morning classes, "
                "pushing you dangerously close to the 75% attendance detention boundary. Missing Operating Systems six days "
                "before the exam will severely hurt your grade."
            )
            reasoning = [
                "Queried attendance history: 5 missed morning lectures detected this month.",
                "Current course attendance: 76.2% (threshold: 75%).",
                "One more missed lecture triggers academic warning letter."
            ]
            return WhatIfResponse(
                question=question,
                intent="skip_class",
                risk_score=risk_score,
                risk_level="critical",
                predicted_consequences=consequences,
                recommendation=recommendation,
                spoken_answer=spoken,
                reasoning_chain=reasoning,
                metrics_delta={"attendance_drop": "-4.2%", "attendance_post_skip": "72.0%"}
            )

        # 3. INTENT: SKIP STUDY BLOCK
        elif any(w in q_lower for w in ["skip study", "not study", "study tomorrow", "procrastinate", "skip revision", "skip os prep"]):
            risk_score = 78
            consequences = [
                "Prep Deficit: OS Mid-Term is in 6 days; you have completed only 7.5 of 20 planned syllabus hours.",
                "Backlog Pressure: Pushes 3 complex chapters (Virtual Memory, Deadlocks, Scheduling) into the final 48 hours.",
                "Assignment Delay: DBMS assignment is due in 48 hours, leaving zero buffer for troubleshooting queries."
            ]
            recommendation = (
                "Do not skip completely. If tired, do a reduced 45-minute active recall session instead of 2 hours."
            )
            spoken = (
                "Skipping your study session tonight carries a 78% risk score. Your study completion is already at thirty-seven percent, "
                "and your OS Mid-Term is six days away. Pushing this to tomorrow will cause a massive cramming bottleneck."
            )
            reasoning = [
                "Evaluated study completion: 7.5 hours completed vs 20 hours syllabus target.",
                "Deadlines check: DBMS due in 2 days, OS exam in 6 days.",
                "Postponing creates a deficit of 2.5 hours/day required over the remaining days."
            ]
            return WhatIfResponse(
                question=question,
                intent="skip_study",
                risk_score=risk_score,
                risk_level="high",
                predicted_consequences=consequences,
                recommendation=recommendation,
                spoken_answer=spoken,
                reasoning_chain=reasoning,
                metrics_delta={"prep_hours_deficit": "+2.5 hrs/day required", "completion_rate": "37%"}
            )

        # 4. INTENT: DISCRETIONARY PURCHASE / SPEND
        elif any(w in q_lower for w in ["buy", "purchase", "spend", "order", "cost", "rupees", "rs"]):
            amount_match = re.search(r"(\d+(?:\.\d+)?)", q_lower)
            spend_amount = float(amount_match.group(1)) if amount_match else 500.0
            new_remaining = budget.remaining_budget - spend_amount
            risk_score = 95 if new_remaining <= 200 else (80 if new_remaining < 600 else 45)
            
            consequences = [
                f"Financial: Deducts ₹{int(spend_amount):,} from your remaining ₹{int(budget.remaining_budget):,}, leaving ₹{int(new_remaining):,}.",
                f"Depletion: Accelerates budget zero-date to within {max(1, int(new_remaining / max(1, budget.burn_rate_daily)))} days.",
                "Emergency Buffer: Leaves virtually no buffer for transit emergencies or academic printing costs."
            ]
            recommendation = (
                f"Defer this purchase of ₹{int(spend_amount):,} until the next monthly allowance resets on the 1st."
                if risk_score > 60 else "Safe to proceed if you reduce food delivery spending this weekend."
            )
            spoken = (
                f"Spending ₹{int(spend_amount)} now carries a risk score of {risk_score}%. "
                f"It would leave you with just ₹{int(new_remaining)} for the rest of the month, accelerating your "
                f"zero-budget day. I recommend deferring this purchase."
            )
            reasoning = [
                f"Extracted expenditure amount: ₹{int(spend_amount):,}.",
                f"Computed remaining balance: ₹{int(budget.remaining_budget):,} - ₹{int(spend_amount):,} = ₹{int(new_remaining):,}.",
                f"Safe daily spend drops from ₹{int(budget.remaining_budget / max(1, budget.days_remaining_in_month))} to ₹{int(max(0, new_remaining) / max(1, budget.days_remaining_in_month))}."
            ]
            return WhatIfResponse(
                question=question,
                intent="purchase",
                risk_score=risk_score,
                risk_level="critical" if risk_score >= 85 else ("high" if risk_score >= 70 else "moderate"),
                predicted_consequences=consequences,
                recommendation=recommendation,
                spoken_answer=spoken,
                reasoning_chain=reasoning,
                metrics_delta={"spend_amount": spend_amount, "new_remaining": new_remaining}
            )

        # 5. INTENT: POSITIVE HABIT (Sleep early, study early)
        elif any(w in q_lower for w in ["sleep early", "10:30", "11:00", "sleep 8 hours", "rest", "bed by"]):
            risk_score = 8
            consequences = [
                "Circadian: Guarantees 7.5 to 8 hours of restorative sleep before tomorrow's 8:30 AM class.",
                "Academic: Raises 8:30 AM attendance probability to 98% and restores alertness.",
                "Financial: Automatically prevents ₹250-₹400 midnight delivery impulse orders."
            ]
            recommendation = "Highly recommended! Set alarm for 7:15 AM and put phone on Do Not Disturb by 10:45 PM."
            spoken = (
                "Going to sleep early has an ultra-low risk score of 8% and is strongly recommended. "
                "It virtually guarantees on-time attendance for your 8:30 AM lecture and prevents midnight food spending."
            )
            reasoning = [
                "Queried baseline sleep: 4.8 hours on nights before missed classes.",
                "Projected sleep recovery: +2.7 hours.",
                "Avoids typical ₹250-₹350 midnight food spend window."
            ]
            return WhatIfResponse(
                question=question,
                intent="sleep_early",
                risk_score=risk_score,
                risk_level="low",
                predicted_consequences=consequences,
                recommendation=recommendation,
                spoken_answer=spoken,
                reasoning_chain=reasoning,
                metrics_delta={"sleep_hours_delta": "+2.7 hrs", "attendance_probability": "98%"}
            )

        # DEFAULT GENERAL SCENARIO
        risk_score = 65
        consequences = [
            f"Cross-Variable Effect: May impact your ₹{int(budget.remaining_budget):,} remaining student budget.",
            "Energy Balance: Schedule shifts may risk 8:30 AM lecture punctuality.",
            "Exam Buffer: OS Mid-Term in 6 days requires consistent daily study pacing."
        ]
        recommendation = "Prioritize keeping early classes attended and study blocks protected."
        spoken = (
            f"Analyzing your question with a moderate risk score of 65%. Your top priorities this week should be "
            f"preserving your ₹{int(budget.remaining_budget)} remaining budget and prepping for the OS Mid-Term in 6 days."
        )
        reasoning = [
            f"Parsed question: '{question}'",
            "Evaluated against 30-day student model (budget, sleep, attendance, deadlines).",
            "Synthesized cross-domain impact."
        ]
        return WhatIfResponse(
            question=question,
            intent="general_whatif",
            risk_score=risk_score,
            risk_level="moderate",
            predicted_consequences=consequences,
            recommendation=recommendation,
            spoken_answer=spoken,
            reasoning_chain=reasoning,
            metrics_delta={}
        )
