from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.schemas import BriefingResponse
from app.services.briefing import generate_morning_briefing
from app.config import settings

router = APIRouter(prefix="/api/briefing", tags=["Briefing"])


@router.get("", response_model=BriefingResponse)
def get_morning_briefing(session: Session = Depends(get_session)):
    """
    Generates a 60-second morning intelligence briefing for Arjun.
    Spoken in the frontend using the browser Web Speech API.
    """
    return generate_morning_briefing(session, user_id=settings.DEMO_USER_ID)
