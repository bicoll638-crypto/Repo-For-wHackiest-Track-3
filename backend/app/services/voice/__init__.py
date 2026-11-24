from app.config import settings
from app.services.voice.base import BaseVoiceService
from app.services.voice.mock import MockVoiceService
from app.services.voice.elevenlabs import ElevenLabsVoiceService


def get_voice_service() -> BaseVoiceService:
    if settings.AURA_MODE == "live" or bool(settings.ELEVENLABS_API_KEY):
        return ElevenLabsVoiceService()
    return MockVoiceService()


voice_service = get_voice_service()
