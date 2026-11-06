# Repository Structure

**Last audited:** 2026-11-06  
**Active branch reviewed:** `opensource-reuse-strategy`

This document describes the structure that actually exists on the reviewed branch and defines where future work belongs. It is not a promise that every planned capability is implemented.

## Existing repository layout

```text
Awwab/
├── .github/
│   └── workflows/                 # GitHub Actions workflows
├── apps/
│   ├── web/                        # React + TypeScript + Vite web client
│   │   └── src/
│   │       ├── research/           # Research parsing modules
│   │       └── vendor/mozilla/     # Attributed Mozilla Readability source
│   └── android/                    # Kotlin + Jetpack Compose shell
│       └── app/src/main/           # Android manifest, Kotlin source and resources
├── backend/
│   └── functions/                  # Firebase Functions source (Node.js 22)
├── packages/
│   └── shared/                     # Shared contracts and cognitive/memory modules
├── model-lab/                      # Random-init model, tokenizer, training/eval scaffold
│   ├── data/                       # Data instructions; generated datasets stay local
│   └── tests/                      # Model Lab tests
├── tests/
│   ├── fixtures/                   # Synthetic test fixtures
│   └── types/                      # Type-level contract tests
├── docs/                           # Stable architecture, product and engineering docs
├── project/
│   └── prototypes/                 # Explicitly labelled local reference/test prototypes
├── firebase.json                   # Firebase CLI configuration
├── firestore.rules                 # Firestore authorization rules
├── firestore.indexes.json          # Firestore index declarations
├── package.json                    # npm workspaces and root scripts
├── package-lock.json               # Reproducible npm dependency lock
├── .firebaserc.example             # Placeholder-only Firebase alias template
├── .gitignore                      # Local secrets and generated files are excluded
├── CLAUDE.md                       # Repository-level Claude development guide
└── README.md                       # Project entry point
```

## Workspace responsibilities

| Path | Responsibility | Current boundary |
|---|---|---|
| `apps/web/` | Browser client and web UX | React/TypeScript/Vite foundation; not a complete assistant |
| `apps/android/` | Native Android client | Minimal Compose shell; build/device integration unverified |
| `backend/functions/` | Privileged server operations | Firebase Functions source; not deployed on current Spark plan |
| `packages/shared/` | Cross-workspace contracts and deterministic shared logic | Initial cognitive/memory modules; integration is incomplete |
| `model-lab/` | Awwab-owned model research/training | Random-init scaffold; no capable trained checkpoint |
| `tests/` | Unit, emulator, contract and regression tests | Emulator success does not prove live-service behavior |
| `docs/` | Stable reference documentation | Architecture, product, security, setup, testing and reuse |
| `project/` | Changeable project state and evidence | Plans, tasks, decisions, risks, phase records and handoffs |

## Known structural gaps — do not hide these

1. **Android build reproducibility:** the reviewed tree has no committed Gradle wrapper (`gradlew`, `gradlew.bat`, or `gradle/wrapper/`). The Android source is a minimal shell. Add a wrapper only through a bounded, reproducible Gradle setup and verify it with compatible JDK/Android SDK tooling.
2. **Windows desktop client:** there is no dedicated desktop application workspace. A Windows computer is currently a development environment, not evidence of a Windows desktop app.
3. **Assistant runtime:** the assistant UI/runtime is not a complete working conversational assistant; generation remains disabled.
4. **Model:** Model Lab is a training scaffold, not a capable model. No trained checkpoint is committed.
5. **Cognitive integration:** shared cognitive/memory modules exist, but durable storage and complete web/backend/model integration are not established.
6. **Device security:** A9's proof verifier is isolated. Challenge issuance, atomic one-time consumption, platform key lifecycle and protected-callable integration are missing; AWW-022 remains open.
7. **Firebase hosting/runtime:** Functions are not deployed on the current Spark plan. Do not solve this by enabling billing or creating a different cloud service without explicit owner approval.

These are tracked gaps, not reasons to create empty placeholder directories.

## Placement rules

- Keep root limited to repository-wide configuration, scripts, security policy files and entry-point docs.
- Put user-facing clients under `apps/<client>/`.
- Put server-side privileged logic under `backend/<service>/`.
- Put reusable cross-client/server contracts and deterministic shared modules under `packages/shared/` until a concrete scale or ownership need justifies another package.
- Put app-specific code in its owning app; do not move it into shared code merely to reduce file count.
- Put emulator/unit/contract tests in `tests/` or the owning package's test directory when that package already has a clear convention.
- Put stable engineering/product references in `docs/`; put changing execution state, decisions, acceptance evidence and risks in `project/`.
- Keep third-party source isolated/identifiable and record exact upstream project, commit, source paths, licence, changes and attribution in `THIRD_PARTY_NOTICES.md`.
- Keep generated build output, dependencies, datasets, model checkpoints, credentials and test artifacts out of Git unless a specific small fixture is intentionally reviewed.
- Preserve existing paths unless a bounded migration includes updated imports, config, tests, documentation and a verified rollback.

## Naming conventions

- React components: `PascalCase.tsx`; general TypeScript modules: descriptive `camelCase.ts`.
- CSS: descriptive lowercase names.
- Stable docs: lowercase kebab-case in `docs/`.
- Project control records: descriptive uppercase names such as `CURRENT_STATUS.md`, `TASKS.md`, `ISSUES_AND_RISKS.md`.
- Preserve tool-required filenames such as `package.json`, `tsconfig.json`, `firebase.json` and `firestore.rules`.

## Secrets and generated files

- Never commit `.env.local`, `.env`, `.firebaserc`, service-account credentials, signing keys, keystores, or private credentials.
- `.env.example` and `.firebaserc.example` must contain placeholders only.
- Keep npm lockfiles synchronized through npm commands; do not hand-edit lockfile dependency graphs.
- Model datasets and checkpoints remain local unless a separately reviewed, explicitly approved fixture is small, licensed and safe to publish.
- Do not print secrets in logs, test output, documentation, issues or chat.

## Documentation source of truth

- [Claude development guide](../CLAUDE.md): development-agent operating rules.
- [Self-Development Master Plan](../project/SELF_DEVELOPMENT_MASTER_PLAN.md): controlling product architecture and roadmap.
- [Current Status](../project/CURRENT_STATUS.md): implementation and validation snapshot.
- [Tasks](../project/TASKS.md): active queue.
- [Pending Work Audit](../project/PENDING_WORK_AUDIT.md): gaps and audit findings.
- [Issues and Risks](../project/ISSUES_AND_RISKS.md): unresolved blockers.
- [New Chat Handoff](../project/NEW_CHAT_HANDOFF.md): continuation instructions.

Do not use historical references to `project/MASTER_PLAN.md` as the current roadmap; use `project/SELF_DEVELOPMENT_MASTER_PLAN.md`.
