"""Versioned, deterministic byte tokenizer; no learned vocabulary or external assets."""
from __future__ import annotations

TOKENIZER_VERSION = "awwab-byte-v1"
BYTE_OFFSET = 0
BOS_ID = 256
EOS_ID = 257
VOCAB_SIZE = 258


def encode(text: str, add_special_tokens: bool = True) -> list[int]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    tokens = list(text.encode("utf-8"))
    return ([BOS_ID] + tokens + [EOS_ID]) if add_special_tokens else tokens


def decode(tokens: list[int], skip_special_tokens: bool = True) -> str:
    byte_values: list[int] = []
    for token in tokens:
        token = int(token)
        if token in (BOS_ID, EOS_ID):
            if skip_special_tokens:
                continue
            raise ValueError("special tokens cannot be decoded as UTF-8 bytes")
        if token < 0 or token > 255:
            raise ValueError(f"token ID out of range: {token}")
        byte_values.append(token)
    return bytes(byte_values).decode("utf-8", errors="replace")
