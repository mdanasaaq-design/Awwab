# Awwab

Awwab is an independent personal AI system under owner control. Its long-term goal is a persistent cognitive architecture, an Awwab-owned model trained from random initialization, useful tools, and a safe self-development lifecycle.

> **Current reality (2026-11-06):** This repository is a substantial development foundation, not a finished or production-ready AI assistant. Assistant generation remains disabled; the Awwab model has no capable trained checkpoint; Android is a minimal shell; Firebase Functions are not deployed on the current Spark plan; and the AWW-022 device proof-of-possession issue remains unresolved.

## Start here

- [Claude development guide](CLAUDE.md) — required working rules and current project boundaries.
- [Current status](project/CURRENT_STATUS.md) — implementation and validation evidence.
- [Tasks](project/TASKS.md) — active work queue.
- [Self-Development Master Plan](project/SELF_DEVELOPMENT_MASTER_PLAN.md) — controlling product roadmap.
- [Pending Work Audit](project/PENDING_WORK_AUDIT.md) — gaps and audit findings.
- [Issues and Risks](project/ISSUES_AND_RISKS.md) — blockers and release gates.
- [New Chat Handoff](project/NEW_CHAT_HANDOFF.md) — latest continuation state.
- [Repository structure](docs/repository-structure.md) — where code, tests and documents belong.

## Repository layout

```text
Awwab/
├── .github/                 # GitHub workflows
├── apps/
│   ├── web/                 # React + TypeScript + Vite client
│   └── android/             # Kotlin + Jetpack Compose shell
├── backend/functions/       # Firebase Functions (Node.js 22)
├── packages/shared/         # Shared contracts and cognitive/memory modules
├── model-lab/               # Awwab-owned random-init model/training scaffold
├── tests/                   # Unit, emulator and contract tests
├── docs/                    # Stable architecture, product and engineering docs
├── project/                 # Plans, tasks, decisions, risks and evidence
├── firebase.json            # Firebase CLI configuration
├── firestore.rules          # Firestore authorization rules
├── firestore.indexes.json   # Firestore index declarations
├── package.json             # npm workspaces and root scripts
├── package-lock.json        # Locked npm dependency graph
├── .firebaserc.example      # Placeholder-only Firebase alias template
├── .gitignore               # Local secrets and generated files are excluded
├── CLAUDE.md                # Claude's repository-level development guide
└── README.md
```

## Product and model boundaries

- Awwab remains a standalone product with its own policies, data boundaries and model.
- No external AI APIs, third-party pretrained weights, hosted agent runtimes, teacher-model distillation or silent remote fallback.
- Deterministic open-source engineering code may be reused only after exact-file licence, dependency, security, attribution and test review.
- User conversations are not training data without separate explicit opt-in and privacy/deletion controls.
- The strict budget is $0 unless the owner explicitly approves a specific cost.

## Current capabilities and limitations

The branch contains a web application foundation, Firebase sign-in integration, memory and research interfaces/code, project/task workspace code, shared cognitive/memory modules, Firebase Functions source, emulator tests and a from-scratch Model Lab scaffold.

These components are not equivalent to a complete assistant:
- Assistant generation is disabled because no capable Awwab model is trained and integrated.
- Cognitive and memory modules are not yet a complete integrated conversational runtime.
- Model Lab code is a scaffold; synthetic smoke tests do not establish model quality.
- Android is a minimal Compose shell and has not passed a reproducible build/device acceptance gate.
- There is no dedicated Windows desktop application workspace.
- A9's device-proof crypto helper is isolated; challenge issuance/atomic consumption and protected-callable integration are still missing. AWW-022 remains open.
- Firebase emulator tests do not prove live Firebase configuration, Rules deployment or production readiness.

## Development and validation

Requirements:
- Node.js 22 for the root npm workspaces and Firebase Functions.
- Python 3.11+ and PyTorch 2.x only for Model Lab training/inference.
- Android build prerequisites are not yet fully documented or reproducible; see [Android README](apps/android/README.md).

From the repository root:

```sh
npm ci
npm run validate:local
```

The validation command runs shared/Functions checks, the A9 crypto tests, web checks, cognitive/memory tests and Firebase emulator suites. Do not assume it passed on a new commit until its output is observed. The previously recorded A8 result of 55 passing tests predates A9.

For Firebase local setup, see [Firebase setup](docs/firebase-setup.md). Do not deploy, change billing, create cloud resources, alter live Rules/data, or merge without explicit owner approval.

## Development workflow

Inspect → plan a bounded change → implement → test → review security/licences → update documentation → report evidence. See [CLAUDE.md](CLAUDE.md) for the complete development and approval rules.
