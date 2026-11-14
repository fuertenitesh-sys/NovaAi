import os
import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from groq import AsyncGroq
import httpx

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fuerte AI Voice Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

groq_client = AsyncGroq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are Nova, an intelligent AI voice assistant built by Nova.ai.
You are helpful, professional, warm, and concise. You understand English, Hindi, and Hinglish naturally.
Keep your responses short — 1 to 3 sentences max — since they will be spoken aloud.
Be friendly and natural. If asked about Nova.ai, say it is a cutting-edge enterprise AI company
that deploys custom AI systems for businesses. If asked about yourself, say you are Nova,
Nova's voice AI for customer calls and business automation."""

conversation_histories = {}


@app.get("/")
async def root():
    return FileResponse("../frontend/index.html")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Fuerte AI Voice Assistant"}


@app.post("/api/transcribe")
async def transcribe_audio(request: dict):
    """Transcribe audio using Deepgram REST API"""
    audio_url = request.get("audio_url")
    if not audio_url:
        return {"error": "No audio URL provided"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.deepgram.com/v1/listen",
            headers={
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "url": audio_url,
                "model": "nova-2",
                "language": "hi-en",
                "smart_format": True,
            },
        )
        result = response.json()
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
        return {"transcript": transcript}


@app.websocket("/ws/voice/{session_id}")
async def voice_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info(f"Client connected: {session_id}")

    if session_id not in conversation_histories:
        conversation_histories[session_id] = []

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            # --- Handle text input (after STT on frontend) ---
            if msg_type == "transcript":
                user_text = message.get("text", "").strip()
                if not user_text:
                    continue

                logger.info(f"[{session_id}] User: {user_text}")

                # Send "thinking" status
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "status": "thinking"
                }))

                # Add to history
                conversation_histories[session_id].append({
                    "role": "user",
                    "content": user_text
                })

                # Keep last 10 turns only (memory management)
                if len(conversation_histories[session_id]) > 20:
                    conversation_histories[session_id] = conversation_histories[session_id][-20:]

                # Get LLM response (streaming)
                messages = [{"role": "system", "content": SYSTEM_PROMPT}] + \
                           conversation_histories[session_id]

                full_response = ""
                await websocket.send_text(json.dumps({
                    "type": "llm_start"
                }))

                async with groq_client.chat.completions.stream(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    max_tokens=200,
                    temperature=0.7,
                ) as stream:
                    async for chunk in stream:
                        delta = chunk.choices[0].delta.content
                        if delta:
                            full_response += delta
                            await websocket.send_text(json.dumps({
                                "type": "llm_token",
                                "token": delta
                            }))

                logger.info(f"[{session_id}] AI: {full_response}")

                # Save AI response
                conversation_histories[session_id].append({
                    "role": "assistant",
                    "content": full_response
                })

                # Now get TTS audio
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "status": "speaking"
                }))

                tts_audio_b64 = await text_to_speech(full_response)

                await websocket.send_text(json.dumps({
                    "type": "audio_response",
                    "audio_b64": tts_audio_b64,
                    "text": full_response
                }))

            elif msg_type == "clear_history":
                conversation_histories[session_id] = []
                await websocket.send_text(json.dumps({
                    "type": "history_cleared"
                }))

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
        if session_id in conversation_histories:
            del conversation_histories[session_id]
    except Exception as e:
        logger.error(f"Error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))


async def text_to_speech(text: str) -> str:
    """Convert text to speech using ElevenLabs and return base64 audio"""
    import base64

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": "eleven_turbo_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
        )

        if response.status_code == 200:
            audio_bytes = response.content
            return base64.b64encode(audio_bytes).decode("utf-8")
        else:
            logger.error(f"TTS Error: {response.status_code} - {response.text}")
            return ""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
