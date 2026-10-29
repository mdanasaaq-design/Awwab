"""Reproducible small-corpus training from random initialization."""
from __future__ import annotations

import argparse
import math
from pathlib import Path
import random
import sys

try:
    import torch
    from torch.nn import functional as F
except ImportError as exc:
    raise SystemExit("Awwab Model Lab requires PyTorch 2.x. Install it explicitly in a virtual environment; no package or model downloads are automatic.") from exc

from checkpoint import save_checkpoint
from data import load_jsonl
from model import AwwabTransformer, ModelConfig
from tokenizer import encode


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.use_deterministic_algorithms(True, warn_only=True)


def encode_corpus(texts: list[str]) -> list[int]:
    tokens: list[int] = []
    for text in texts:
        tokens.extend(encode(text))
    return tokens


def split_tokens(tokens: list[int], seq_len: int) -> tuple[list[int], list[int]]:
    if len(tokens) < (seq_len + 2) * 2:
        raise ValueError(
            f"corpus too small: need at least {(seq_len + 2) * 2} tokens including special tokens; "
            "add a small, appropriately licensed dataset or reduce --seq-len"
        )
    split = int(len(tokens) * 0.9)
    split = max(seq_len + 1, min(split, len(tokens) - seq_len - 1))
    return tokens[:split], tokens[split:]


def sample_batch(tokens: list[int], *, batch_size: int, seq_len: int, device):
    starts = torch.randint(0, len(tokens) - seq_len - 1, (batch_size,)).tolist()
    x = torch.tensor([tokens[i:i + seq_len] for i in starts], dtype=torch.long, device=device)
    y = torch.tensor([tokens[i + 1:i + seq_len + 1] for i in starts], dtype=torch.long, device=device)
    return x, y


@torch.no_grad()
def evaluate_loss(model, tokens: list[int], *, seq_len: int, batch_size: int, batches: int, device) -> float:
    model.eval()
    losses = []
    for _ in range(batches):
        x, y = sample_batch(tokens, batch_size=batch_size, seq_len=seq_len, device=device)
        logits = model(x)
        losses.append(F.cross_entropy(logits.reshape(-1, logits.size(-1)), y.reshape(-1)).item())
    model.train()
    return sum(losses) / len(losses)


def train(args) -> None:
    if args.steps < 1 or args.batch_size < 1 or args.seq_len < 2 or args.eval_every < 1:
        raise ValueError("steps, batch size, eval interval must be positive and seq_len >= 2")
    if args.d_model < 8 or args.n_heads < 1 or args.n_layers < 1 or args.d_model % args.n_heads:
        raise ValueError("invalid model dimensions")
    texts, manifest = load_jsonl(args.data)
    all_tokens = encode_corpus(texts)
    train_tokens, validation_tokens = split_tokens(all_tokens, args.seq_len)
    set_seed(args.seed)
    device_name = ("cuda" if torch.cuda.is_available() else "cpu") if args.device == "auto" else args.device
    device = torch.device(device_name)
    if device.type == "cuda" and not torch.cuda.is_available():
        raise ValueError("CUDA requested but unavailable")
    config = ModelConfig(d_model=args.d_model, n_heads=args.n_heads, n_layers=args.n_layers,
                         max_seq_len=args.seq_len, dropout=args.dropout)
    model = AwwabTransformer(config).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate)
    initial_loss = evaluate_loss(model, validation_tokens, seq_len=args.seq_len,
                                 batch_size=args.batch_size, batches=args.eval_batches, device=device)
    print(f"model=awwab-from-scratch init=random device={device} params={sum(p.numel() for p in model.parameters())}")
    print(f"data_records={manifest['records']} data_sha256={manifest['sha256']} initial_val_loss={initial_loss:.4f}")
    last_loss = initial_loss
    for step in range(1, args.steps + 1):
        model.train()
        x, y = sample_batch(train_tokens, batch_size=args.batch_size, seq_len=args.seq_len, device=device)
        optimizer.zero_grad(set_to_none=True)
        logits = model(x)
        loss = F.cross_entropy(logits.reshape(-1, logits.size(-1)), y.reshape(-1))
        if not torch.isfinite(loss):
            raise RuntimeError(f"non-finite loss at step {step}")
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), args.grad_clip)
        optimizer.step()
        if step % args.eval_every == 0 or step == args.steps:
            last_loss = evaluate_loss(model, validation_tokens, seq_len=args.seq_len,
                                      batch_size=args.batch_size, batches=args.eval_batches, device=device)
            print(f"step={step}/{args.steps} train_loss={loss.item():.4f} val_loss={last_loss:.4f} "
                  f"val_perplexity={math.exp(min(last_loss, 20)):.3f}")
    save_checkpoint(args.out, model, seed=args.seed, step=args.steps,
                    data_manifest=manifest, validation_loss=last_loss)
    print(f"checkpoint_saved={Path(args.out).resolve()}")
    print("Reminder: a smoke-test checkpoint does not establish general assistant capability.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", required=True, help="JSONL with text/source/license per row")
    parser.add_argument("--out", required=True, help="local checkpoint path")
    parser.add_argument("--steps", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--seq-len", type=int, default=64)
    parser.add_argument("--eval-every", type=int, default=25)
    parser.add_argument("--eval-batches", type=int, default=4)
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--d-model", type=int, default=64)
    parser.add_argument("--n-heads", type=int, default=2)
    parser.add_argument("--n-layers", type=int, default=2)
    parser.add_argument("--dropout", type=float, default=0.0)
    parser.add_argument("--learning-rate", type=float, default=3e-4)
    parser.add_argument("--grad-clip", type=float, default=1.0)
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    args = parser.parse_args()
    try:
        train(args)
    except (ValueError, OSError) as exc:
        print(f"training error: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc


if __name__ == "__main__":
    main()
