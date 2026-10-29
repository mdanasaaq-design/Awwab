"""Local autoregressive generation from a locally trained Awwab checkpoint."""
from __future__ import annotations

import argparse
import random

import torch

from checkpoint import load_checkpoint
from tokenizer import BOS_ID, EOS_ID, encode, decode


@torch.no_grad()
def generate(model, prompt: str, *, max_new_tokens: int, seed: int, temperature: float = 0.8) -> str:
    if max_new_tokens < 1 or temperature <= 0:
        raise ValueError("max_new_tokens and temperature must be positive")
    random.seed(seed)
    torch.manual_seed(seed)
    device = next(model.parameters()).device
    prompt_tokens = encode(prompt)
    # Keep the most recent context so generation remains inside the configured window.
    tokens = prompt_tokens[:]
    for _ in range(max_new_tokens):
        context = tokens[-model.config.max_seq_len:]
        input_ids = torch.tensor([context], dtype=torch.long, device=device)
        logits = model(input_ids)[0, -1, :] / temperature
        logits[BOS_ID] = float("-inf")
        probabilities = torch.softmax(logits, dim=-1)
        next_token = int(torch.multinomial(probabilities, num_samples=1).item())
        if next_token == EOS_ID:
            break
        tokens.append(next_token)
    return decode(tokens)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--max-new-tokens", type=int, default=64)
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--temperature", type=float, default=0.8)
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    args = parser.parse_args()
    if args.device == "cuda" and not torch.cuda.is_available():
        parser.error("CUDA requested but unavailable")
    model, metadata = load_checkpoint(args.checkpoint, map_location=args.device)
    print(f"model=awwab-from-scratch trained_steps={metadata['step']} seed={metadata['seed']}")
    print(generate(model, args.prompt, max_new_tokens=args.max_new_tokens,
                   seed=args.seed, temperature=args.temperature))


if __name__ == "__main__":
    main()
