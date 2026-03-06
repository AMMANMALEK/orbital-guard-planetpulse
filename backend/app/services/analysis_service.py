from typing import List
from pathlib import Path
from .gemini_service import analyze_environment_image

async def run_ai_analysis(image_paths: List[str], runner=None):
    """
    Runs AI analysis. Since the exact user code expects a single local file path,
    we extract the first valid local file path and pass it to Gemini.
    """
    base_dir = Path(__file__).resolve().parents[2]
    
    clean_path = None
    for image_path in image_paths:
        if not image_path: continue
        if image_path.startswith("data:") or image_path.startswith("http"):
            continue 
            
        abs_path = None
        if image_path.startswith("/"):
            abs_path = base_dir / image_path.lstrip("/")
        else:
            abs_path = base_dir / image_path
            
        if abs_path and abs_path.exists():
            clean_path = str(abs_path)
            break
            
    if not clean_path:
        return {"violation_type": "unknown", "confidence": 0.0, "risk_score": 0}
        
    return analyze_environment_image(clean_path)
