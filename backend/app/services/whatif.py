from sqlmodel import Session, select
from app.models import LifeEvent, UserProfile
from app.schemas import WhatIfResponse
from app.services.correlation.engine import engine
from app.services.llm import llm_service
from app.config import settings


def run_whatif_simulation(
    question: str,
    session: Session,
    user_id: str = settings.DEMO_USER_ID
) -> WhatIfResponse:
    # 1. Fetch user profile
    profile = session.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()
    monthly_budget = profile.monthly_budget if profile else settings.MONTHLY_BUDGET

    # 2. Fetch events
    events = session.exec(
        select(LifeEvent).where(LifeEvent.user_id == user_id).order_by(LifeEvent.timestamp)
    ).all()

    # 3. Compute budget summary
    engine.monthly_budget = monthly_budget
    budget = engine.compute_budget_summary(events)

    # 4. Run LLM What-If analysis
    return llm_service.answer_whatif(question=question, events=events, budget=budget)
