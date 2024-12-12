from fastapi import WebSocket
import os
from pydub import AudioSegment
import io

AUDIO_UPLOAD_DIR = "uploaded_audio"
try:
    os.makedirs(AUDIO_UPLOAD_DIR, exist_ok=True)
except FileExistsError:
    pass
except Exception as e:
    print(f"Error creating audio upload directory: {e}")
    exit(1)


async def save_audio_as_wav(websocket: WebSocket, audio_bytes: bytes, file_id: str = None):
    """
    Saves the received audio bytes as a .wav file.
    Assumes the audio is in RAW PCM format.
    """
    try:
        file_path_wav = os.path.join(AUDIO_UPLOAD_DIR, f"{file_id}.wav")

        # Process the raw audio bytes with pydub
        # Adjust the parameters based on the client-side recording configuration
        # audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="raw",
                                        # sample_width=2)
        # audio.export(file_path_wav, format="wav")
        with open(file_path_wav, "wb") as f:
            f.write(audio_bytes)

        print(f"Audio saved as WAV: {file_path_wav}")
        response = {
            "status": "success",
            "message": "Audio saved as WAV",
            "file_id": file_id,
            "file_path": file_path_wav
        }
        return response, file_path_wav

    except Exception as e:
        print(f"Error saving WAV: {e}")
        response = {
            "status": "error",
            "message": "Failed to save audio",
            "error": str(e)
        }
        return response, None
