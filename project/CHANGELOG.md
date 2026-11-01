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


## 2026-10-31 — Awwab Self-Development planning consolidation
- Audited all 65 Markdown files on `opensource-reuse-strategy` and classified active product/architecture docs, historical phase evidence, and third-party vendor/licence files.
- Added [Self-Development Master Plan](SELF_DEVELOPMENT_MASTER_PLAN.md) and [Pending Work Audit](PENDING_WORK_AUDIT.md).
- Reframed the roadmap around Awwab's persistent cognitive core, Awwab-owned random-init model, repository perception, one safe Developer agent, version/evolution management, multi-agent orchestration and controlled autonomy.
- Corrected stale summaries and superseded the old R1-first next task; Mozilla Readability R1 is already integrated into the fixed Wikipedia research path.
- Recorded that the model is untrained, generation is disabled, Firebase Functions are undeployed on Spark, AWW-022 remains P0, and PR #22/#23 remain draft/open/unmerged.
- Documentation only: no application code, dependency, training, merge, deployment, billing, migration or cloud-resource change.


### Documentation synchronization completion — 2026-10-31
- Synchronized the Android README, Firebase setup, agent-runtime research and pending-work audit with the new cognitive/self-development direction.
- Updated current status and new-chat handoff to point to the controlling plan and active queue.
- Confirmed that the documentation pass did not change application code, dependencies, training artifacts, billing, cloud resources, live data, merge state or deployment state.
- Full CI was not rerun for this documentation-only change; prior CI evidence remains pinned to the commit recorded above.


## 2026-11-01 — Phase 1 Cognitive Core v0 started
- Added dependency-free `packages/shared/src/cognitive-core.mjs` and TypeScript declarations/export.
- Added versioned identity, five typed memory classes, owner-scoped in-memory memory CRUD/correction/deletion, provenance/sensitivity/expiry controls, goal/subgoal state management, evidence-linked experience records and deterministic context retrieval with explanations/budgets.
- Added dedicated Node tests and a CI step.
- Updated architecture, data-model, testing, master plan, pending audit, active task queue and README.
- No Firestore adapter/write, migration, model inference/training, external side effect, deployment, merge, billing or cloud-resource change.
- Phase 1 remains in progress pending CI and further acceptance work.


### Cognitive Core v0 initial CI validation — 2026-11-01
- CI run [41305026578](https://github.com/mdanasaaq-design/Awwab/actions/runs/41305026578) passed all six jobs on code head `05fbe89f018e238fce89ff1257cb29665565b68b`.
- Cognitive Core deterministic suite passed 13/13; web build/typecheck, Functions/shared typechecks, Firestore Rules emulator, backend callable emulator and Model Lab checks also passed.
- Phase 1 remains in progress; no durable persistence, Firebase integration, model inference, autonomous development, merge or deployment is claimed.


### Cognitive memory contract and policy prototype — 2026-11-01
- Added owner-scoped async adapter contract with optimistic concurrency and atomic conflict resolution requirements.
- Added explicit owner-selected conflict command builder and expiry classification; no automatic contradiction inference or hard deletion.
- Added six deterministic policy tests and CI execution alongside the Cognitive Core suite.
- No durable adapter, live database integration, migration, merge, deployment or billing change. CI validation pending.


### Existing Memory UI compatibility assessment — 2026-11-01
- Inspected the current MemoryPanel and Firestore Rules memory schema.
- Documented proposal-only field/type/provenance/timestamp mapping and incompatibilities in `docs/cognitive-memory-compatibility.md`.
- Existing Memory UI and Firestore data remain unchanged; integration requires synthetic mapper tests, adapter conformance, Rules review and separate owner approval.


### Cognitive memory policy validation — 2026-11-01
- CI run [41306843643](https://github.com/mdanasaaq-design/Awwab/actions/runs/41306843643) passed all six jobs on code head `17abc62c794c0381731e662c0f942fd9d32264cf`.
- Cognitive memory policy tests, Cognitive Core tests, shared/Functions typecheck, web build, Firestore Rules emulator, backend callable emulator and Model Lab checks passed.
- The following compatibility-assessment docs commit is documentation-only; its separate CI run is tracked in CURRENT_STATUS.md.

 
## 2026-11-01 — Read-only Cognitive Memory compatibility mapper
- Added an Awwab-owned, dependency-free mapper between the existing MemoryPanel document shape and Cognitive Core records.
- Preserved the original legacy type discriminator for reversible export; rejected ambiguous `goal_commitment` and `project_context` records and non-expiring `temporary_context` records.
- Enforced the legacy 2,000-character limit, explicit owner ID, supported provenance, confirmation/sensitivity/visibility metadata and canonical timestamp conversion.
- Added synthetic round-trip and rejection tests, package export/type declarations, and CI coverage.
- Kept the mapper disconnected from the UI and Firestore. No live reads/writes, adapter, schema/Rules changes, migration, merge, deployment or billing changes.
- Automated validation is pending on the new branch head.


## 2026-11-01 — Cognitive memory adapter contract v1

- Added a versioned TypeScript contract with object-shaped owner-scoped requests for all durable memory operations.
- Specified optimistic concurrency for update/delete, atomic all-or-nothing conflict resolution, and non-disclosing cross-owner reads.
- Added a compile-time adapter fixture to the shared TypeScript check and regression coverage for the runtime shape assertion boundary.
- Clarified that method-presence checks and type conformance do not prove runtime security or transactional behavior.
- No durable adapter, Firestore integration, live data mutation, migration, Rules change, or deployment.


## 2026-11-01 — Isolated memory adapter reference tests

- Added a test-only in-memory implementation of the v1 adapter interface.
- Added regression tests for owner isolation, duplicate IDs, optimistic concurrency, monotonic update timestamps, explicit deletion, and atomic conflict resolution.
- Added the suite to the existing CI memory/research job.
- This validates the fixture only; no durable adapter or live Firestore integration exists.


## 2026-11-01 — Adapter contract CI validation

- CI run [41337613099](https://github.com/mdanasaaq-design/Awwab/actions/runs/41337613099) passed all six jobs on code head `4ff8e05`.
- The memory/research job passed 32/32 tests; the compile-time adapter fixture passed within shared typecheck.
- Owner-local validation of the latest branch remains outstanding.
