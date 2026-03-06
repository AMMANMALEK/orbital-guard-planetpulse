from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


DetectionType = Literal["illegal-mining", "deforestation", "river-encroachment"]
DetectionStatus = Literal["detected", "investigating", "resolved"]


class DetectionCreate(BaseModel):
    location: str = "Unknown"
    coordinates: tuple[float, float] = (20.0, 78.0)
    region: str = "Unknown"


class DetectionRecord(BaseModel):
    id: str
    image_url: str
    prediction: DetectionType
    confidence: float
    risk_score: int
    location: str
    coordinates: tuple[float, float]
    status: DetectionStatus = "detected"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    region: str

