"""
Gemini Vision API service for environmental image detection.
Primary AI provider.
"""
from __future__ import annotations

import json
import os
import re

import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash")

_PROMPT = """
You are an environmental monitoring AI.

Analyze this satellite / field image and detect the primary environmental activity.

Classify it as ONE of:
- illegal_mining
- deforestation
- river_encroachment
- normal

Return ONLY valid JSON — no markdown, no explanation:

{
  "violation_type": "illegal_mining | deforestation | river_encroachment | normal",
  "confidence": 0.85,
  "risk_score": 80
}

Rules:
- confidence is a number between 0 and 1
- risk_score is an integer between 0 and 100
- violation_type must be one of the four values above
"""


def _clean_json(text: str) -> str:
    """Strip markdown code fences if Gemini wraps the JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


def analyze_with_gemini(image_path: str) -> dict:
    """
    Analyze an image file using Gemini Vision API.
    Raises on any error so the caller (ai_router) can fallback.
    """
    print("[AI] Using Gemini API")

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    response = _model.generate_content([
        _PROMPT,
        {"mime_type": "image/jpeg", "data": image_bytes},
    ])

    raw = response.text
    print(f"[Gemini] Raw response: {raw[:200]}")

    result = json.loads(_clean_json(raw))

    # Validate required keys
    if "violation_type" not in result:
        raise ValueError(f"Gemini response missing violation_type: {result}")

    result["violation_type"] = str(result["violation_type"])
    result["confidence"] = float(result.get("confidence", 0.0))
    result["risk_score"] = int(result.get("risk_score", 0))

    print(f"[Gemini] Parsed result: {result}")
    return result
