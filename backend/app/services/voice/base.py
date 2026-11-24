from abc import ABC, abstractmethod
from typing import Optional


class BaseVoiceService(ABC):
    @abstractmethod
    def synthesize_speech(self, text: str) -> Optional[bytes]:
        """
        Synthesize speech from text. Returns raw MP3/WAV audio bytes,
        or None if browser-native Web Speech API should handle speech.
        """
        pass
