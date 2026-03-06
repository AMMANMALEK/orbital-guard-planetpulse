from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class SatelliteImageRecord(BaseModel):
    id: Optional[str] = None
    complaint_id: str
    satellite_image_url: str
    captured_at: str = datetime.utcnow().isoformat()

class DetectionRecord(BaseModel):
    id: Optional[str] = None
    complaint_id: str
    violation_type: str
    confidence: float
    risk_score: int
    analyzed_at: str = datetime.utcnow().isoformat()

class ReportRecord(BaseModel):
    id: Optional[str] = None
    complaint_id: str
    viewer_email: str
    complaint_images_urls: List[str] = []
    satellite_image_url: Optional[str] = None
    ai_violation_type: str
    risk_score: int
    officer_comments: Optional[str] = None
    status: str
    created_at: str = datetime.utcnow().isoformat()
