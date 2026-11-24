from typing import Optional
from sqlmodel import Session, select
from app.models import LifeEvent, UserProfile
from app.schemas import BriefingResponse
from app.services.correlation.engine import engine
from app.services.llm import llm_service
from app.config import settings


def generate_morning_briefing(session: Session, user_id: str = settings.DEMO_USER_ID) -> BriefingResponse:
    # 1. Fetch user profile
    profile = session.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()
    user_name = profile.name if profile else settings.DEMO_USER_NAME
    monthly_budget = profile.monthly_budget if profile else settings.MONTHLY_BUDGET

    # 2. Fetch all events
    events = session.exec(
        select(LifeEvent).where(LifeEvent.user_id == user_id).order_by(LifeEvent.timestamp)
    ).all()

    # 3. Analyze patterns and correlations
    engine.monthly_budget = monthly_budget
    insights = engine.analyze_events(events)
    budget = engine.compute_budget_summary(events)

    # 4. Generate briefing via LLM service
    briefing = llm_service.generate_briefing(
        user_name=user_name,
        insights=insights,
        budget=budget,
        events=events
    )

    return briefing
