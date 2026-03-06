import os
from pathlib import Path
from fastapi import Request
from ..utils.model_loader import ModelRunner, InferenceResult

async def run_ai_analysis(image_path: str, model_runner: ModelRunner) -> InferenceResult:
    """
    Runs AI model inference on the provided satellite image.
    """
    # In a real app, image_path would be absolute for the model runner
    # The image path returned from capture_satellite_imagery is relative to uploads
    
    # Get absolute path
    base_dir = Path(__file__).resolve().parents[2]
    if image_path.startswith("/"):
        abs_image_path = base_dir / image_path.lstrip("/")
    else:
        abs_image_path = base_dir / image_path
        
    if not abs_image_path.exists():
        raise FileNotFoundError(f"Image not found at {abs_image_path}")
        
    # Run inference
    result = model_runner.infer(str(abs_image_path))
    return result
