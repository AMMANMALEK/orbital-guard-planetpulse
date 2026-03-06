import os
import uuid
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

async def capture_satellite_imagery(latitude: float, longitude: float, zoom: int = 15) -> str:
    """
    Simulates capturing a satellite image for given coordinates.
    In a real scenario, this would call a static maps API.
    """
    # Create a dummy satellite image (placeholder)
    # We'll create a slightly noisy green/brown image to look like land
    img_size = (640, 640)
    base = np.zeros((img_size[1], img_size[0], 3), dtype=np.uint8)
    
    # Add some "terrain" noise
    noise = np.random.randint(50, 150, (img_size[1], img_size[0], 3), dtype=np.uint8)
    base = (base * 0.5 + noise * 0.5).astype(np.uint8)
    
    # Add a "crosshair" to simulate satellite view
    img = Image.fromarray(base)
    draw = ImageDraw.Draw(img)
    draw.line((320, 0, 320, 640), fill=(255, 255, 255, 128), width=1)
    draw.line((0, 320, 640, 320), fill=(255, 255, 255, 128), width=1)
    
    # Save to uploads
    filename = f"sat_{uuid.uuid4().hex}.jpg"
    uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    file_path = uploads_dir / filename
    img.save(file_path)
    
    return f"/uploads/{filename}"
