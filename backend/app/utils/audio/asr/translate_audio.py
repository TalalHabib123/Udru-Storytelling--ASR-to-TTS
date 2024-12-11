from transformers import pipeline
import librosa
from app.utils.audio.asr.load_model import load_whisper_model
from app.utils.load_torch import get_device, get_dtype

model, processor = load_whisper_model()

def transcribe_audio(audio_path: str):
    try:
        audio, _ = librosa.load(audio_path, sr=16000)
        
        pipe = pipeline(
            "automatic-speech-recognition",
            model=model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            chunk_length_s=30,
            batch_size=4,  # batch size for inference - set based on your device
            torch_dtype=get_dtype(),
            device=get_device(),
        )
        
        result_whisper = pipe(audio, generate_kwargs={"language": "urdu", "task": "translate"})
        
        return result_whisper["text"]
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""