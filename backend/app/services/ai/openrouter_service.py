"""
OpenRouter API service for environmental image detection.
Fallback AI provider when Gemini is unavailable.
"""
from __future__ import annotations

import base64
import json
import os
import re
from pathlib import Path

import httpx

_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_MODEL = "openai/gpt-4o-mini"

_PROMPT = (
    "You are an environmental monitoring AI. "
    "Analyze this image and detect the primary environmental activity. "
    "Classify it as ONE of: illegal_mining, deforestation, river_encroachment, normal. "
    "Return ONLY valid JSON — no markdown, no explanation:\n\n"
    '{"violation_type": "illegal_mining | deforestation | river_encroachment | normal", '
    '"confidence": 0.85, "risk_score": 80}\n\n'
    "Rules: confidence is 0–1, risk_score is 0–100."
)


def _clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


async def analyze_with_openrouter(image_path: str, image_url: str | None = None) -> dict:
    """
    Analyze an image using OpenRouter (GPT-4o-mini vision).
    Accepts either a local file path (preferred) or a public image_url.
    Raises on any error so ai_router can handle it.
    """
    print("[AI] Switching to OpenRouter API (Gemini failed)")

    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://orbital-guard.app",
        "X-Title": "Orbital Guard",
    }

    # Prefer base64 local file so it works even without a public URL
    if image_path and Path(image_path).exists():
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        img_content = {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
        }
    elif image_url:
        img_content = {"type": "image_url", "image_url": {"url": image_url}}
    else:
        raise ValueError("No image_path or image_url provided to OpenRouter service")

    payload = {
        "model": _MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": _PROMPT},
                    img_content,
                ],
            }
        ],
        "max_tokens": 256,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(_OPENROUTER_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    print(f"[OpenRouter] HTTP {resp.status_code}")

    raw = data["choices"][0]["message"]["content"]
    print(f"[OpenRouter] Raw response: {raw[:200]}")

    result = json.loads(_clean_json(raw))

    if "violation_type" not in result:
        raise ValueError(f"OpenRouter response missing violation_type: {result}")

    result["violation_type"] = str(result["violation_type"])
    result["confidence"] = float(result.get("confidence", 0.0))
    result["risk_score"] = int(result.get("risk_score", 0))

    print(f"[OpenRouter] Parsed result: {result}")
    return result
