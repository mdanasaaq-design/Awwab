# Awwab Architecture

**Current source of truth:** [Self-Development Master Plan](../project/SELF_DEVELOPMENT_MASTER_PLAN.md). This document describes the target architecture; it is not evidence that every component is implemented.

## Objective

Awwab is an independent assistant platform with a persistent cognitive architecture, its own randomly initialized and trained model, controlled tools, and a safe self-development lifecycle.

## Current technology baseline

- Web: React + TypeScript + Vite.
- Android: Kotlin + Jetpack Compose shell.
- Identity/data: Firebase Authentication + Cloud Firestore.
- Intended privileged backend source: Firebase Functions v2 / Node.js 22; not deployed on the current Spark plan.
- Hosting: Firebase Hosting.
- Independent model workbench: Python/PyTorch Model Lab; no trained checkpoint currently exists.

No alternative backend or hosted execution runtime is approved. A local owner-controlled development runner is the first execution architecture to evaluate for self-development.

## Logical architecture

```
Clients: Web / Android / future local companion
                 |
       Identity + Owner Control
                 |
          AWWAB COGNITIVE CORE
       Identity / Constitution
       Working + Long-term Memory
       Goals / Priorities
       Context Selection / Perception
       Reasoning Interface (Awwab model only)
       Planning / Workflow State
       Reflection / Evaluation
                 |
          ACTION CONTROL PLANE
       Capability Registry / Policy
       Approval / Budgets / Audit
       Tool Dispatcher / Verification
                 |
       Isolated Local Development Runtime
       Repository Reader / Git / File Tools
       Sandboxed Terminal / Test Runner
                 |
        Evolution / Version Manager
       Code + Model + Agent Profile Versions
       Evaluation / Promotion / Rollback
                 |
        Multi-Agent Orchestrator (later)
```

## Cognitive architecture

The cognitive core persists independently of model checkpoints. Identity, memory, goals, task state, policies and development history must survive a model upgrade. Model versions are replaceable only within Awwab's own model family; external AI APIs and third-party pretrained weights are prohibited.

Memory is separated into working, episodic, semantic, procedural and development memory. Every durable item has ownership, provenance, sensitivity, confidence/freshness where relevant, retention/expiry and correction/deletion behavior. Retrieved memory is untrusted evidence, not policy or authorization.

## Request lifecycle

1. Authenticate and validate the request.
2. Interpret the objective against Awwab's identity and owner constraints.
3. Retrieve only relevant, permitted context.
4. Inspect the current environment and available capabilities.
5. Reason and create a typed plan with assumptions and uncertainty.
6. Apply deterministic policy, risk, scope, budget and approval checks.
7. Execute only allowlisted actions in the correct isolated runtime.
8. Verify actual state changes and capture evidence.
9. Reflect on the outcome and update eligible memories/procedures.
10. Persist job state, audit trail and final report.

The first cognitive implementation is deterministic and side-effect-free. The first model-connected runtime is plan-only. Code execution arrives later behind isolation tests.

## Model boundary

Awwab's own model starts from random initialization and is trained with owner-approved, provenance-checked data. No external AI API, hosted agent, third-party pretrained weights, distillation, or silent fallback. Deterministic software can handle validation, state transitions and static repository analysis while the model is unavailable. It must not pretend deterministic heuristics are general reasoning.

## Development runtime

Prefer a local, owner-controlled runner initially so code and terminal access do not depend on a new cloud backend. Evaluate Windows and Termux feasibility, loopback security, filesystem scope, command allowlists, process isolation, resource limits, cancellation and audit before implementation. The hosted web UI must not gain arbitrary localhost access or broad shell permissions by default.

## Agent and version architecture

Start with one Developer agent. Later role-specialized agents share Awwab's own model initially and receive separate context, task IDs, workspaces and least-privilege tools. Distinguish code versions, model checkpoints, agent profiles and individual runs. No agent can approve, merge, deploy or promote its own candidate.

## Deterministic authority

Deterministic code—not a model—owns identity, data ownership, permissions, scopes, risk, approval, budgets, tool allowlists, job state transitions, audit integrity, cancellation and verification. Imported code and all model/retrieved/tool/agent output are untrusted until validated.

## Reliability and scaling

Use bounded timeouts, retries, idempotency, cancellation, resource budgets and verification. Add durable workers, vector stores, microservices or cloud resources only after a measured requirement and explicit owner approval. Do not weaken Firebase Rules to work around undeployed Functions.

## Current implementation boundary

The web UI, memory/research/workspace features and Model Lab scaffold exist on the development branch. The trained model, cognitive core, development tools, evolution engine and multi-agent runtime do not. See the master plan and pending-work audit for exact status.


## Cognitive Core v0 — first implementation slice (2026-11-01)

The first Awwab-owned cognitive module lives in `packages/shared/src/cognitive-core.mjs` with TypeScript declarations in `cognitive-core.d.mts`. It is dependency-free and deliberately separate from Firebase, the web UI and model inference.

Current deterministic contracts cover:
- versioned identity profiles with explicit purpose, principles and hard boundaries;
- five memory classes (working, episodic, semantic, procedural and development), owner scope, provenance, confidence, sensitivity, visibility, owner confirmation, expiry and correction/deletion;
- owner-scoped goals/subgoals, priority, constraints, progress and guarded status transitions;
- experience records linking goal/task/plan/action references to evidence, outcome and verification state;
- lexical context retrieval with explicit selection/exclusion reasons, sensitive/unconfirmed filtering, working-memory expiry and hard record/character limits.

The in-memory store is a testable reference adapter, not durable persistence. No Firestore schema, client write, migration, automatic memory injection, model call or tool execution is added. Retrieved content remains untrusted data and cannot authorize actions. Firebase integration is blocked until owner-scoped Rules and live behavior are independently verified.
