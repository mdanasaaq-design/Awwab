# Awwab Testing and Evaluation Strategy

A personal agent can pass normal software tests while still being unsafe or useless. Awwab therefore uses four validation layers.

## 1. Software correctness

- TypeScript typechecks
- production builds
- unit tests
- Firestore Rules tests
- backend callable tests
- Android tests
- integration tests

Never claim a check passed without observed output.

## 2. Security validation

Test unauthenticated access, cross-user isolation, device trust, approval bypass, expired approvals, payload substitution, revoked devices, scope violations, prompt injection, indirect prompt injection, memory poisoning, malicious tool outputs, secret leakage, runaway automation and rate/budget exhaustion.

## 3. Agent evaluation

Maintain a versioned benchmark covering:
- direct Q&A
- research
- planning
- memory
- tasks
- projects
- tool selection/arguments
- multi-step execution
- failure recovery
- proactive suggestions
- safety/refusal
- approval behavior
- multimodal tasks

Each case defines input, context, tools, expected behavior, unacceptable behavior, evidence and risk.

## 4. Production quality

Track success rate, verified completion, correction rate, tool errors, unnecessary clarification, factuality, citation quality, latency, cost, automation failure, policy violations and trust.

## Evaluation harness

Future runner should support deterministic fixtures, mock tools, adversarial prompts, rubrics, model comparison, regression detection, cost measurement and trace inspection.

## Local validation

Before Firebase deployment:
1. install dependencies
2. web typecheck
3. web build
4. Functions typecheck/build
5. shared typecheck
6. Firestore Rules tests

Current rules command:

```bash
npm run firebase:rules:test
```

## Development Firebase

After emulator validation, validate authentication, device lifecycle, profile access, App Check and backend authorization against the dedicated development project.

## Android

Validate build, Auth, device registration, approvals, notifications, App Check, voice, lifecycle and permission handling.

## CI

CI should run typechecks, builds and automated tests. Production deployment remains a separately authorized workflow.


## Observed validation update — 2026-10-27

The user's extracted Windows ZIP copy passed functions typecheck, functions build, and web build. The commands ran on Node 24.19.0 rather than the repository's Node 22 baseline. These results are local-copy build evidence only; they do not establish GitHub main parity, emulator test success, deployed function availability, or live Auth/device behavior. The live Functions deployment attempt was blocked by the Blaze requirement. Repeat the documented full suite on Node 22 after source reconciliation and after a no-Blaze backend architecture is selected.


---

> **Planning sync — 2026-10-27:** Current blockers and decisions are tracked centrally in [Master Plan and Work Audit](../project/MASTER_PLAN.md). Historical acceptance criteria and prior CI results must not be interpreted as proof that live Firebase integration works.


## Open-source test reuse (2026-10-30)

Use Promptfoo's MIT-licensed evaluation and red-team patterns as source material for Awwab-owned deterministic test fixtures. Tests must run against mocks or Awwab's own local model; do not configure remote provider adapters, API keys or paid evaluation calls. Reuse Playwright fixtures for deterministic browser behavior and preserve upstream notices for any copied code.

Every imported module needs tests for no hidden network/model call, input limits, malformed output, permission isolation, failure handling and attribution. The detailed catalogue is [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md).


## Cognitive core and self-development test plan — 2026-10-31

Before model integration, add deterministic tests for identity versioning, memory ownership/provenance/sensitivity/expiry/correction/deletion, goal state transitions, context relevance/budget, and evidence-linked reflection.

Before enabling development tools, test repository path confinement and symlink/path traversal rejection; read-only mode and write-scope allowlists; command allowlist, environment sanitization, secret redaction and resource/time limits; cancellation, process cleanup, retry budgets and workspace quotas; branch/worktree isolation and clean-base verification; patch validation and no writes to stable branch; test-result capture and repository-state read-back; prompt injection through README/code comments/issues/tool output; rollback/recovery and candidate/stable comparison; and owner approval for merge/release/deploy.

Model tests must separate dependency-free checks from PyTorch-backed training/inference. Synthetic fixtures test mechanics only. No model-quality claim without held-out, provenance-reviewed evaluation. Run local tests before CI; CI success is not live backend or browser evidence.
