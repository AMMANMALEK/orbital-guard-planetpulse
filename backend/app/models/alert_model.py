from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


RiskLevel = Literal["high", "medium", "low"]
AlertStatus = Literal["active", "investigating", "resolved", "pending_confirmation"]
DetectionType = Literal["illegal-mining", "deforestation", "river-encroachment"]


class AlertRecord(BaseModel):
    id: str
    detectionId: str
    type: DetectionType
    severity: RiskLevel
    status: AlertStatus
    message: str
    date: str = Field(default_factory=lambda: datetime.utcnow().date().isoformat())
    region: str
    notes: Optional[str] = None


class AlertUpdate(BaseModel):
    severity: Optional[RiskLevel] = None
    status: Optional[AlertStatus] = None
    message: Optional[str] = None
    notes: Optional[str] = None

