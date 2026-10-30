# Changelog

## 2026-10-27 — Repository organization and status refresh

### Documentation and repository hygiene
- Added `docs/repository-structure.md` with canonical folder responsibilities, naming conventions, and safety rules.
- Standardized the project task register filename to `project/TASKS.md` and updated documentation links.
- Updated `.gitignore` to exclude the local `.firebaserc`, TypeScript build metadata, and Gradle caches without removing local files.
- Refreshed README and current status to reflect the observed local web build, Firebase bundle verification, and temporary Hosting preview deployment.
- No application code, Firebase configuration, security rules, or production Hosting release was changed by this organization pass.

## Unreleased — Agentic Architecture Upgrade

### Documentation
- Reframed Awwab from a chatbot concept into a secure personal-agent platform.
- Added agent runtime, capability, AI strategy, threat model, evaluation and roadmap documentation.
- Added explicit implemented/validated/planned/proposed/blocked status language.
- Added planning/execution separation, model routing, tool policy, approval binding and verification.
- Added memory provenance and poisoning controls.
- Added long-running jobs, cost controls and automation requirements.
- Added agent-specific security threats and evaluation requirements.

### Product direction
- Defined assistant quality contract.
- Defined capability pillars.
- Defined graduated autonomy.
- Defined proactive-assistance principles.
- Defined user-value metrics instead of vanity metrics.

### Not claimed
- No assistant request pipeline is implemented yet.
- No production model provider has been selected.
- No external integration is production-ready merely because it appears in architecture.
- No Firebase, Android, CI or deployment validation is claimed unless observed and recorded.


## 2026-10-27 — Full plan and execution-state audit

- Added the master plan with detailed phases, acceptance gates, source-of-truth reconciliation, and a planned-vs-observed work table.
- Recorded the Firestore database region and the Cloud Functions Blaze billing blocker based on observed CLI output.
- Recorded the owner decision to stay on the current Firebase plan and treat Cloudflare Workers as a research candidate only.
- Distinguished local extracted-copy build success from GitHub main, emulator, live integration and production evidence.
- No application code, Firebase Rules, Hosting, Functions, or cloud resources were deployed/changed by this documentation update.


## 2026-10-30 — Open-source code reuse strategy

- Added a detailed candidate catalogue covering agent workflows, browser automation, memory, research/document parsing, model training, evaluation/security, and speech.
- Reversed the earlier reference-only/no-copy rule: selected source code may be copied/adapted into Awwab after exact-file licence and security review.
- Preserved the independent-AI boundary: no third-party pretrained weights, external AI APIs, hosted agents, teacher distillation or remote fallback.
- Added phased integration order, source-copy checklist, licence exclusions and acceptance criteria.
- Updated 20 active planning/architecture/security/testing/model/project Markdown files on the strategy branch. Historical phase acceptance records were preserved.
- No third-party source code, dependency, model/data file, cloud resource, secret or deployment was added by this documentation update.


### R1 implementation and validation
- Vendored Mozilla Readability at a pinned upstream commit under Apache-2.0, retained the full licence and recorded provenance in `THIRD_PARTY_NOTICES.md`.
- Added a bounded plain-text parser wrapper and connected it to the existing Wikipedia Research path through the fixed CORS-enabled Wikipedia parse API, with search-excerpt fallback. Crossref remains unchanged.
- Added wrapper/provenance tests. Latest branch-head CI run [41064652230](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064652230) passed all six jobs.
- Manual browser/source-quality acceptance remains pending; this does not add arbitrary website crawling.


### Assistant plan-schema hardening — 2026-10-30
- Reject provider responses with unexpected fields, non-object payloads, malformed step records, or duplicate step IDs.
- Add regression tests for extra top-level metadata, injected step fields, and duplicate identifiers.
- Latest CI validation is pending; no trained model, assistant activation, or deployment is claimed.


### Project and task workspace — 2026-10-30
- Add account-scoped Firestore project creation, editing, archive/restore, and deletion.
- Add task creation with priority/due date, status filtering and updates, and deletion.
- Keep project references disabled until same-user reference validation is present in the active Firestore Rules.
- CI, emulator and browser validation are pending; no deployment or live Rules change was performed.


### Activity history — 2026-10-30
- Add a read-only, account-scoped view of the latest 100 backend-recorded activity events.
- The feed reports only stored events; it does not synthesize success or create new audit entries. Live content depends on the backend recording events.

- Extend task management with edit support for title, description, priority, and due date.
- Update command-center availability copy for the connected workspace sections.


### Workspace security and lifecycle hardening — 2026-10-30
- Deny hard deletion of projects in Firestore Rules and remove the project delete UI action; archive/restore preserves task references.
- Enforce consistency between task `done` status and `completedAt`, using server request time for completion and clearing it when reopening.
- Add emulator regressions for project deletion denial, valid completion, completed-task edits, forged completion timestamps, and reopening.
- Fresh CI on these commits is pending; no live Rules deployment or merge was performed.


### Workspace Security and Data Integrity — automated validation passed (2026-10-30)
- All six CI jobs passed on tested head `60ca4f9aacf76239ea57082e70a5483974067402` in [run 41070757092](https://github.com/mdanasaaq-design/Awwab/actions/runs/41070757092).
- Firestore Rules and backend callable emulator suites passed with the workspace lifecycle and completion-state changes.
- Browser acceptance and live Rules deployment remain pending; no merge or deployment was performed.


### Backend reliability and trusted-device architecture — 2026-10-30
- Made device registration and its audit event transactional; concurrent duplicate registration is retry-idempotent.
- Made user profile initialization transactional to avoid concurrent first-create races.
- Added callable emulator tests for duplicate registration races, profile initialization races, and a known device caller-ID spoofing limitation.
- Added Settings disclosure: current device records authenticate the account session, not cryptographic possession of the browser.
- Retained Firebase Auth + Firestore. No alternate backend/provider, cloud resource, migration, billing change or deployment.
- Production trusted-device security remains NO-GO until a reviewed server-verifiable key proof and hard-$0 execution path are available.


### Backend/device phase validation — 2026-10-30
- All six CI jobs passed in [run 41072625634](https://github.com/mdanasaaq-design/Awwab/actions/runs/41072625634) on tested head `1e0ef8537ab5481c8842292510fffe2d1092903f`.
- Added CI coverage for the local device lifecycle and Ed25519 key-proof model tests; both passed.
- Callable emulator coverage passed for transactional registration/profile setup and documented the known caller-ID spoofing limitation.
- The phase is source/reliability validated; production trusted-device security remains NO-GO pending integrated proof-of-possession and a verified $0 server path.
