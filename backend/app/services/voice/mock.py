from typing import Optional
from app.services.voice.base import BaseVoiceService


class MockVoiceService(BaseVoiceService):
    def synthesize_speech(self, text: str) -> Optional[bytes]:
        """
        Mock voice adapter returns None so client-side browser Web Speech API
        (SpeechSynthesis) seamlessly speaks with zero latency and zero API keys.
        """
        return None
