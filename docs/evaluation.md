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
