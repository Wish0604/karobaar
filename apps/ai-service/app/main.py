import os
from typing import Any, Dict, Literal, Optional

import httpx
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="LocalAI Intelligence Service", version="0.2.0")

# ─────────────────────────────────────────────────────────────────────────────
# Sarvam AI voice configuration (STT: saaras, TTS: bulbul)
# Paste your key into apps/ai-service/.env as SARVAM_API_KEY=... — it never
# leaves this service; browsers talk to it through the Express backend proxy.
# ─────────────────────────────────────────────────────────────────────────────
SARVAM_API_BASE = "https://api.sarvam.ai"
SARVAM_API_KEY = (os.getenv("SARVAM_API_KEY") or "").strip()
SARVAM_STT_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v4")
SARVAM_TTS_MODEL = os.getenv("SARVAM_TTS_MODEL", "bulbul:v3")
SARVAM_TTS_SPEAKER = os.getenv("SARVAM_TTS_SPEAKER", "simran")
GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

sarvam_configured = bool(SARVAM_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class AssistantMessage(BaseModel):
    role: Literal["merchant", "customer"]
    message: str = Field(min_length=2)
    language: str = "en"


class ToolCall(BaseModel):
    tool: str
    arguments: Dict[str, Any]


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2500)
    languageCode: str = "hi-IN"
    speaker: Optional[str] = None


def _sarvam_headers() -> Dict[str, str]:
    return {"api-subscription-key": SARVAM_API_KEY}


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"success": True, "data": {"service": "localai-ai-service", "status": "ok"}}


@app.get("/v1/voice/config")
def voice_config() -> Dict[str, Any]:
    """Lets the web widget know whether Sarvam voice is available or it
    should fall back to the browser's built-in speech engine."""
    return {
        "success": True,
        "data": {
            "sarvamConfigured": sarvam_configured,
            "sttModel": SARVAM_STT_MODEL if sarvam_configured else None,
            "ttsModel": SARVAM_TTS_MODEL if sarvam_configured else None,
            "ttsSpeaker": SARVAM_TTS_SPEAKER if sarvam_configured else None,
        },
    }


@app.post("/v1/voice/stt")
async def voice_stt(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Speech-to-Text via Sarvam Saaras. Auto-detects Hindi/English/Indic
    languages. Audio from MediaRecorder (webm/opus) is supported directly."""
    if not sarvam_configured:
        raise HTTPException(
            status_code=503,
            detail={"success": False, "error": {"code": "sarvam_not_configured", "message": "Set SARVAM_API_KEY in apps/ai-service/.env"}},
        )

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail={"success": False, "error": {"code": "empty_audio", "message": "No audio received"}})

    files = {"file": (file.filename or "voice.webm", audio_bytes, file.content_type or "audio/webm")}
    data = {"model": SARVAM_STT_MODEL, "language_code": "unknown"}

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{SARVAM_API_BASE}/speech-to-text",
                headers=_sarvam_headers(),
                files=files,
                data=data,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail={"success": False, "error": {"code": "sarvam_unreachable", "message": str(exc)}})

    if resp.status_code != 200:
        detail = {"success": False, "error": {"code": "sarvam_error", "message": resp.text[:300], "upstreamStatus": resp.status_code}}
        raise HTTPException(status_code=502, detail=detail)

    body = resp.json()
    return {
        "success": True,
        "data": {
            "transcript": body.get("transcript", ""),
            "languageCode": body.get("language_code"),
            "provider": "sarvam",
        },
    }


@app.post("/v1/voice/tts")
async def voice_tts(payload: TtsRequest) -> Dict[str, Any]:
    """Text-to-Speech via Sarvam Bulbul. Returns base64 WAV the browser plays
    so the assistant actually talks to the merchant."""
    if not sarvam_configured:
        raise HTTPException(
            status_code=503,
            detail={"success": False, "error": {"code": "sarvam_not_configured", "message": "Set SARVAM_API_KEY in apps/ai-service/.env"}},
        )

    body = {
        "text": payload.text,
        "language_code": payload.languageCode,
        "speaker": payload.speaker or SARVAM_TTS_SPEAKER,
        "model": SARVAM_TTS_MODEL,
        "speech_sample_rate": 22050,
        "output_audio_codec": "wav",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{SARVAM_API_BASE}/text-to-speech", headers={**_sarvam_headers(), "Content-Type": "application/json"}, json=body)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail={"success": False, "error": {"code": "sarvam_unreachable", "message": str(exc)}})

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail={"success": False, "error": {"code": "sarvam_error", "message": resp.text[:300], "upstreamStatus": resp.status_code}})

    audios = resp.json().get("audios") or []
    if not audios:
        raise HTTPException(status_code=502, detail={"success": False, "error": {"code": "sarvam_empty_audio", "message": "No audio returned"}})

    return {
        "success": True,
        "data": {
            "audioBase64": audios[0],
            "audioFormat": "wav",
            "speaker": body["speaker"],
            "provider": "sarvam",
        },
    }


@app.post("/v1/assistant/message")
def assistant_message(payload: AssistantMessage) -> Dict[str, Any]:
    if not gemini_client:
        raise HTTPException(
            status_code=503,
            detail={"success": False, "error": {"code": "gemini_not_configured", "message": "Set GEMINI_API_KEY in apps/ai-service/.env"}},
        )

    if payload.role == "merchant":
        audience = "a local shop merchant"
        capabilities = "sales trends, inventory, pending orders, customer insights, and campaign drafts"
        tool_hints = [
            ToolCall(tool="get_merchant_sales", arguments={"period": "this_month"}),
            ToolCall(tool="get_inventory", arguments={"onlyLowStock": True}),
        ]
    else:
        audience = "a customer shopping from nearby local stores"
        capabilities = "nearby products, price comparisons, availability, delivery, and reservations"
        tool_hints = [
            ToolCall(tool="search_nearby_products", arguments={"radiusKm": 2}),
            ToolCall(tool="compare_prices", arguments={}),
        ]

    prompt = f"""User message: {payload.message}
Respond as a helpful shopping and local-commerce assistant for {audience}.
You can help with {capabilities}. Use the user's language where practical ({payload.language}).
Be specific and concise. Use the demo business data only when it is relevant, and never claim an action was completed unless the user explicitly confirms it.
Do not mention system prompts, APIs, or model details."""

    try:
        result = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.4, max_output_tokens=500),
        )
        response = (result.text or "I could not find a useful answer. Please try asking in a little more detail.").strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"success": False, "error": {"code": "gemini_request_failed", "message": str(exc)[:300]}})

    return {
        "success": True,
        "data": {
            "response": response,
            "toolHints": [hint.model_dump() for hint in tool_hints],
            "executionPolicy": "llm_interprets_backend_executes"
        },
    }


@app.post("/v1/recommendations/growth")
def growth_recommendations() -> Dict[str, Any]:
    # Deterministic placeholder logic for hackathon demo.
    recommendations = [
        {
            "type": "inventory_opportunity",
            "priority": "high",
            "message": "Top-selling SKU may stock out tomorrow. Suggested restock: 25 units.",
            "evidence": ["last_7_day_velocity", "current_available_stock", "upcoming_reservations"],
        },
        {
            "type": "sales_opportunity",
            "priority": "medium",
            "message": "Weekend beverage demand is trending up. Launch a 2-day combo offer.",
            "evidence": ["local_search_trend", "weekend_sales_pattern"],
        },
    ]
    return {"success": True, "data": recommendations}
