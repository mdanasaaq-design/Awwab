# Awwab Evaluation Framework

## Purpose

Awwab competes on useful, trustworthy outcomes rather than raw model benchmark scores.

## Dimensions

1. Task success
2. Correctness
3. Evidence
4. Tool correctness
5. Safety
6. Proactivity
7. Personalization
8. Efficiency
9. Recovery
10. Trust

## Benchmark suites

Maintain versioned suites:
- assistant-basic
- research
- memory
- productivity
- projects
- tools
- automation
- security
- proactivity
- multimodal

## Test case

Each case defines ID, task, starting state, allowed/forbidden tools, expected outcome, acceptable alternatives, required evidence, risk and rubric.

## Scoring

Use rubric-based scoring. Example dimensions can be 0–4 for outcome, correctness, evidence, safety and efficiency.

Security violations are hard failures regardless of other scores.

## Regression policy

Do not ship if critical security tests regress, verified task success materially drops, tool errors increase, cost/latency exceed agreed limits or fabricated success appears.

## Human evaluation

Periodically review usefulness, trust, frustration, unnecessary clarification, missed context and unwanted proactivity.

## Provider evaluation

Run the same benchmark against candidate models/providers. Do not select based only on generic benchmarks.

## Continuous evaluation

Run in CI for deterministic suites, before model/tool/autonomy changes, after security fixes and periodically against production-like fixtures.

## Evidence principle

Evaluate whether Awwab can prove what it did, not merely whether its final prose sounds convincing.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.


## Reuse of evaluation infrastructure (2026-10-30)

Awwab will adapt Promptfoo's MIT-licensed test-case, assertion, red-team and regression-reporting patterns, not its hosted-provider integrations. Benchmark execution must be local and deterministic where possible, using mock tools and Awwab's own randomly initialized/trained model. Use OpenTelemetry JS patterns only when trace visibility is needed and after licence/dependency review. Never transmit personal prompts, memories or documents to hosted observability.

See [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md).


## Cognitive and self-development evaluation — 2026-10-31

Add versioned suites:
- `identity-continuity`: identity/config remains stable across model checkpoint changes.
- `memory-quality`: provenance, correction, expiry, deletion, contradiction and relevance.
- `goal-planning`: goal decomposition, dependency correctness, constraints and progress.
- `context-selection`: relevance, sensitivity filtering, provenance and context-budget compliance.
- `repository-understanding`: file/manifest/test/CI inventory accuracy and evidence-backed explanations.
- `code-change`: bounded diffs, test selection, regression rate and task completion.
- `self-repair`: failure diagnosis, retry limits, recovery and honest stop behavior.
- `version-evolution`: reproducibility, candidate comparison, rollback and no unauthorized promotion.
- `multi-agent`: handoff correctness, conflict rate, coordination overhead and security isolation.

Do not score a model or agent on fluent explanations alone. Every code task needs a fixed starting commit, expected behavior, permitted paths/tools, forbidden actions, test oracle and review rubric. A security violation is a hard failure. Compare multi-agent runs with a single-agent baseline before enabling parallel agents.
