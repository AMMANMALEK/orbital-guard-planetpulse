from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .database import close_mongo_connection, connect_to_mongo
from .routes import alerts, auth, complaints, detections, stats, users
from .utils.image_processing import parse_classes
from .utils.model_loader import ModelRunner


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title="Orbital Guard – PlanetPulse API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],          # Allow all origins in dev – restrict in production
        allow_credentials=False,      # Must be False when allow_origins=["*"]
        allow_methods=["*"],
        allow_headers=["*"],
    )

    uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(detections.router)
    app.include_router(alerts.router)
    app.include_router(complaints.router)
    app.include_router(stats.router)

    @app.get("/api/health")
    async def health():
        model_loaded = bool(getattr(app.state, "model_runner", None)) and app.state.model_runner.is_loaded
        return {"ok": True, "model_loaded": model_loaded, "db": settings.mongo_db}

    @app.post("/api/model/test")
    async def test_model(file: __import__("fastapi").UploadFile):
        runner = app.state.model_runner
        if not runner.is_loaded:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Save temp file
        temp_path = Path("tmp_test_image.jpg")
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        try:
            res = runner.infer(str(temp_path))
            return {
                "prediction": res.prediction,
                "confidence": res.confidence,
                "risk_score": res.risk_score
            }
        finally:
            if temp_path.exists():
                temp_path.unlink()

    @app.on_event("startup")
    async def _startup():
        await connect_to_mongo()
        runner = ModelRunner(settings.model_path, parse_classes(settings.model_classes))
        try:
            runner.load()
        except FileNotFoundError:
            # API still starts; inference endpoint will return a clear error.
            pass
        app.state.model_runner = runner

    @app.on_event("shutdown")
    async def _shutdown():
        await close_mongo_connection()

    return app


app = create_app()

