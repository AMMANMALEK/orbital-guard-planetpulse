from __future__ import annotations

import secrets
from pathlib import Path
from typing import Iterable

from fastapi import UploadFile


ALLOWED_IMAGE_EXTENSIONS: set[str] = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}


def safe_filename(original_name: str) -> str:
    suffix = Path(original_name).suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        suffix = ".png"
    return f"{secrets.token_hex(16)}{suffix}"


async def save_upload(file: UploadFile, upload_dir: Path) -> Path:
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / safe_filename(file.filename or "upload.png")
    content = await file.read()
    dest.write_bytes(content)
    return dest


def parse_classes(csv: str) -> list[str]:
    return [c.strip() for c in csv.split(",") if c.strip()]


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def risk_level_from_score(score: int) -> str:
    if score >= 90:
        return "critical"
    if score >= 80:
        return "high"
    if score >= 65:
        return "medium"
    return "low"


def to_epoch_ms(dt) -> int:
    return int(dt.timestamp() * 1000)

