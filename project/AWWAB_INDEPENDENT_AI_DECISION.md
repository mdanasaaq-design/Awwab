# Awwab Independent AI — Owner Decision

**Decision date:** 2026-10-29  
**Target:** Android phone and computer  
**Priority:** Independence, privacy, and avoiding API charges  
**Constraints:** No deployment, billing enablement, paid API use, model/data downloads, new cloud resources, or costs without explicit approval.

## Non-negotiable direction

Awwab is to become its own AI system. It must not be a wrapper around another AI, call another AI API, or depend on a third-party pretrained model as its intelligence engine. This supersedes the earlier local-first plan that proposed using an existing model via a local runtime.

Awwab must eventually have its own model architecture, training pipeline, and model weights trained from random initialization. General-purpose software libraries for tensor math/training may be used; those are tools, not substitute AI models. No third-party pretrained weights or teacher-model distillation unless the owner explicitly changes this decision.

## Be precise about capability

We can build Awwab's own assistant software now: conversation handling, memory policy, retrieval/research, planning, safety, permissions, and deterministic tools. We must separately implement and train a neural model before claiming Awwab has its own trained generative intelligence.

A tiny model trained on a computer is a proof of concept, not a competitive general-purpose assistant. High-quality general reasoning from scratch requires lawful, high-quality training data, compute, careful evaluation, and time. Do not promise frontier-level ability or continuous learning without evidence.

## Architecture

1. **Awwab Core:** owned orchestration, memory/context policy, retrieval, permissions, response validation, safety, and tool authorization.
2. **Awwab Model Lab:** our tokenizer/data pipeline, a small decoder-only Transformer initialized randomly, training loop, checkpoints, inference implementation, reproducibility, and evaluations.
3. **Desktop-first development:** train and evaluate a small model on the user's computer, CPU-first where practical. Do not use paid cloud training.
4. **Phone inference:** once a trained checkpoint exists, port or optimize inference for Android/Termux and measure actual RAM, speed, battery, and thermal limits. Do not claim phone support until tested.
5. **Knowledge and memory:** Awwab-owned retrieval and user-approved memory can complement the model. Stored memory is not training. User conversations must not be used as training data without a separate explicit opt-in and deletion/privacy controls.
6. **No remote AI fallback:** if Awwab's own model is missing or cannot answer well, report the limitation or use Awwab-owned deterministic/retrieval features. Never silently call another AI.
7. **Cloud transparency:** current authentication, device state, and saved memories use Firebase/Firestore. These are existing cloud dependencies, so the application is not fully offline/local yet. Local persistence and optional cloud sync require a separate phase; do not silently migrate/delete existing data.

## Roadmap

### Stage 1 — Independence boundary (implemented; CI passed on initial Stage 1 commit)
- [x] Removed the external OpenAI-compatible adapter and its test; no provider secret is bound by the active callable.
- [x] Added an Awwab-owned model interface with an explicit `not_trained` status and no remote fallback.
- [x] Added deterministic no-network/fail-closed tests and wired them into CI.
- [x] Disabled assistant generation in the UI and explained that Awwab's own model is not trained yet.
- [x] Marked the older third-party local-model proposal as superseded and updated Phase 4 documentation.
- [x] All five CI jobs passed on the initial Stage 1 commit; Stage 2 adds a separate dependency-free Model Lab CI job.

### Stage 2 — Model Lab implementation (code scaffold added; training not yet run)
- [x] Added a versioned reversible byte-level tokenizer and provenance-checked JSONL data loader.
- [x] Added a small causal decoder-only Transformer whose weights initialize randomly, plus a configurable training loop, local checkpoint contract, local inference, and next-token loss/perplexity evaluation.
- [x] Added standard-library tests for tokenizer round-trips, provenance enforcement, private-source rejection, synthetic fixture creation, and an AST guard against network/pretrained-model imports; wired them into CI without installing PyTorch or downloading model/data files.
- [x] Added optional PyTorch tests for forward/backward gradients, causal masking, prompt construction, checkpoint round-trip, and local generation; these are skipped when PyTorch is not installed in dependency-free CI.
- [x] Fixed prompt construction so local generation does not condition on an end-of-sequence token, and added finite/positive checks for optimizer and evaluation settings.
- [ ] Run PyTorch-backed forward/backward, checkpoint round-trip, and generation smoke tests after the owner chooses and installs an appropriate PyTorch build. No training or weight downloads were run in this phase.
- [ ] Add held-out evaluation and quality/safety benchmarks before any assistant integration.
- Synthetic fixture is deliberately trivial. Use only owner-provided or appropriately licensed data with recorded provenance; no private scraping or user-conversation training without separate consent. No automatic data/model downloads or compute-heavy runs.

### Stage 3 — Evaluate and improve
- Add train/validation splits, deduplication, checkpoint resume, loss/perplexity, structured-output, instruction-following, safety, latency, RAM, and power evaluations.
- Publish a model card with data provenance, licensing, limitations, and measured results.
- Increase model size only after benchmarks justify resource use.

### Stage 4 — Phone support and local persistence
- Validate Android/Termux inference on real hardware.
- Separately design local memory persistence and explicit optional cloud sync. Keep user memory, training examples, and model weights as distinct data classes.

## Acceptance criteria

- No third-party pretrained model weights are needed for Awwab's own model.
- No external AI API calls or automatic remote fallback.
- Model training begins from random initialization with documented data provenance.
- Missing weights never result in fake claims of intelligence.
- A small checkpoint is trained, saved, loaded, and evaluated locally before claiming model capability.
- Desktop is validated before Android support is claimed.
- No paid service, deployment, billing change, cloud training, or model/data download without explicit approval.

## Next bounded task — Stage 2 verification

Design and implement Awwab Model Lab: a reproducible tokenizer/data pipeline, a small decoder-only Transformer initialized from random weights, a training loop, checkpoints, local inference, and evaluation. Start with synthetic or explicitly licensed data and record provenance. Before any compute-heavy training run or large data download, get the owner's explicit approval. Do not use third-party pretrained weights, teacher-model distillation, paid cloud training, or user conversations as training data without separate explicit opt-in. Do not deploy or change billing.
