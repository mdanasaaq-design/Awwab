# Superseded: Awwab Local-First Intelligence Proposal

**Status:** Archived on 2026-10-29. Do not use this proposal as the current architecture decision.

The earlier proposal suggested using a third-party pretrained model through a local runtime, with an optional remote-provider adapter. The owner later clarified that Awwab must not use another AI model as its intelligence engine, either locally or through an API. That decision supersedes this document.

**Current source of truth:** [Awwab Independent AI — Owner Decision](https://github.com/mdanasaaq-design/Awwab/blob/phase-4-memory-research-safety/project/AWWAB_INDEPENDENT_AI_DECISION.md)

## Decisions that remain relevant

- Awwab should be usable on both a computer and an Android phone, but support must be verified on real devices.
- Existing Firebase Authentication, device state, and Firestore memory are cloud dependencies. The app is not fully offline.
- User memory remains explicit, user-controlled, and untrusted; it must not silently become training data.
- No deployment, billing change, paid API use, model/data download, new cloud resource, or compute-heavy training run without explicit approval.

## Superseded proposals

Do **not** implement the following as Awwab's intelligence engine:
- Ollama, llama.cpp, or another runtime hosting third-party pretrained model weights.
- A remote AI provider adapter or automatic remote fallback.
- Selecting an existing pretrained model as the primary reasoning component.

## Current implementation status

The active Assistant Core path now uses an Awwab-owned model interface that reports `not_trained` and fails closed. It does not call a remote model API. The UI clearly labels generation as unavailable until Awwab's own model has been implemented, trained from random initialization, and evaluated.

The next stage is to design and implement Awwab Model Lab: tokenizer, small randomly initialized model, reproducible training/evaluation, checkpoint handling, and local inference. That work is separate from this Stage 1 boundary change. Do not claim the model is trained until a checkpoint has actually been trained, saved, loaded, and evaluated.
