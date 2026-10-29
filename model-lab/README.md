# Awwab Model Lab (Stage 2)

Awwab's first from-scratch model workbench. It contains a byte-level tokenizer, provenance-checked JSONL data loader, randomly initialized causal decoder-only Transformer, deterministic training loop, integrity-checked checkpoints, local generation, and validation metrics.

**Status:** implementation scaffold; no trained Awwab checkpoint is included and the production assistant is still disabled. A tiny model is a systems proof-of-concept, not a capable general assistant.

## Independence and safety rules

- The model is initialized from random weights. There is no pretrained-model loader, distillation path, AI API client, or network call in this directory.
- Do not put private conversations, secrets, personal records, or scraped material of unclear rights into training files. User conversations are not training data without separate explicit opt-in.
- Every JSONL training record must include `text`, `source`, and `license`. The manifest hash is recorded in checkpoints.
- Synthetic fixture data is deliberately trivial and proves only that the training pipeline works.
- Checkpoints are local generated artifacts; do not commit them. No data/model downloads, cloud training, or production deployment are performed by these scripts.
- Training can consume CPU, RAM, and battery. Start with the smoke-test settings and deliberately choose a small corpus.

## Requirements

Python 3.11+ and PyTorch 2.x are required for training/inference. PyTorch is not installed automatically by this repository; choose an appropriate CPU build for your operating system from the official PyTorch installation instructions. The standard-library tests run without PyTorch.

From the repository root, use an isolated virtual environment, then install `model-lab/requirements.txt` only when ready. No pretrained weights are downloaded by this project.

## Prepare a tiny synthetic fixture

```sh
python model-lab/data.py --write-synthetic model-lab/data/synthetic.jsonl
python -m unittest discover -s model-lab/tests -v
```

The synthetic corpus is a toy fixture and should not be interpreted as meaningful training data.

## Train from random initialization

```sh
python model-lab/train.py --data model-lab/data/synthetic.jsonl --out model-lab/checkpoints/awwab-smoke.pt --steps 20 --batch-size 2 --seq-len 32 --eval-every 10 --seed 17
```

Training exits with a clear error if PyTorch is missing. It never installs dependencies or downloads datasets automatically. Increase steps/model size only after measuring runtime and memory on your own device.

## Evaluate and generate locally

```sh
python model-lab/evaluate.py --checkpoint model-lab/checkpoints/awwab-smoke.pt --data model-lab/data/synthetic.jsonl
python model-lab/infer.py --checkpoint model-lab/checkpoints/awwab-smoke.pt --prompt "Awwab" --max-new-tokens 40 --seed 17
```

Generation is stochastic unless the seed is fixed. Output quality from the toy fixture is expected to be poor.

## Data format

One JSON object per line:

```json
{"text":"Example training text.","source":"owner-authored-synthetic-fixture","license":"CC0-1.0"}
```

Use an accurate source and license label for each item. The loader rejects missing provenance and known private-conversation source labels. This is a guardrail, not a legal review or proof that a dataset is safe to use.

## Checkpoint contract

Checkpoints include format/model/tokenizer versions, architecture configuration, seed, completed step count, data SHA-256, provenance summary, validation loss, and model state. Load verifies format and architecture metadata before constructing a model. Checkpoints are local pickle-based PyTorch artifacts; only load checkpoints you created or otherwise trust.

## Known limitations

- Byte-level UTF-8 tokens are robust and reversible but inefficient compared with a learned tokenizer.
- The Transformer is intentionally small and untrained until you run training.
- This first pass does not provide a large licensed corpus, instruction tuning, RL, safety training, or competitive reasoning.
- Training data quality, held-out evaluation, safety, latency, RAM, battery, and Android/Termux support remain future gates.
- The application does not yet load these checkpoints. Integration into the assistant is a later phase after local tests and measured evaluation.
