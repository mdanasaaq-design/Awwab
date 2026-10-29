"""Strict JSONL data ingestion and tiny synthetic fixture generator (stdlib only)."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

BLOCKED_SOURCE_MARKERS = (
    "user_conversation", "private_chat", "private_conversation",
    "personal_memory", "secret_dump",
)
PLACEHOLDER_LABELS = {
    "", "unknown", "none", "null", "n/a", "na", "tbd", "todo",
    "unspecified", "unlicensed", "no license", "no-license",
    "not known", "not specified", "to be determined",
}


def _require_real_label(value: object, *, field: str, line_number: int) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"line {line_number} requires {field}")
    normalized = " ".join(value.strip().lower().split())
    if normalized in PLACEHOLDER_LABELS:
        raise ValueError(f"line {line_number} has a placeholder {field}; record the actual provenance")
    return value.strip()


def load_jsonl(path: str | Path) -> tuple[list[str], dict[str, Any]]:
    source_path = Path(path)
    raw = source_path.read_bytes()
    if not raw:
        raise ValueError("training file is empty")
    try:
        decoded = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("training file must be valid UTF-8") from exc
    texts: list[str] = []
    sources: set[str] = set()
    licenses: set[str] = set()
    for line_number, line in enumerate(decoded.splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid JSON on line {line_number}") from exc
        if not isinstance(row, dict):
            raise ValueError(f"line {line_number} must be a JSON object")
        text = row.get("text")
        source = row.get("source")
        license_name = row.get("license")
        if not isinstance(text, str) or not text.strip():
            raise ValueError(f"line {line_number} requires non-empty text")
        source = _require_real_label(source, field="source provenance", line_number=line_number)
        license_name = _require_real_label(license_name, field="license label", line_number=line_number)
        normalized_source = source.lower()
        if any(marker in normalized_source for marker in BLOCKED_SOURCE_MARKERS):
            raise ValueError(f"line {line_number} uses a prohibited private-data source label")
        texts.append(text)
        sources.add(source.strip())
        licenses.add(license_name.strip())
    if not texts:
        raise ValueError("training file contains no usable records")
    manifest = {
        "sha256": hashlib.sha256(raw).hexdigest(),
        "records": len(texts),
        "sources": sorted(sources),
        "licenses": sorted(licenses),
        "path_name": source_path.name,
    }
    return texts, manifest


def write_synthetic(path: str | Path) -> None:
    """Write clearly labeled, owner-authored toy strings; no external data."""
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    rows = [
        "Awwab is an independent experiment.",
        "A small model learns patterns from examples.",
        "This synthetic text is only a training smoke test.",
        "Awwab must not call another AI model.",
        "The model begins with randomly initialized weights.",
        "Evaluation uses held-out text and records its limits.",
        "Training data needs provenance and a suitable license.",
        "A toy model is not a capable general assistant.",
    ]
    with destination.open("w", encoding="utf-8", newline="\n") as handle:
        for text in rows:
            handle.write(json.dumps({
                "text": text,
                "source": "owner-authored-synthetic-fixture",
                "license": "CC0-1.0",
            }, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-synthetic", metavar="PATH")
    parser.add_argument("--validate", metavar="JSONL")
    args = parser.parse_args()
    if args.write_synthetic:
        write_synthetic(args.write_synthetic)
        print(f"Wrote toy synthetic fixture: {args.write_synthetic}")
    if args.validate:
        _, manifest = load_jsonl(args.validate)
        print(json.dumps(manifest, indent=2))
    if not args.write_synthetic and not args.validate:
        parser.error("provide --write-synthetic PATH or --validate JSONL")


if __name__ == "__main__":
    main()
