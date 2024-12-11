import os
import scipy
from app.utils.audio.tts.load_model import load_model
from app.utils.load_torch import get_device
import torch

AUDIO_SYNTHESIS_DIRECTORY = 'synthesized_audio'
MODEL_TYPE = "hindi" # Default model type for audio synthesis   hindi, latin, arabic

model, tokenizer = load_model(MODEL_TYPE)

try:
    os.makedirs(AUDIO_SYNTHESIS_DIRECTORY, exist_ok=True)
except FileExistsError:
    pass
except Exception as e:
    print(f"Error creating audio upload directory: {e}")
    exit(1)
    

def translate_text_to_audio(text, file_id):
    """
    Translate the given text to audio using the TTS model.
    """
    try:
        inputs = tokenizer(text, return_tensors="pt")
        
        with torch.no_grad():
            output = model(**inputs).waveform
        
        file_path = f"{AUDIO_SYNTHESIS_DIRECTORY}/{file_id}.wav"        
        
        scipy.io.wavfile.write(f"{file_path}", 
                               rate=model.config.sampling_rate, 
                               data=output.squeeze().numpy())
        
        return file_path
        
    except Exception as e:
        print(f"Error translating text to audio: {e}")
        return None