import google.generativeai as genai
import os
import json
from ..config import get_settings

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_environment_image(image_path: str):
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        prompt = """
You are an environmental monitoring AI system.

Analyze the image and determine if it contains:

1. Illegal mining
2. Deforestation
3. River encroachment
4. Normal land

Return ONLY valid JSON.

Format:

{
 "violation_type": "illegal_mining | deforestation | river_encroachment | normal",
 "confidence": number between 0 and 1,
 "risk_score": number between 0 and 100
}
"""

        response = model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": image_bytes
            }
        ])

        text = response.text
        print("Gemini response:", text)

        # Basic markdown cleanup if any
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]

        return json.loads(text.strip())

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Gemini analysis failed: {type(e).__name__}: {e}")
        return {
            "violation_type": "unknown",
            "confidence": 0,
            "risk_score": 0
        }
