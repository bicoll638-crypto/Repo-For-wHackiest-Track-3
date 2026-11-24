from fastapi import APIRouter, Response
from pydantic import BaseModel
from app.services.voice import voice_service

router = APIRouter(prefix="/api/voice", tags=["Voice"])


class SynthesizeRequest(BaseModel):
    text: str


@router.post("/synthesize")
def synthesize_voice(payload: SynthesizeRequest):
    """
    Synthesize audio using ElevenLabs if key configured,
    or signals frontend to use browser-native Web Speech API.
    """
    audio_bytes = voice_service.synthesize_speech(payload.text)
    if audio_bytes:
        return Response(content=audio_bytes, media_type="audio/mpeg")
    return {"status": "client_tts_fallback", "message": "Use browser Web Speech API for zero-latency TTS."}
