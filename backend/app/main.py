import json
import uuid

from app.utils.text.categories import handle_text_message
from app.utils.audio.handle_audio import save_audio_as_wav
from app.utils.socket.connection_manager import ConnectionManager
from pipeline import process_pipeline

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse

app = FastAPI(title="WebSocket Audio & JSON Handler")

manager = ConnectionManager()

ws_connections = {}

# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to the WebSocket server!"}

# Route to get the audio file
@app.get("/get-audio/{file_id}")
async def get_audio(file_id: str):
    file_path = f"tts_outputs/{file_id}.wav"
    return FileResponse(path=file_path, media_type="audio/wav", filename=f"{file_id}.wav")

# WebSocket route
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive()

            if data["type"] == "websocket.receive":
                file_id = str(uuid.uuid4())
                ws_connections[file_id] = websocket
                if "text" in data:
                    text_message = data["text"]
                    response = await handle_text_message(websocket, text_message, file_id)
                    await manager.send_message(websocket, json.dumps(response))
                elif not "bytes" in data:
                    raise Exception("Invalid message format")

                audio_bytes = data["bytes"]
                response, file_path = await save_audio_as_wav(websocket, audio_bytes, file_id)
                await manager.send_message(websocket, json.dumps(response))
                if file_path== "":
                        raise Exception("Error in saving audio file")

                response = process_pipeline(file_path, file_id)
                if response["status"] == "error":
                    await manager.send_message(websocket, json.dumps(response))
                    raise Exception(response["message"])

                await manager.send_message(websocket, json.dumps(response))
                if ws_connections[file_id]:
                    manager.disconnect(ws_connections[file_id])
                    del ws_connections[file_id]

            elif data["type"] == "websocket.disconnect":
                break

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Unexpected error: {e}")
        manager.disconnect(websocket)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
