from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.models import LifeEvent
from app.schemas import InsightResponse, BudgetSummary, BriefingResponse, WhatIfResponse


class BaseLLMService(ABC):
    @abstractmethod
    def generate_briefing(
        self,
        user_name: str,
        insights: List[InsightResponse],
        budget: BudgetSummary,
        events: List[LifeEvent]
    ) -> BriefingResponse:
        pass

    @abstractmethod
    def answer_whatif(
        self,
        question: str,
        events: List[LifeEvent],
        budget: BudgetSummary
    ) -> WhatIfResponse:
        pass
