from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image
import tensorflow as tf

from .image_processing import clamp


@dataclass(frozen=True)
class InferenceResult:
    prediction: str
    confidence: float
    risk_score: int


class ModelRunner:
    def __init__(self, model_path: str, classes: list[str]):
        self.model_path = model_path
        self.classes = classes
        self._model: Optional[tf.keras.Model] = None
        self._input_size: tuple[int, int] = (224, 224)

    def load(self) -> None:
        path = Path(self.model_path)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at '{path}'.")

        self._model = tf.keras.models.load_model(str(path))

        # Infer expected input size (best-effort)
        try:
            shape = self._model.input_shape  # type: ignore[attr-defined]
            # Common: (None, H, W, C)
            if isinstance(shape, tuple) and len(shape) >= 3 and shape[1] and shape[2]:
                self._input_size = (int(shape[1]), int(shape[2]))
        except Exception:
            self._input_size = (224, 224)

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def preprocess(self, image_path: str) -> np.ndarray:
        img = Image.open(image_path).convert("RGB")
        img = img.resize(self._input_size)
        arr = np.asarray(img).astype(np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)
        return arr

    def infer(self, image_path: str) -> InferenceResult:
        if self._model is None:
            raise RuntimeError("Model not loaded.")

        x = self.preprocess(image_path)
        y = self._model.predict(x, verbose=0)

        # Handle typical classification outputs: (1, N)
        probs = np.array(y).reshape(-1)
        if probs.size == 0:
            raise RuntimeError("Model returned empty output.")

        if probs.size == 1:
            conf = float(clamp(float(probs[0]), 0.0, 1.0))
            pred_idx = 0
        else:
            pred_idx = int(np.argmax(probs))
            conf = float(clamp(float(probs[pred_idx]), 0.0, 1.0))

        pred = self.classes[pred_idx] if 0 <= pred_idx < len(self.classes) else f"class_{pred_idx}"
        risk_score = int(round(conf * 100))
        return InferenceResult(prediction=pred, confidence=conf, risk_score=risk_score)

