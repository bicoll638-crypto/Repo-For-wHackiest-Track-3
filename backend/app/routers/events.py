from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.db import get_session
from app.models import LifeEvent
from app.schemas import LifeEventRead, LifeEventCreate
from app.config import settings

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("", response_model=List[LifeEventRead])
def list_events(
    event_type: Optional[str] = Query(None, description="Filter by event type (expense, class, sleep, study, deadline)"),
    limit: int = Query(100, ge=1, le=500),
    session: Session = Depends(get_session)
):
    query = select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID)
    if event_type:
        query = query.where(LifeEvent.event_type == event_type)
    query = query.order_by(LifeEvent.timestamp.desc()).limit(limit)
    
    events = session.exec(query).all()
    return [LifeEventRead.model_validate(e) for e in events]


@router.post("", response_model=LifeEventRead)
def create_event(
    event_in: LifeEventCreate,
    session: Session = Depends(get_session)
):
    ev = LifeEvent(
        user_id=settings.DEMO_USER_ID,
        event_type=event_in.event_type,
        title=event_in.title,
        timestamp=event_in.timestamp,
        amount=event_in.amount,
        category=event_in.category,
        merchant=event_in.merchant,
        duration_minutes=event_in.duration_minutes,
        status=event_in.status,
        subject=event_in.subject,
        confidence_score=event_in.confidence_score,
        raw_text=event_in.raw_text,
        source=event_in.source
    )
    session.add(ev)
    session.commit()
    session.refresh(ev)
    return LifeEventRead.model_validate(ev)
