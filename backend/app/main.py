from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv(override=True)

from .config import get_settings
from .database import close_mongo_connection, connect_to_mongo
from .routes import alerts, auth, complaints, detections, stats, users
from .utils.image_processing import parse_classes
from .services.socket_manager import socket_app


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title="Orbital Guard – PlanetPulse API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:8080", 
            "http://127.0.0.1:8080", 
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:5173"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
    app.mount("/ws", socket_app)

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(detections.router)
    app.include_router(alerts.router)
    app.include_router(complaints.router)
    app.include_router(stats.router)

    @app.on_event("startup")
    async def _startup():
        await connect_to_mongo()
    @app.on_event("shutdown")
    async def _shutdown():
        await close_mongo_connection()

    return app


app = create_app()

