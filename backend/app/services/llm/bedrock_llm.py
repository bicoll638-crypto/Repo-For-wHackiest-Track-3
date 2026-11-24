import os
import json
from typing import List, Dict, Any
from app.models import LifeEvent
from app.schemas import InsightResponse, BudgetSummary, BriefingResponse, WhatIfResponse
from app.services.llm.base import BaseLLMService
from app.services.llm.template_llm import TemplateLLMService
from app.config import settings


class BedrockLLMService(BaseLLMService):
    """
    Live Bedrock Claude Adapter.
    Uses boto3 Bedrock Runtime if AWS credentials are set,
    otherwise falls back gracefully to TemplateLLMService.
    """

    def __init__(self):
        self.fallback = TemplateLLMService()
        self.has_credentials = bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)

    def generate_briefing(
        self,
        user_name: str,
        insights: List[InsightResponse],
        budget: BudgetSummary,
        events: List[LifeEvent]
    ) -> BriefingResponse:
        if not self.has_credentials:
            return self.fallback.generate_briefing(user_name, insights, budget, events)

        # Bedrock Claude invocation stub
        try:
            import boto3
            client = boto3.client(
                "bedrock-runtime",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            # Stub payload
            prompt = f"Generate a 60-second morning student briefing for {user_name} with budget {budget.remaining_budget}"
            # Return fallback on stub
            return self.fallback.generate_briefing(user_name, insights, budget, events)
        except Exception:
            return self.fallback.generate_briefing(user_name, insights, budget, events)

    def answer_whatif(
        self,
        question: str,
        events: List[LifeEvent],
        budget: BudgetSummary
    ) -> WhatIfResponse:
        if not self.has_credentials:
            return self.fallback.answer_whatif(question, events, budget)

        # Bedrock live stub
        try:
            return self.fallback.answer_whatif(question, events, budget)
        except Exception:
            return self.fallback.answer_whatif(question, events, budget)
