from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.config import settings
from app.db import init_db, engine
from app.models import LifeEvent
from app.seed import seed_database
from app.schemas import HealthResponse

from app.routers import (
    ingest,
    events,
    insights,
    briefing,
    whatif,
    voice,
    privacy,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed demo data on first start
    init_db()
    seed_database(force=False)
    yield


app = FastAPI(
    title="AURA: Personal Data Twin API",
    description="Proactive, voice-first personal intelligence assistant for college students.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(ingest.router)
app.include_router(events.router)
app.include_router(insights.router)
app.include_router(briefing.router)
app.include_router(whatif.router)
app.include_router(voice.router)
app.include_router(privacy.router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    with Session(engine) as session:
        events = session.exec(
            select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID)
        ).all()
        last_ev = events[-1] if events else None
        return HealthResponse(
            status="ok",
            mode=settings.AURA_MODE,
            persona=settings.DEMO_USER_NAME,
            total_events=len(events),
            last_event_time=last_ev.timestamp if last_ev else None
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
