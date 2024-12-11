from transformers import VitsModel, AutoTokenizer
from app.utils.load_torch import get_device

def load_model(type: str):
    try:
        if type == "latin":
            model = VitsModel.from_pretrained("facebook/mms-tts-urd-script_latin")
            tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-urd-script_latin")
        elif type == "hindi":
            model = VitsModel.from_pretrained("facebook/mms-tts-urd-script_devanagari")
            tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-urd-script_devanagari")
        elif type == "arabic":
            model = VitsModel.from_pretrained("facebook/mms-tts-urd-script_arabic")
            tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-urd-script_arabic")

        model.to(get_device())
        # tokenizer.to(get_device())
        return model, tokenizer
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)