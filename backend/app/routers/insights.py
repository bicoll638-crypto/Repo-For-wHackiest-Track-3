from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models import LifeEvent, UserProfile
from app.schemas import InsightResponse, BudgetSummary
from app.services.correlation.engine import engine
from app.config import settings

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("", response_model=List[InsightResponse])
def get_insights(session: Session = Depends(get_session)):
    """
    Runs pure correlation detectors across events and surfaces cause->effect chains.
    """
    profile = session.exec(select(UserProfile).where(UserProfile.user_id == settings.DEMO_USER_ID)).first()
    engine.monthly_budget = profile.monthly_budget if profile else settings.MONTHLY_BUDGET

    events = session.exec(
        select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID).order_by(LifeEvent.timestamp)
    ).all()

    return engine.analyze_events(events)


@router.get("/budget", response_model=BudgetSummary)
def get_budget_summary(session: Session = Depends(get_session)):
    """
    Returns monthly budget, current burn rate, and projected depletion calculation.
    """
    profile = session.exec(select(UserProfile).where(UserProfile.user_id == settings.DEMO_USER_ID)).first()
    engine.monthly_budget = profile.monthly_budget if profile else settings.MONTHLY_BUDGET

    events = session.exec(
        select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID)
    ).all()

    return engine.compute_budget_summary(events)
