"""PyTorch-backed model tests; automatically skipped when PyTorch is not installed."""
from __future__ import annotations

import contextlib
import io
import sys
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

try:
    import torch
except ImportError:
    torch = None

if torch is not None:
    from checkpoint import load_checkpoint, save_checkpoint
    from data import write_synthetic
    from infer import generate, prepare_prompt_tokens
    from model import AwwabTransformer, ModelConfig
    import train as train_module
    import evaluate as evaluate_module


@unittest.skipIf(torch is None, "PyTorch is optional and is not installed in dependency-free CI")
class ModelTests(unittest.TestCase):
    def setUp(self):
        torch.manual_seed(17)
        self.config = ModelConfig(d_model=16, n_heads=2, n_layers=1, max_seq_len=8)
        self.model = AwwabTransformer(self.config)
        self.model.eval()

    def test_forward_shape_and_finite_gradients(self):
        tokens = torch.tensor([[256, 65, 66, 257]], dtype=torch.long)
        logits = self.model(tokens)
        self.assertEqual(tuple(logits.shape), (1, 4, 258))
        loss = torch.nn.functional.cross_entropy(
            logits[:, :-1, :].reshape(-1, 258), tokens[:, 1:].reshape(-1)
        )
        loss.backward()
        self.assertTrue(torch.isfinite(loss).item())
        self.assertTrue(all(p.grad is None or torch.isfinite(p.grad).all().item()
                            for p in self.model.parameters()))

    def test_causal_mask_blocks_future_token_influence(self):
        first = torch.tensor([[256, 65, 66, 67]], dtype=torch.long)
        changed_future = torch.tensor([[256, 65, 66, 90]], dtype=torch.long)
        with torch.no_grad():
            first_logits = self.model(first)
            changed_logits = self.model(changed_future)
        self.assertTrue(torch.allclose(first_logits[:, :3], changed_logits[:, :3], atol=1e-6))

    def test_prompt_does_not_end_with_eos(self):
        self.assertEqual(prepare_prompt_tokens("A"), [256, 65])
        self.assertEqual(prepare_prompt_tokens("السلام"), [256] + list("السلام".encode("utf-8")))
        self.assertEqual(prepare_prompt_tokens(""), [256])

    def test_checkpoint_round_trip_and_local_generation(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "test.pt"
            sample = torch.tensor([[256, 65, 66]], dtype=torch.long)
            with torch.no_grad():
                expected = self.model(sample)
            save_checkpoint(
                path, self.model, seed=17, step=3,
                data_manifest={"sha256": "a" * 64, "records": 1,
                               "sources": ["test"], "licenses": ["CC0-1.0"],
                               "path_name": "fixture.jsonl"},
                validation_loss=1.23,
            )
            loaded, metadata = load_checkpoint(path)
            with torch.no_grad():
                actual = loaded(sample)
            self.assertTrue(torch.equal(expected, actual))
            self.assertEqual(metadata["initialized_from"], "random")
            self.assertEqual(metadata["step"], 3)
            generated = generate(loaded, "A", max_new_tokens=2, seed=17)
            self.assertIsInstance(generated, str)
            self.assertTrue(generated.startswith("A"))

    def test_tiny_training_checkpoint_and_evaluation_pipeline(self):
        """Exercise the real CLI pipeline on generated toy data, without downloads."""
        with tempfile.TemporaryDirectory() as directory:
            data_path = Path(directory) / "synthetic.jsonl"
            checkpoint_path = Path(directory) / "smoke.pt"
            write_synthetic(data_path)
            args = type("Args", (), {
                "data": str(data_path), "out": str(checkpoint_path),
                "steps": 2, "batch_size": 2, "seq_len": 8,
                "eval_every": 1, "eval_batches": 1, "seed": 17,
                "d_model": 16, "n_heads": 2, "n_layers": 1,
                "dropout": 0.0, "learning_rate": 3e-4,
                "grad_clip": 1.0, "device": "cpu",
            })()
            train_output = io.StringIO()
            with contextlib.redirect_stdout(train_output):
                train_module.train(args)
            self.assertTrue(checkpoint_path.is_file())
            self.assertIn("initial_val_loss=", train_output.getvalue())
            self.assertIn("checkpoint_saved=", train_output.getvalue())
            _, metadata = load_checkpoint(checkpoint_path)
            self.assertEqual(metadata["step"], 2)
            evaluation_output = io.StringIO()
            with patch.object(sys, "argv", [
                "evaluate.py", "--checkpoint", str(checkpoint_path),
                "--data", str(data_path), "--device", "cpu",
            ]), contextlib.redirect_stdout(evaluation_output):
                evaluate_module.main()
            self.assertIn("next_token_loss=", evaluation_output.getvalue())
            self.assertIn("perplexity=", evaluation_output.getvalue())


if __name__ == "__main__":
    unittest.main()
"