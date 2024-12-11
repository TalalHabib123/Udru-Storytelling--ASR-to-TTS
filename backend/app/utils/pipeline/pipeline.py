from app.utils.audio.asr.translate_audio import transcribe_audio
from app.utils.audio.tts.audio_synthesis import translate_text_to_audio


def process_pipeline(file_path: str, file_id: str):
    try:
        transcribed_audio = transcribe_audio(file_path)
        if not transcribed_audio:
            raise Exception("Error transcribing audio")
        
        
        #Here will the LLM code go, the text should be preprocessed and then passed to the TTS model
        dummy_text = "This is a dummy text message"
        
        audio_file_path = translate_text_to_audio(dummy_text, file_id)  
        
        if not audio_file_path:
            raise Exception("Error translating text to audio")
        
        response = {
            "status": "success",
            "message": "Pipeline processed successfully",
            "file_id": file_id,
            "audio_url": f"/get-audio/{file_id}",  # URL to download the audio file Add the server URL before this in the frontend
            "story": dummy_text,
        }
        
        return response
    
    except Exception as e:
        print(f"Error processing pipeline: {e}")
        response = {
            "status": "error",
            "message": "Error processing pipeline",
            "error": str(e)
        }
        return response