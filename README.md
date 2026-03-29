# Urdu Storytelling — ASR to TTS

End-to-end voice storytelling application that:
1. Records user audio in the browser,
2. Transcribes speech (ASR),
3. Generates a creative Urdu story with an LLM,
4. Synthesizes the story back to speech (TTS),
5. Plays and downloads the generated audio.

The project is split into a **React + Vite frontend** and a **FastAPI backend** connected primarily over **WebSockets**.

---

## ✨ What this project does

- 🎙️ Records microphone input from the browser.
- 🔌 Streams/sends audio bytes to the backend via WebSocket (`/ws`).
- 🧠 Runs an ASR → LLM → TTS pipeline:
  - **ASR**: Whisper (`openai/whisper-large-v3-turbo`)
  - **LLM**: Ollama local endpoint (`gemma2`)
  - **TTS**: Meta MMS Urdu VITS (default: Arabic-script Urdu model)
- 📄 Returns generated Urdu story text.
- 🔊 Serves generated `.wav` and allows playback/download in UI.

---

## 🧱 Architecture

```text
Browser (React)
  ├─ records audio (MediaRecorder)
  ├─ sends bytes over ws://localhost:8000/ws
  └─ renders story + waveform + download

FastAPI Backend
  ├─ WebSocket endpoint (/ws)
  ├─ saves incoming audio to uploaded_audio/<id>.wav
  ├─ ASR: transcribe_audio(...)
  ├─ LLM: query_model(...) via Ollama (localhost:11434)
  ├─ TTS: translate_text_to_audio(...)
  └─ exposes GET /get-audio/{file_id}
```

---

## 📁 Repository structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app + /ws + /get-audio
│   │   └── utils/
│   │       ├── pipeline/pipeline.py       # ASR → LLM → TTS orchestration
│   │       ├── query_model.py             # Ollama call (gemma2)
│   │       ├── load_torch.py              # device/dtype helpers
│   │       ├── audio/
│   │       │   ├── handle_audio.py        # saves uploaded bytes as wav
│   │       │   ├── asr/                    # Whisper model + transcription
│   │       │   └── tts/                    # MMS VITS loading + synthesis
│   │       └── socket/connection_manager.py
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/App.jsx                        # recording + websocket + playback UI
│   ├── package.json
│   └── ...
└── README.md
```

---

## ✅ Prerequisites

### System
- Python 3.10+
- Node.js 18+
- npm 9+
- `ffmpeg` (recommended for robust audio handling)

### Runtime services
- **Ollama running locally** on `http://localhost:11434`
- `gemma2` model available in Ollama

### Hardware notes
- Works on CPU, but model inference is much slower.
- CUDA GPU significantly improves ASR/TTS latency.

---

## 🚀 Quick start

## 1) Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run backend:

```bash
python -m uvicorn app.main:app --port 8000 --reload
```

(Equivalent command from existing backend note: `uvicorn app.main:app --port 8000 --reload`.)

## 2) Ollama setup (required for story generation)

In another terminal:

```bash
ollama serve
ollama pull gemma2
```

## 3) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

By default Vite runs on `http://localhost:5173`.

## 4) Use the app

1. Open frontend in browser.
2. Allow microphone permissions.
3. Record audio.
4. Stop and send audio.
5. Wait for generated story/audio.
6. Play or download synthesized result.

---

## 🔌 API and socket contract

### HTTP endpoints

- `GET /`
  - Health-style welcome response.
- `GET /get-audio/{file_id}`
  - Returns synthesized WAV file.

### WebSocket endpoint

- `WS /ws`

#### Expected client behavior
- Open WebSocket.
- Send audio bytes payload.

#### Server response pattern
The backend may send multiple JSON messages during processing, including success/error states. Final success includes:

```json
{
  "status": "success",
  "message": "Pipeline processed successfully",
  "file_id": "<uuid>",
  "audio_url": "/get-audio/<uuid>",
  "story": "<generated urdu story>"
}
```

---

## 🧠 Model details and defaults

### ASR
- Hugging Face model: `openai/whisper-large-v3-turbo`
- Audio loaded at 16kHz and processed through `transformers.pipeline`.

### LLM
- Endpoint: `http://localhost:11434/api/generate`
- Model: `gemma2`
- Prompting enforces Urdu-script storytelling constraints.

### TTS
- Default TTS script model type: `arabic`
- Backed by MMS models:
  - `facebook/mms-tts-urd-script_arabic` (default)
  - also supports `latin`, `hindi` in code

> First run will download large model artifacts from Hugging Face/Ollama.

---

## ⚙️ Configuration notes

Current values are hardcoded in source:
- Frontend WebSocket URL: `ws://localhost:8000/ws`
- Frontend audio URL base: `http://localhost:8000/get-audio/{file_id}`
- Ollama URL/model in backend query helper.

Recommended improvement: move these to environment variables (`.env`) for easier deployment.

---

## 🧪 Development commands

### Backend
```bash
cd backend
python -m uvicorn app.main:app --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm run dev
npm run build
npm run lint
```

---

## 🛠️ Troubleshooting

### 1) "Error: Failed to get response from LLaMA..."
- Ensure Ollama is running: `ollama serve`
- Ensure model is available: `ollama pull gemma2`

### 2) No audio output file returned
- Check backend logs for ASR/TTS exceptions.
- Verify `synthesized_audio/` directory permissions.

### 3) Very slow generation
- Expected on CPU with large ASR/TTS models.
- Use GPU/CUDA if available.

### 4) Browser mic issues
- Ensure HTTPS/localhost and mic permissions are granted.
- Confirm no other tab/app is locking microphone.

---

## 🔐 Security and production notes

Current implementation is development-friendly and should be hardened before production:
- CORS currently allows all origins (`*`).
- No auth/rate limiting on socket/API endpoints.
- Localhost assumptions for WS/API/LLM endpoints.
- File lifecycle/cleanup strategy for uploaded/synthesized audio should be added.

---

## 🗺️ Suggested roadmap

- Add `.env`-driven config for all endpoints/models.
- Stream partial LLM/TTS responses for lower perceived latency.
- Add background job queue for heavy inference workloads.
- Add tests (unit + integration for socket pipeline).
- Add Docker compose for frontend/backend/ollama services.
- Add observability (structured logs + metrics + tracing).

---

## 📜 License

No explicit license file is present yet. Add a `LICENSE` file before public redistribution.

---

## 🙌 Acknowledgements

Built with:
- FastAPI, Uvicorn, WebSockets
- Hugging Face Transformers + Torch
- Ollama
- React + Vite + WaveSurfer
