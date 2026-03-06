"""
AI Router — Gemini first, OpenRouter as automatic fallback.

Usage:
    result = await analyze_image(image_path, image_url)
"""
from __future__ import annotations

from .gemini_service import analyze_with_gemini
from .openrouter_service import analyze_with_openrouter

_FALLBACK_RESULT = {
    "violation_type": "unknown",
    "confidence": 0.0,
    "risk_score": 0,
}

_QUOTA_KEYWORDS = (
    "quota",
    "rate limit",
    "resource_exhausted",
    "429",
    "RESOURCE_EXHAUSTED",
    "billing",
)


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(k.lower() in msg for k in _QUOTA_KEYWORDS)


async def analyze_image(image_path: str, image_url: str | None = None) -> dict:
    """
    Try Gemini first.  On any error, automatically fall back to OpenRouter.
    If both fail, return a safe default so the system never crashes.
    """
    # ── 1. Try Gemini ──────────────────────────────────────────────────────────
    try:
        result = analyze_with_gemini(image_path)
        print("[AI Router] Gemini succeeded ✓")
        return result

    except Exception as gemini_error:
        if _is_quota_error(gemini_error):
            print(f"[AI Router] Gemini quota exceeded — switching to OpenRouter: {gemini_error}")
        else:
            print(f"[AI Router] Gemini failed — switching to OpenRouter: {gemini_error}")

    # ── 2. Fallback: OpenRouter ────────────────────────────────────────────────
    try:
        result = await analyze_with_openrouter(image_path=image_path, image_url=image_url)
        print("[AI Router] OpenRouter result received ✓")
        return result

    except Exception as openrouter_error:
        print(f"[AI Router] OpenRouter also failed: {openrouter_error}")

    # ── 3. Last resort ─────────────────────────────────────────────────────────
    print("[AI Router] Both providers failed — returning safe default")
    return dict(_FALLBACK_RESULT)
