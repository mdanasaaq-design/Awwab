# Awwab Issues and Risks

**Last reviewed:** 2026-10-18  
**Repository baseline reviewed:** `cffb22b829e76a859dd3029e482abd10e8314af5`  
**Purpose:** Planning register from source/document review. These are not all reproduced runtime bugs. Items marked **confirmed from code** are directly visible in the inspected source; items marked **validation gap** need tests or environment evidence.

## Priority definitions

- **P0 — Gate:** must be resolved before connecting real assistant execution or relying on the affected security boundary.
- **P1 — High:** must be resolved in the relevant foundation/core phase before shipping that capability.
- **P2 — Medium:** needed for product usability, maintainability, or a later phase.
- **P3 — Future:** valuable only when justified by measured user value.

## Active register

### AWW-001 — Profile document writes are not field-restricted

- **Priority:** P0
- **Type:** Security risk
- **Status:** Resolved in PR #8; not known to have been exploited.
- **Evidence:** `firestore.rules` allows an authenticated owner to create and update `/users/{uid}` without field allowlists or restrictions on backend-owned fields.
- **Impact:** A client can potentially write or overwrite fields intended to be controlled by trusted backend code, including metadata that later features may treat as authoritative.
- **Resolution:** PR [#8](https://github.com/mdanasaaq-design/Awwab/pull/8) changed the root profile to owner-read only and added negative tests for client create/update/delete and protected fields. CI run [39116859040](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116859040) passed the Firestore Rules suite.
- **Acceptance:** Satisfied for the current root profile contract. Any future editable profile field needs a new explicit contract and tests.
- **Phase:** 2 — Foundation security.

### AWW-002 — First-device bootstrap has a concurrency window

- **Priority:** P0
- **Type:** Security/reliability risk
- **Status:** Resolved in PR #9 for the tested bootstrap invariant.
- **Evidence:** `bootstrapFirstDevice` queries for any device, then creates a trusted device in a separate operation.
- **Impact:** Two concurrent bootstrap requests may both observe an empty collection and create separate trusted first devices.
- **Resolution:** PR [#9](https://github.com/mdanasaaq-design/Awwab/pull/9) uses a per-user guard and one transaction for the guard, trusted device, and audit event. Callable emulator test [39117195997](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117195997) passed concurrent bootstrap, unauthenticated, repeat-call, and legacy-device checks.
- **Acceptance:** Concurrent bootstrap attempts result in exactly one valid first trusted device; all other attempts fail safely or return the same established result.
- **Phase:** 2 — Foundation security.

### AWW-003 — Concurrent device revocation may remove the final trusted device

- **Priority:** P0
- **Type:** Security/recovery risk
- **Status:** Resolved in PR #10 for the tested last-trusted-device invariant.
- **Evidence:** `revokeDevice` queries the trusted-device count and then updates a target device separately.
- **Impact:** Concurrent revocations may each observe multiple trusted devices and revoke different devices, potentially leaving no trusted device.
- **Resolution:** PR [#10](https://github.com/mdanasaaq-design/Awwab/pull/10) moves target-state checks, trusted-device counting, revocation, and audit into one transaction. CI run [39117401427](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117401427) passed concurrent revocation, final-device rejection, idempotent repeat, and pending-device checks.
- **Acceptance:** No supported concurrent operation can leave the account with zero trusted devices unless a separately designed recovery path intentionally permits it.
- **Phase:** 2 — Foundation security.

### AWW-004 — Shared contracts and callable DTOs are not fully aligned

- **Priority:** P1
- **Type:** Correctness/maintainability
- **Status:** Device callable DTOs aligned in merged PR #11; remaining planned UserProfile shape is documented as a separate schema/DTO gap.
- **Evidence:** `packages/shared/src/contracts.ts`, web device types/callable generic types, and backend response shapes differ in required fields and envelope shape. For example, the shared device record does not include the web's `deviceId` field, and callable responses include fields such as `ok` and `status` that are not represented by one shared contract.
- **Impact:** Drift can cause unsafe assumptions, duplicated types, and runtime failures that TypeScript cannot catch across the client/server boundary.
- **Mitigation:** PR [#11](https://github.com/mdanasaaq-design/Awwab/pull/11) defines shared device callable DTOs, uses them in the web client, and adds emulator response-shape assertions. CI run [39117694957](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117694957) passed. The planned `UserProfile` domain interface remains explicitly separate from the current persisted-profile DTO and needs a later schema decision before use.
- **Acceptance:** Contract tests cover success/error shapes and web/backend compile against the same definitions.
- **Phase:** 2 — Foundation security and contracts.

### AWW-005 — Backend callable tests and lifecycle integration evidence are missing

- **Priority:** P1
- **Type:** Validation gap
- **Status:** Callable emulator coverage merged in PR #12 and CI passed; full real Auth/device lifecycle remains unverified.
- **Evidence:** The repository contains Firestore Rules tests; the reviewed task/status documents list backend callable emulator tests and real authentication/device lifecycle validation as outstanding.
- **Impact:** A successful web build and Rules suite do not prove backend state transitions, authorization, audit events, or failure behavior work end-to-end.
- **Mitigation:** PR [#12](https://github.com/mdanasaaq-design/Awwab/pull/12) extends the emulator suite for unauthenticated calls, invalid IDs/platforms, registration idempotency, trust checks, approval state, revoked-device reactivation, profile initialization, and health. CI run [39117914336](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117914336) passed. Full real Auth/device lifecycle validation remains outstanding.
- **Acceptance:** Emulator tests exercise positive and negative paths with observed results recorded in the status report.
- **Phase:** 2 — Foundation security.

### AWW-006 — Client profile fields and backend-owned metadata need an explicit ownership contract

- **Priority:** P1
- **Type:** Data integrity
- **Status:** Resolved for the current root profile contract in PR #8.
- **Evidence:** The backend's `ensureUserProfile` maintains profile fields and timestamps, while current Rules permit broad owner writes.
- **Impact:** Client edits and backend-maintained metadata can conflict; future authorization decisions may accidentally rely on client-controlled values.
- **Resolution:** [Data model](../docs/data-model.md), [Phase 2A acceptance/evidence](PHASE_2A_PROFILE_WRITE_BOUNDARY.md), and the Rules test suite now agree that root profile fields are backend-owned and direct client writes are denied. CI run [39116859040](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116859040) passed.
- **Acceptance:** Satisfied for the current profile shape; revisit only when a validated profile-edit workflow is designed.
- **Phase:** 2 — Foundation security.

### AWW-007 — Jobs and connections appear in the data model but not in explicit Rules matches

- **Priority:** P1
- **Type:** Contract ambiguity
- **Status:** Resolved by the explicit backend-only decision and default-deny tests in merged PR #13.
- **Evidence:** `docs/data-model.md` describes `/users/{uid}/jobs` and `/users/{uid}/connections`; `firestore.rules` has no specific match blocks for these paths and ends with default deny.
- **Impact:** Client access will be denied unless backend-only access is intended. Future developers may assume documented collections are client-readable/writable.
- **Resolution:** PR [#13](https://github.com/mdanasaaq-design/Awwab/pull/13) documents jobs/connections/system as backend-only with default deny and adds Rules tests. CI run [39118165874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39118165874) passed.
- **Acceptance:** Every documented collection has an explicit owner/writer matrix and a Rules test for the intended behavior.
- **Phase:** 2 — Foundation security.

### AWW-008 — Assistant and workspace views are placeholders, not connected workflows

- **Priority:** P0 for product scope; not a defect in the current honest placeholder behavior.
- **Type:** Product capability gap
- **Status:** Confirmed from UI.
- **Evidence:** The assistant panel states that the core is not connected and disables sending. Projects, tasks, research, automations, and activity pages explicitly show that they are not connected to live data.
- **Impact:** The visual shell can be mistaken for a functioning assistant unless availability and empty states stay explicit.
- **Plan:** Follow Phase 1 UX acceptance criteria. Do not enable fake interactions or imply that actions ran.
- **Acceptance:** Every placeholder is visibly unavailable/in development; controls are either functional or disabled with a clear reason.
- **Phase:** 1 — Command-center UX, followed by phases 3–6 for real workflows.

### AWW-009 — Authentication entry flow may be incomplete for first-time users

- **Priority:** P1
- **Type:** Product/setup question
- **Status:** Needs owner decision and environment validation.
- **Evidence:** The reviewed web UI exposes email/password sign-in; a self-service account creation and password-reset flow were not visible in the inspected UI.
- **Impact:** A first-time user may not know how to create or recover an account without manual Firebase Console setup.
- **Plan:** Decide whether account creation/recovery is part of the intended private beta or an admin-only setup flow. Document the supported path before exposing the app to others.
- **Acceptance:** First-time and returning-user paths are documented and tested; recovery does not weaken device trust.
- **Phase:** 1–2.

### AWW-010 — Android is a minimal shell and build reproducibility is unverified

- **Priority:** P1 before Android release; P2 while web is the active priority.
- **Type:** Product/validation gap
- **Status:** Confirmed shell; build not verified in this audit.
- **Evidence:** `MainActivity.kt` currently renders a basic Compose screen with a no-op button. The Android README describes future lifecycle work; no observed Android build/test result is recorded here.
- **Impact:** Android should not be presented as feature-complete or security-integrated.
- **Plan:** Keep Android work behind the web/foundation priorities. Record Gradle/JDK/SDK prerequisites and establish a reproducible build/test gate before integration work.
- **Acceptance:** Build/test instructions are reproducible; Auth, device trust, permissions, lifecycle, and server-side authorization are tested before release.
- **Phase:** 7.

### AWW-011 — Validation evidence is fragmented and the status record was stale

- **Priority:** P1
- **Type:** Project governance
- **Status:** Confirmed documentation gap.
- **Evidence:** `project/CURRENT_STATUS.md` was dated 2026-10-05, while the command-center changes and successful local web build happened later; several tasks were still unchecked despite CI evidence.
- **Impact:** Planning can repeat work, skip unresolved checks, or overstate readiness.
- **Plan:** Keep status, task list, roadmap, and this register synchronized; label the environment and evidence for every validation claim.
- **Acceptance:** The status page records date, commit, command/environment, result, and checks that remain unrun.
- **Phase:** 0 — Planning and evidence baseline.

### AWW-012 — Local workstation contains two different project copies

- **Priority:** P1 for operator safety; separate from product implementation.
- **Type:** Local workspace risk
- **Status:** Confirmed from the user's PowerShell output.
- **Evidence:** The nested Git clone is on `main`; the outer extracted folder is not a Git repository; eight sampled root files differ; a separate backup folder holds local `.firebaserc` and the previous lockfile.
- **Impact:** Changes may be made in the wrong copy, or an old copy may overwrite current files.
- **Plan:** Keep the Git clone as the working source. Do not merge, rename, or delete the extracted copy or backup until a separate, explicit comparison and archive decision is completed.
- **Acceptance:** One clearly identified working directory is documented; original and backup remain intact until verified. This item does not authorize deletion.
- **Phase:** Local housekeeping; not a blocker for documentation planning.

### AWW-013 — Node version differs between local workstation and repository baseline

- **Priority:** P1 for reproducible validation.
- **Type:** Environment drift
- **Status:** Confirmed from the user's terminal output.
- **Evidence:** Repository manifests and CI specify Node.js 22; the local environment reported Node.js 24.19.0. The web build passed locally on Node 24.
- **Impact:** A local pass on a different runtime may not reproduce CI behavior and can produce engine warnings.
- **Plan:** Use Node 22 for future full validation, document setup, and compare local results with CI.
- **Acceptance:** Required validation commands pass on the declared Node 22 baseline.
- **Phase:** 2.

### AWW-014 — Firestore client-write permissions need collection-by-collection review

- **Priority:** P1
- **Type:** Security/data integrity
- **Status:** Phase 2F narrowed assistant-owned collection writes in merged PR #13; Phase 2G top-level project/task schema validation is implemented in PR #14; CI passed; merge pending. Nested list/cross-document checks remain open.
- **Evidence:** Rules allow the owner broad CRUD access to projects, tasks, memories, automations, and preferences, and allow owner updates to notifications. This may be intentional for some data, but each collection needs an explicit field/transition policy before server automation consumes it.
- **Impact:** Future backend jobs may trust client-created or client-mutated records without validating schema, ownership, state transitions, or action definitions.
- **Mitigation:** PR [#13](https://github.com/mdanasaaq-design/Awwab/pull/13) tightens conversation, memory, automation, preference, and notification mutation rules; CI run [39118165874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39118165874) passed. PR [#14](https://github.com/mdanasaaq-design/Awwab/pull/14) adds project/task field allowlists, enum validation, timestamp integrity, and source immutability; CI run [39118461462](https://github.com/mdanasaaq-design/Awwab/actions/runs/39118461462) passed. PR [#16](https://github.com/mdanasaaq-design/Awwab/pull/16) adds bounded string-list validation and same-user project reference checks; CI pending. Detailed status-transition policy remains open.
- **Acceptance:** Each collection has tested read/create/update/delete permissions and field/state constraints aligned with its trust level.
- **Phase:** 2, then 6 for automation.

### AWW-015 — Production readiness has not been demonstrated

- **Priority:** P0 before public production use.
- **Type:** Release gate
- **Status:** Not done; no deployment was performed.
- **Evidence:** Current evidence covers a local web build and the CI checks recorded on PR #3. No live Firebase end-to-end validation, Android release validation, operational monitoring, restore drill, or production release review is recorded here.
- **Impact:** Build success alone is insufficient evidence for handling real user data or autonomous actions.
- **Plan:** Complete Phase 2 and capability-specific gates, then use the release checklist in Phase 8. Deployment requires separate explicit authorization.
- **Acceptance:** All applicable release checks have observed evidence and the owner approves the exact deployment.
- **Phase:** 8.

### AWW-016 — App Check client initialization is optional and callable enforcement is not enabled

- **Priority:** P1 before public production use
- **Type:** Security/abuse-control validation gap
- **Status:** Configuration audit and staged rollout documentation merged in PR #15; live provider/token validation remains outstanding and enforcement is not enabled.
- **Evidence:** `apps/web/src/firebase.ts` initializes App Check only when `VITE_FIREBASE_APP_CHECK_SITE_KEY` is present. The reviewed Functions v2 callable declarations do not set `enforceAppCheck: true`. No live development provider/token validation has been recorded.
- **Impact:** App Check is not currently an additional server-side attestation gate for these callables. Existing Firebase Authentication and trusted-device checks remain separate controls; App Check enforcement must not be assumed active.
- **Plan:** Keep enforcement disabled until a real development Web App/provider is configured, valid token behavior is observed, rejection metrics are reviewed, and a separate bounded enforcement change is approved. Validate Android separately.
- **Acceptance:** Development client token issuance/acceptance and selected callable enforcement are observed with a rollback plan; production requires explicit owner authorization.
- **Phase:** 2 — Foundation security and environment validation, then 8 — release readiness.

## Cross-cutting follow-ups

- Define the environment badge/state so development and production cannot be confused.
- Test responsive layout, keyboard-only operation, focus order, contrast, reduced motion, and screen-reader labels.
- Standardize user-visible errors and retry behavior without leaking sensitive backend details.
- Add test coverage for UI state transitions and backend failure paths before connecting services.
- Measure bundle size, latency, cost, and dependency health after functional correctness and security gates; do not optimize prematurely.
- Keep a decision record for unresolved product choices rather than silently choosing a permanent provider or integration.

## Review policy

- Update this register when an issue is verified, fixed, accepted, or superseded.
- A risk is not closed merely because a build passes.
- A finding may be marked resolved only with a linked change and verification evidence.
- This file is a planning register; it does not create GitHub Issues automatically.
