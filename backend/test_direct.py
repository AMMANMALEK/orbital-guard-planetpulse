import asyncio
import os
import sys

from app.services.gemini_service import analyze_environment_image
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(override=True)

async def test():
    # Read local image replicating `detections.py` exactly
    saved = Path("uploads/c09cd05252e71c68fd40e7e92a7106f5.jpeg")
    import base64
    with open(saved, "rb") as f:
        data = base64.b64encode(f.read()).decode('utf-8')
        ext = saved.suffix.lstrip('.')
        if not ext: ext = 'jpeg'
        data_uri = f"data:image/{ext};base64,{data}"
        print(f"DEBUG: URI begins with {data_uri[:50]}")
        
    print("Testing Gemini API integration with local image exactly as detections.py...")
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        print(f"API Key read: {api_key is not None}")
        result = await analyze_environment_image(data_uri)
        print(f"Prediction: {result.prediction}")
        print(f"Confidence: {result.confidence}")
        print(f"Risk Score: {result.risk_score}")
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
