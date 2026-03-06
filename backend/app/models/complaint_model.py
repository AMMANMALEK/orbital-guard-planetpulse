from datetime import datetime
from typing import Literal, Optional, List

from pydantic import BaseModel, Field


ComplaintStatus = Literal["pending", "investigating", "confirmed", "rejected", "resolved"]
ViolationType = Literal["illegal_mining", "deforestation", "river-encroachment", "pollution", "other"]


class ComplaintCreate(BaseModel):
    violation_type: ViolationType
    state: str
    city: str
    description: str
    complaint_images: List[str] = Field(default_factory=list)  # List of data URLs or uploaded image URLs
    submittedBy: str


class ComplaintRecord(BaseModel):
    id: str
    violation_type: ViolationType
    state: str
    city: str
    latitude: float
    longitude: float
    description: str
    complaint_images: List[str] = Field(default_factory=list)
    status: ComplaintStatus = "pending"
    submittedBy: str
    submittedAt: str = Field(default_factory=lambda: datetime.utcnow().date().isoformat())
    region: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    officerNotes: Optional[str] = None
    satellite_image_url: Optional[str] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_risk_score: Optional[int] = None


class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    region: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    officerNotes: Optional[str] = None
    complaint_images: Optional[List[str]] = None
    satellite_image_url: Optional[str] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_risk_score: Optional[int] = None

