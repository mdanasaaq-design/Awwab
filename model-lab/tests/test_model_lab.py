"""Standard-library tests for data provenance and tokenizer; no model weights/network needed."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from data import load_jsonl, write_synthetic
from tokenizer import BOS_ID, EOS_ID, TOKENIZER_VERSION, VOCAB_SIZE, decode, encode


class TokenizerTests(unittest.TestCase):
    def test_round_trip_ascii_and_unicode(self):
        for sample in ("", "Awwab", "السلام عليكم", "emoji 🧠", "line\nbreak"):
            self.assertEqual(decode(encode(sample)), sample)

    def test_special_tokens_and_version_are_stable(self):
        self.assertEqual(TOKENIZER_VERSION, "awwab-byte-v1")
        self.assertEqual(VOCAB_SIZE, 258)
        self.assertEqual(encode("A"), [BOS_ID, 65, EOS_ID])
        self.assertEqual(decode([65, 66]), "AB")

    def test_invalid_token_is_rejected(self):
        with self.assertRaises(ValueError):
            decode([258])


class DataTests(unittest.TestCase):
    def test_synthetic_fixture_has_manifest_and_provenance(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "toy.jsonl"
            write_synthetic(path)
            texts, manifest = load_jsonl(path)
            self.assertGreaterEqual(len(texts), 8)
            self.assertEqual(manifest["records"], len(texts))
            self.assertEqual(len(manifest["sha256"]), 64)
            self.assertEqual(manifest["sources"], ["owner-authored-synthetic-fixture"])
            self.assertEqual(manifest["licenses"], ["CC0-1.0"])

    def test_missing_provenance_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_text(json.dumps({"text": "hello"}) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "source provenance"):
                load_jsonl(path)

    def test_private_conversation_source_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_text(json.dumps({
                "text": "private", "source": "user_conversation_export", "license": "unknown"
            }) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "prohibited private-data"):
                load_jsonl(path)

    def test_malformed_json_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_text("{oops}\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "invalid JSON"):
                load_jsonl(path)


if __name__ == "__main__":
    unittest.main()
