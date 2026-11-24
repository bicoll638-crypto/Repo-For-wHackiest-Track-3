from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LifeEvent(SQLModel, table=True):
    __tablename__ = "life_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(default="arjun_demo", index=True)
    event_type: str = Field(index=True)  # expense, class, sleep, study, deadline
    title: str
    timestamp: datetime = Field(index=True)
    
    # Typed fields for clean analytics
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None  # attended, missed, late, completed, planned, pending
    subject: Optional[str] = None
    confidence_score: float = Field(default=1.0)
    raw_text: Optional[str] = None
    source: str = Field(default="seed")
    extra_data: Optional[str] = None
    created_at: datetime = Field(default_factory=get_utc_now)


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(default="arjun_demo", unique=True, index=True)
    name: str = "Arjun"
    college: str = "RVCE Bengaluru"
    semester: str = "2nd Year CSE"
    monthly_budget: float = 6000.0
    currency: str = "INR"
    updated_at: datetime = Field(default_factory=get_utc_now)


class InsightRecord(SQLModel, table=True):
    __tablename__ = "insights"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(default="arjun_demo", index=True)
    detector_key: str
    severity: str  # info, warn, critical
    title: str
    cause: str
    effect: str
    explanation: str
    action: str
    evidence_event_ids: str = "[]"  # JSON list
    created_at: datetime = Field(default_factory=get_utc_now)

