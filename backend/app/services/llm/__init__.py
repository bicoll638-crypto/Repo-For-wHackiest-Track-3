from app.config import settings
from app.services.llm.base import BaseLLMService
from app.services.llm.template_llm import TemplateLLMService
from app.services.llm.bedrock_llm import BedrockLLMService


def get_llm_service() -> BaseLLMService:
    if settings.AURA_MODE == "live":
        return BedrockLLMService()
    return TemplateLLMService()


llm_service = get_llm_service()
