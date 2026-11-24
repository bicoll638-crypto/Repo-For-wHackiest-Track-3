from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class LifeEventBase(BaseModel):
    event_type: str
    title: str
    timestamp: datetime
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    subject: Optional[str] = None
    confidence_score: float = 1.0
    raw_text: Optional[str] = None
    source: str = "user_input"
    extra_data: Optional[str] = None


class LifeEventCreate(LifeEventBase):
    pass


class LifeEventRead(LifeEventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    created_at: datetime


class IngestTextRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=1000)
    source: str = "text_note"


class IngestVoiceRequest(BaseModel):
    transcript: str = Field(..., min_length=3, max_length=1000)
    audio_base64: Optional[str] = None


class IngestResponse(BaseModel):
    success: bool
    parsed_events: List[LifeEventRead]
    message: str
    extraction_confidence: float = 1.0


class InsightResponse(BaseModel):
    id: Optional[int] = None
    detector_key: str
    severity: str  # "info" | "warn" | "critical"
    title: str
    cause: str
    effect: str
    explanation: str
    action: str
    evidence_event_ids: List[int] = []
    evidence_events: List[LifeEventRead] = []
    created_at: Optional[datetime] = None


class BriefingResponse(BaseModel):
    script: str
    highlights: List[str]
    generated_at: str
    word_count: int
    audio_url: Optional[str] = None
    key_metrics: Dict[str, Any] = {}


class WhatIfRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)


class WhatIfResponse(BaseModel):
    question: str
    intent: str
    risk_score: int  # 0 to 100
    risk_level: str  # "low" | "moderate" | "high" | "critical"
    predicted_consequences: List[str]
    recommendation: str
    spoken_answer: str
    reasoning_chain: List[str]
    metrics_delta: Dict[str, Any] = {}


class BudgetSummary(BaseModel):
    monthly_budget: float
    total_spent: float
    remaining_budget: float
    burn_rate_daily: float
    target_daily_budget: float
    projected_depletion_day: int
    projected_depletion_date: str
    days_early: int
    days_remaining_in_month: int
    status: str  # "on_track", "warning", "critical_burn"


class PrivacyWipeResponse(BaseModel):
    status: str
    deleted_events_count: int
    message: str


class HealthResponse(BaseModel):
    status: str
    mode: str
    persona: str
    total_events: int
    last_event_time: Optional[datetime] = None
