# Claude Development Guide — Awwab

**Repository:** `mdanasaaq-design/Awwab`  
**Active development branch:** `opensource-reuse-strategy`  
**Last reviewed:** 2026-11-06

This file is the repository-level operating guide for Claude and other development assistants. It explains the current boundaries; it does not replace the source-of-truth project records.

## Read these files first

Before proposing or changing code, read them in this order:

1. [Current status](project/CURRENT_STATUS.md) — what is implemented and what has actually been validated.
2. [Tasks](project/TASKS.md) — active queue and acceptance gates.
3. [Self-Development Master Plan](project/SELF_DEVELOPMENT_MASTER_PLAN.md) — controlling product architecture and roadmap.
4. [Pending Work Audit](project/PENDING_WORK_AUDIT.md) — known gaps and documentation audit.
5. [Issues and Risks](project/ISSUES_AND_RISKS.md) — blockers and security risks.
6. [Architecture](docs/architecture.md) and [Repository Structure](docs/repository-structure.md).
7. [New Chat Handoff](project/NEW_CHAT_HANDOFF.md) — latest continuation state.
8. For the requested task, read the owning feature documentation, source files, tests, and relevant third-party notices.

If documents conflict, use this precedence: explicit owner decisions in `project/DECISIONS.md` and `project/AWWAB_INDEPENDENT_AI_DECISION.md`; then the Self-Development Master Plan; then the latest dated Current Status/Tasks/Handoff snapshot; then feature documents; then historical notes. Do not silently erase historical records. Record and resolve contradictions.

## Owner's product decisions

- Awwab is a standalone, independently owned product. Do not turn it into a wrapper around another AI.
- Awwab's own learned model must start from random initialization. No external AI APIs, third-party pretrained weights, hosted agent runtimes, teacher-model distillation, or silent remote fallback.
- Reuse useful deterministic open-source engineering code only after reviewing the exact source files, licence, dependencies, security, attribution and tests. Record reused code in `THIRD_PARTY_NOTICES.md`.
- Target surfaces are web, Windows/computer and Android phone. Do not claim desktop-app or complete Android support merely because development can happen on a computer or an Android shell exists.
- Keep the strict $0 constraint. Do not enable billing, use paid services, provision cloud resources, download model/data weights, or run expensive training without explicit owner approval.
- Preserve owner control, privacy, least privilege, auditable changes and rollback.

## Current implementation reality

The repository is a monorepo with:
- `apps/web/`: React, TypeScript and Vite web client.
- `apps/android/`: minimal Kotlin/Jetpack Compose shell; not a complete or validated Android client.
- `backend/functions/`: Firebase Functions source targeting Node.js 22; Functions are not deployed on the current Spark plan.
- `packages/shared/`: shared contracts and initial cognitive/memory modules.
- `model-lab/`: from-scratch model/training scaffold; no capable trained Awwab checkpoint is included.
- `tests/`: Node, Firestore Rules, callable and model-lab tests.
- `docs/` and `project/`: architecture, decisions, plans, risks, tasks and evidence.

Important gaps are real: assistant generation is disabled; cognitive/memory modules are not a complete integrated conversational runtime; the Model Lab has not established a capable trained model; Android build/device validation is outstanding; no dedicated Windows desktop application workspace exists; and AWW-022 device proof-of-possession is unresolved. The A9 crypto helper is isolated and is not wired into protected callables.

The Android project currently has no committed Gradle wrapper files (`gradlew`, `gradlew.bat`, or `gradle/wrapper/`). Do not invent wrapper binaries or claim reproducible Android builds. Propose a proper Gradle wrapper setup as a bounded task and validate it with an available compatible Gradle/JDK/Android SDK before marking complete.

## Development workflow

For each bounded task:

1. Confirm the active branch and clean/dirty working tree. Do not overwrite the owner's local changes.
2. Inspect the current source, call sites, contracts, tests, security rules and relevant documentation. Do not trust old plans as proof of current code.
3. State the intended scope, files likely to change, risks and acceptance criteria before a broad or destructive change.
4. Prefer a small vertical slice over creating empty architecture directories or speculative abstractions.
5. Add or update focused tests. Run the relevant typecheck/build/tests and report exact commands and observed outcomes.
6. Review security, privacy, accessibility, mobile/responsive behavior and dependency/licence impact where relevant.
7. Update `project/TASKS.md`, `project/CURRENT_STATUS.md`, `project/NEW_CHAT_HANDOFF.md`, and the owning docs when the work changes status or architecture.
8. Report commit IDs, changed files, test evidence, warnings, known gaps and exact pull instructions.

Never report tests, builds, browser behavior, device behavior, CI, deployment or security as passed without actual output/evidence. Distinguish source inspection, unit tests, emulator tests, CI, browser acceptance, real-device tests and live-service verification.

## Safety and approval boundaries

Unless the owner explicitly approves the specific action, do not:
- deploy Hosting, Functions or Firestore Rules (preview deployment also requires the owner's instruction);
- merge branches or pull requests;
- upgrade Firebase billing or enable paid services;
- create cloud resources, service accounts, credentials or secrets;
- migrate schemas, alter live data or change live Firebase configuration;
- access, print, commit or upload local `.env` files, signing keys, service-account files or credentials;
- run broad destructive commands, mass file deletion, or irreversible cleanup;
- train on private user conversations or unlicensed/unclear-provenance data.

Do not ask for or copy secrets into chat or GitHub. Keep `.env.local`, `.firebaserc`, `google-services.json` where sensitive, signing credentials, keystores and local build outputs out of Git. Only placeholder templates belong in the repository.

## Validation baseline

- Root npm workspace targets Node.js 22.
- Use the root lockfile and npm workspaces; do not introduce a second package manager without an explicit reason.
- Root validation command: `npm run validate:local`. It includes shared/Functions checks, the A9 crypto test, web checks, cognitive/memory tests and Firebase emulator suites. A9 was committed after the previously observed A8 55-test baseline; do not assume the new command has passed until it is actually run.
- Firebase emulator project `demo-awwab` is for tests. Emulator success does not prove live Firebase configuration or deployed Rules.
- Model Lab requires Python 3.11+ and PyTorch 2.x for training/inference. Standard-library tests do not prove PyTorch training or model quality.
- Android build prerequisites and wrapper reproducibility are currently unverified.

## Git and delivery

- The owner prefers direct, bounded work on the active GitHub branch and does not want routine PR/CI overhead unless needed.
- Do not push directly to `main`, merge, or deploy unless explicitly instructed.
- If committing to the active branch is authorized, use clear, scoped commit messages and keep each logical change reviewable.
- Provide exact PowerShell commands for the owner's Windows path `C:\Users\rexy2\Awwab`; provide Termux-compatible commands only when asked.
- A pull is not a deployment. Give deployment instructions only when the owner requests deployment and the release gates are satisfied.

## Required completion report

Every completed task report must include:
- goal and scope;
- files changed;
- commit SHA and branch;
- commands actually run and pass/fail results;
- unverified areas and remaining risks;
- whether any external service, live data, billing or deployment was touched (normally: no);
- exact next action for the owner.

When work is not complete, say so plainly and leave a precise handoff.