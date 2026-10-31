# Awwab AI and Model Strategy

**Controlling decision:** Awwab uses its own model trained from random initialization. This document supersedes older provider-neutral wording that could be read as permission to call external AI providers.

## Objective

Build Awwab's independent intelligence while keeping the cognitive architecture, memory, goals, policies, tools and identity independent of any one Awwab model checkpoint.

## Model independence rules

- No external AI APIs or hosted inference.
- No third-party pretrained weights, fine-tuning from external checkpoints, teacher-model distillation or silent remote fallback.
- Awwab's model architecture and weights are Awwab-owned and initialized randomly.
- Reuse deterministic software and training-engineering code after exact-file licence/security review.
- Do not use user conversations as training data without separate explicit opt-in and privacy/deletion controls.
- No automatic model/data downloads, paid compute, or large training jobs without explicit owner approval.

## Awwab Model Runtime

The runtime may select among Awwab-owned model versions/checkpoints based on measured task capability, resource requirements and compatibility. It is not a marketplace or external provider router.

The interface should standardize model/checkpoint identity, architecture and tokenizer versions, input/context format, structured output schemas, cancellation/resource limits, inference errors, capability status, latency and evaluation metadata.

If no suitable Awwab checkpoint exists, the system must say so or use deterministic/retrieval features. It must never silently call another AI.

## Cognitive core vs model

Identity, memory, goals, planning state, policies, tool scopes, approvals, audit and development history belong to Awwab's cognitive core. The model supplies learned language and reasoning capability. Replacing a checkpoint must not erase the core's state or change its permissions.

## Model Lab roadmap

1. Review the current random-init Transformer, tokenizer, data loader, training loop, checkpoint and inference code.
2. Verify a local PyTorch environment and run a tiny smoke test only after owner approval of the dependency/environment.
3. Establish lawful, owner-controlled training data with exact source/licence provenance and held-out splits.
4. Add reproducibility, checkpoint resume, deduplication, loss/perplexity, structured-output, instruction-following, safety and task benchmarks.
5. Measure quality, latency, RAM, CPU/battery and device compatibility.
6. Train from random initialization and document actual results in a model card.
7. Integrate only after capability gates pass; begin with plan-only output.

A tiny synthetic-corpus model proves that training code executes; it does not prove useful general reasoning. High-quality general intelligence from scratch requires substantial lawful data, compute and evaluation. Do not promise frontier-level capability or fixed timelines without evidence.

## Deterministic intelligence before model readiness

The cognitive core can be developed without generative inference: typed identity/memory/goal state, deterministic context filtering, repository inventory, static analysis, workflow state machines and test execution. These features must be described accurately; they do not substitute for a capable model.

## Open-source training reuse

LitGPT/nanoGPT may supply selected random-init training, batching, optimizer, checkpoint-resume and evaluation engineering. Do not use their pretrained checkpoints, model catalog downloads or data. All copied files require exact-file review and attribution.

## Evaluation

Evaluate the Awwab model on held-out data and Awwab-specific tasks: instruction following, structured plans, context use, factuality, refusal/safety, tool proposal correctness, code task reasoning, latency, memory and energy. Security failures are hard failures. Keep benchmark datasets and user conversations separate.
