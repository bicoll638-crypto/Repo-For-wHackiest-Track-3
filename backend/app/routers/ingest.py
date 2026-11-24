from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import Session
from app.db import get_session
from app.models import LifeEvent
from app.schemas import IngestTextRequest, IngestVoiceRequest, IngestResponse, LifeEventRead
from app.services.ingestion.mock_extractor import extract_events_from_file
from app.services.ingestion.note_parser import parse_note_to_event
from app.config import settings

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


@router.post("/file", response_model=IngestResponse)
async def ingest_file(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Accepts uploaded student documents (UPI screenshot, syllabus/timetable PDF, sleep logs).
    Mock extractor simulates OCR & LLM visual parsing into structured LifeEvents.
    """
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    parsed_creates = extract_events_from_file(file.filename or "receipt.png", contents)
    saved_events = []

    for item in parsed_creates:
        ev = LifeEvent(
            user_id=settings.DEMO_USER_ID,
            event_type=item.event_type,
            title=item.title,
            timestamp=item.timestamp,
            amount=item.amount,
            category=item.category,
            merchant=item.merchant,
            duration_minutes=item.duration_minutes,
            status=item.status,
            subject=item.subject,
            confidence_score=item.confidence_score,
            raw_text=item.raw_text,
            source=item.source
        )
        session.add(ev)
        session.commit()
        session.refresh(ev)
        saved_events.append(LifeEventRead.model_validate(ev))

    return IngestResponse(
        success=True,
        parsed_events=saved_events,
        message=f"Successfully extracted {len(saved_events)} event(s) from '{file.filename}'.",
        extraction_confidence=saved_events[0].confidence_score if saved_events else 1.0
    )


@router.post("/text", response_model=IngestResponse)
def ingest_text(
    payload: IngestTextRequest,
    session: Session = Depends(get_session)
):
    """
    Parses unstructured text note using regex & heuristic intelligence.
    Example: 'Spent 120 on snacks after late lab'
    """
    parsed_item = parse_note_to_event(payload.text, source=payload.source)
    ev = LifeEvent(
        user_id=settings.DEMO_USER_ID,
        event_type=parsed_item.event_type,
        title=parsed_item.title,
        timestamp=parsed_item.timestamp,
        amount=parsed_item.amount,
        category=parsed_item.category,
        merchant=parsed_item.merchant,
        duration_minutes=parsed_item.duration_minutes,
        status=parsed_item.status,
        subject=parsed_item.subject,
        confidence_score=parsed_item.confidence_score,
        raw_text=parsed_item.raw_text,
        source=parsed_item.source
    )
    session.add(ev)
    session.commit()
    session.refresh(ev)

    saved_event = LifeEventRead.model_validate(ev)
    return IngestResponse(
        success=True,
        parsed_events=[saved_event],
        message=f"Extracted {ev.event_type.capitalize()} event with {int(ev.confidence_score * 100)}% confidence.",
        extraction_confidence=ev.confidence_score
    )


@router.post("/voice", response_model=IngestResponse)
def ingest_voice(
    payload: IngestVoiceRequest,
    session: Session = Depends(get_session)
):
    """
    Ingests transcribed speech note and maps to structured LifeEvent.
    """
    parsed_item = parse_note_to_event(payload.transcript, source="voice_note")
    ev = LifeEvent(
        user_id=settings.DEMO_USER_ID,
        event_type=parsed_item.event_type,
        title=parsed_item.title,
        timestamp=parsed_item.timestamp,
        amount=parsed_item.amount,
        category=parsed_item.category,
        merchant=parsed_item.merchant,
        duration_minutes=parsed_item.duration_minutes,
        status=parsed_item.status,
        subject=parsed_item.subject,
        confidence_score=parsed_item.confidence_score,
        raw_text=parsed_item.raw_text,
        source="voice_note"
    )
    session.add(ev)
    session.commit()
    session.refresh(ev)

    saved_event = LifeEventRead.model_validate(ev)
    return IngestResponse(
        success=True,
        parsed_events=[saved_event],
        message=f"Voice note transcribed and logged as {ev.event_type.capitalize()}.",
        extraction_confidence=ev.confidence_score
    )
