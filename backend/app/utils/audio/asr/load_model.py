from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
from app.utils.load_torch import get_device, get_dtype

model_id = "openai/whisper-large-v3-turbo"

def load_whisper_model():
    try:
        model_whisper = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_id, torch_dtype=get_dtype()
        )
        model_whisper.to(get_device())

        processor = AutoProcessor.from_pretrained(model_id)
        
        return model_whisper, processor
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)