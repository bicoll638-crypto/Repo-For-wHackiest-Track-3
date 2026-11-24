import os
from typing import Optional
import httpx
from app.config import settings
from app.services.voice.base import BaseVoiceService


class ElevenLabsVoiceService(BaseVoiceService):
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.voice_id = settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM"

    def synthesize_speech(self, text: str) -> Optional[bytes]:
        if not self.api_key:
            return None

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    return res.content
        except Exception as e:
            print(f"[ElevenLabs] Synthesis error: {e}")
        return None
