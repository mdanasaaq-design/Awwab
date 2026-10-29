"""Evaluate a saved Awwab checkpoint on a separate provenance-labeled JSONL corpus."""
from __future__ import annotations

import argparse
import math

try:
    import torch
    from torch.nn import functional as F
except ImportError as exc:
    raise SystemExit("Awwab Model Lab evaluation requires PyTorch 2.x. Install it explicitly; no package or model downloads are automatic.") from exc

from checkpoint import load_checkpoint
from data import load_jsonl
from train import encode_corpus, split_tokens


@torch.no_grad()
def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--data", required=True)
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    args = parser.parse_args()
    if args.device == "cuda" and not torch.cuda.is_available():
        parser.error("CUDA requested but unavailable")
    texts, manifest = load_jsonl(args.data)
    model, metadata = load_checkpoint(args.checkpoint, map_location=args.device)
    tokens = encode_corpus(texts)
    _, validation_tokens = split_tokens(tokens, min(model.config.max_seq_len, max(2, len(tokens) // 4)))
    seq_len = min(model.config.max_seq_len, len(validation_tokens) - 1)
    if seq_len < 2:
        raise SystemExit("evaluation corpus is too small for the checkpoint context length")
    # Deterministic overlapping next-token evaluation over held-out suffix windows.
    losses = []
    stride = max(1, seq_len // 2)
    for start in range(0, len(validation_tokens) - seq_len, stride):
        window = validation_tokens[start:start + seq_len + 1]
        x = torch.tensor([window[:-1]], dtype=torch.long, device=args.device)
        y = torch.tensor(window[1:], dtype=torch.long, device=args.device)
        logits = model(x)
        losses.append(F.cross_entropy(logits.reshape(-1, logits.size(-1)), y.reshape(-1)).item())
    mean_loss = sum(losses) / len(losses)
    print(f"model=awwab-from-scratch checkpoint_step={metadata['step']}")
    print(f"evaluation_data_sha256={manifest['sha256']} records={manifest['records']}")
    print(f"next_token_loss={mean_loss:.4f} perplexity={math.exp(min(mean_loss, 20)):.3f} windows={len(losses)}")
    print("Metrics measure token prediction only; they do not measure helpfulness, truthfulness, or safety.")


if __name__ == "__main__":
    main()
