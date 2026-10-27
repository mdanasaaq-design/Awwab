# Repository Structure

This document defines the canonical layout of the Awwab repository. Keep the repository root focused on workspace and Firebase configuration; place product code, shared contracts, tests, documentation, and project tracking in their dedicated areas.

## Top-level layout

```text
Awwab/
├── .github/workflows/       # CI and repository automation
├── apps/
│   ├── web/                 # React + TypeScript + Vite web client
│   └── android/             # Native Android application (Kotlin)
├── backend/
│   └── functions/           # Firebase Cloud Functions (Node.js 22)
├── packages/
│   └── shared/              # Cross-client/server TypeScript contracts
├── docs/                    # Product, architecture, security, setup, and testing docs
├── project/                 # Current status, tasks, plans, phase records, decisions, risks
├── tests/                   # Emulator-backed rules and callable tests
├── firebase.json            # Firebase CLI configuration
├── firestore.rules          # Firestore authorization rules
├── firestore.indexes.json   # Firestore index declarations
├── package.json             # Workspace scripts and package manager configuration
├── package-lock.json        # Reproducible npm dependency lock
├── .firebaserc.example      # Safe Firebase alias template; local .firebaserc is ignored
└── README.md                # Project entry point
```

## Placement rules

- Put runtime/application code under the owning app or backend workspace, not in the repository root.
- Put reusable cross-workspace contracts in `packages/shared/src/`; keep client-only types in the client that owns them.
- Put Firebase Rules and index declarations at the root because `firebase.json` references them there.
- Put emulator tests in `tests/`; do not mix generated build output, dependencies, local credentials, or test artifacts into source directories.
- Put stable product and engineering references in `docs/`. Put change-by-change status, acceptance records, decisions, and risks in `project/`.
- Keep phase records together in `project/` and use the existing `PHASE_*` prefix so each record's phase and sequence are obvious.
- Keep documentation links relative to the file containing them and update links when a document is renamed.
- Preserve existing source/config paths unless there is a concrete benefit to changing them: build scripts, Firebase configuration, Android package paths, imports, and docs may depend on those names.

## Naming conventions

- React/TypeScript source: descriptive `camelCase.ts` for modules and `PascalCase.tsx` for React components where applicable.
- CSS: descriptive lowercase names such as `styles.css` and `navigation.css`.
- General reference docs in `docs/`: lowercase kebab-case, e.g. `firebase-setup.md`.
- Project tracking documents: uppercase descriptive names for canonical records (e.g. `CURRENT_STATUS.md`, `PHASE_PLAN.md`, `TASKS.md`, `ISSUES_AND_RISKS.md`); phase records keep the `PHASE_<sequence>_<topic>.md` convention.
- Configuration files retain the names required by their tools (for example `package.json`, `tsconfig.json`, `firebase.json`, and `firestore.rules`).

## Safety and hygiene

- Never commit `.env.local`, `.firebaserc`, signing keys, API secrets, or generated output.
- `.env.example` and `.firebaserc.example` may contain placeholders only, never working credentials.
- Keep `package-lock.json` in sync with workspace manifest changes by using npm rather than editing the lockfile manually.
- Do not claim a build, test, preview check, or production deployment passed unless the output was observed and recorded.
- Preview Hosting deployments are not production releases. Production deployment remains a separate, explicitly authorized action.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
