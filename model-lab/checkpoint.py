"""Versioned local checkpoint contract; no remote storage and no implicit weight downloads."""
from __future__ import annotations

import os
from pathlib import Path
import tempfile

from model import AwwabTransformer, MODEL_FORMAT_VERSION, ModelConfig
from tokenizer import TOKENIZER_VERSION, VOCAB_SIZE


def save_checkpoint(path, model, *, seed: int, step: int, data_manifest: dict,
                    validation_loss: float | None) -> None:
    import torch

    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "format_version": MODEL_FORMAT_VERSION,
        "model_id": "awwab-from-scratch",
        "initialized_from": "random",
        "tokenizer_version": TOKENIZER_VERSION,
        "vocab_size": VOCAB_SIZE,
        "config": model.config.to_dict(),
        "seed": int(seed),
        "step": int(step),
        "data_manifest": data_manifest,
        "validation_loss": validation_loss,
        "state_dict": {key: value.detach().cpu() for key, value in model.state_dict().items()},
    }
    fd, temporary_name = tempfile.mkstemp(prefix=destination.name + ".", suffix=".tmp", dir=destination.parent)
    os.close(fd)
    try:
        torch.save(payload, temporary_name)
        os.replace(temporary_name, destination)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


def load_checkpoint(path, *, map_location="cpu"):
    import torch

    # weights_only avoids general Python object deserialization on supported PyTorch versions.
    payload = torch.load(path, map_location=map_location, weights_only=True)
    if not isinstance(payload, dict):
        raise ValueError("invalid checkpoint payload")
    if payload.get("format_version") != MODEL_FORMAT_VERSION:
        raise ValueError("unsupported checkpoint format version")
    if payload.get("model_id") != "awwab-from-scratch" or payload.get("initialized_from") != "random":
        raise ValueError("checkpoint does not identify as an Awwab from-scratch model")
    if payload.get("tokenizer_version") != TOKENIZER_VERSION or payload.get("vocab_size") != VOCAB_SIZE:
        raise ValueError("checkpoint tokenizer contract does not match this runtime")
    config = ModelConfig.from_dict(payload.get("config", {}))
    model = AwwabTransformer(config)
    try:
        model.load_state_dict(payload["state_dict"], strict=True)
    except (KeyError, RuntimeError) as exc:
        raise ValueError("checkpoint weights do not match the declared architecture") from exc
    model.to(map_location)
    model.eval()
    return model, payload
