import asyncio
import os
import sys

from app.services.gemini_service import analyze_environment_image
from dotenv import load_dotenv

load_dotenv(override=True)

import base64
import httpx

async def test():
    # Read local image replicating `detections.py`
    saved = "uploads/c09cd05252e71c68fd40e7e92a7106f5.jpeg"
    import base64
    with open(saved, "rb") as f:
        data = base64.b64encode(f.read()).decode('utf-8')
        ext = "jpeg"
        dummy_image_url = f"data:image/{ext};base64,{data}"
        
    print("Testing Gemini API integration with local image...")
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        print(f"API Key read: {api_key is not None}")
        result = await analyze_environment_image(dummy_image_url)
        print(f"Prediction: {result.prediction}")
        print(f"Confidence: {result.confidence}")
        print(f"Risk Score: {result.risk_score}")
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
