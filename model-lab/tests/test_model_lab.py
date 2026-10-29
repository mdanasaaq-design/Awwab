"""Standard-library tests for data provenance and tokenizer; no model weights/network needed."""
from __future__ import annotations

import ast
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from data import load_jsonl, write_synthetic
from tokenizer import BOS_ID, EOS_ID, TOKENIZER_VERSION, VOCAB_SIZE, decode, encode


class IndependenceBoundaryTests(unittest.TestCase):
    def test_model_lab_has_no_network_or_pretrained_model_imports(self):
        blocked_roots = {
            "requests", "httpx", "urllib", "socket", "openai",
            "transformers", "sentence_transformers", "huggingface_hub",
        }
        blocked_calls = {"from_pretrained", "download_url_to_file"}
        for source_path in ROOT.glob("*.py"):
            tree = ast.parse(source_path.read_text(encoding="utf-8"), filename=str(source_path))
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    roots = {alias.name.split(".")[0] for alias in node.names}
                    self.assertFalse(roots & blocked_roots, f"network/pretrained import in {source_path}")
                elif isinstance(node, ast.ImportFrom):
                    root = (node.module or "").split(".")[0]
                    self.assertNotIn(root, blocked_roots, f"network/pretrained import in {source_path}")
                elif isinstance(node, ast.Call):
                    function_name = node.func.attr if isinstance(node.func, ast.Attribute) else (
                        node.func.id if isinstance(node.func, ast.Name) else ""
                    )
                    self.assertNotIn(function_name, blocked_calls, f"pretrained download call in {source_path}")
                    self.assertFalse(
                        ast.unparse(node.func).startswith("torch.hub."),
                        f"torch.hub model loading/downloading is prohibited in {source_path}",
                    )


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

    def test_placeholder_license_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_text(json.dumps({
                "text": "hello", "source": "document-owner", "license": "unknown"
            }) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "placeholder license label"):
                load_jsonl(path)

    def test_invalid_utf8_is_rejected_with_actionable_error(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_bytes(b"\xff\xfe")
            with self.assertRaisesRegex(ValueError, "valid UTF-8"):
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
