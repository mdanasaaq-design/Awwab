# Awwab Tasks

**Last reviewed:** 2026-10-18  
**Source of truth:** [Current Status](CURRENT_STATUS.md), [Phase Plan](PHASE_PLAN.md), [Issues and Risks](ISSUES_AND_RISKS.md)  
**Priority rule:** The command-center UX is the first product implementation phase. Foundation hardening follows before real assistant execution or privileged integrations.

Checkboxes mean only that the work is complete with evidence; planned or unexecuted validation stays unchecked.

## Phase 0 — Planning and evidence baseline

- [x] Repository/product/architecture/security blueprint exists.
- [x] Web command-center shell exists.
- [x] Firestore Rules test harness and CI workflow exist.
- [x] Record local web production build success (2026-10-18).
- [x] Record PR #3 CI results for web, functions/shared, and Firestore Rules (passed before merge, 2026-10-16).
- [x] Refresh current status against the merged command-center baseline.
- [x] Add phase-by-phase plan with observable acceptance criteria.
- [x] Add prioritized issue/risk register.
- [x] Align roadmap and README documentation map with the phase plan.
- [ ] Record a local Firestore emulator Rules test run.
- [x] Record backend callable emulator test results (CI runs 39117195997, 39117401427, and 39117914336); full development-project lifecycle remains outstanding.
- [ ] Record a full validation run on the repository's Node.js 22 baseline.
- [ ] Record real Firebase Auth/device lifecycle validation.
- [ ] Record Android build/test evidence.

## Phase 1 — Web command-center UX (first product implementation phase)

### Design and information architecture
- [ ] Review the existing command-center shell against the intended information-dense, calm, keyboard-friendly direction.
- [ ] Define page hierarchy, navigation behavior, page titles, and consistent status language.
- [ ] Define a small design-token/component baseline for typography, spacing, surfaces, borders, focus, and semantic states.
- [ ] Specify the purpose and primary user workflow for Assistant, Projects, Tasks, Research, Automations, Activity, and Settings.
- [ ] Decide whether a command/search palette and shortcuts solve real navigation problems before designing them.
- [ ] Write acceptance criteria and capture a design/reference review before editing UI code.

### Interaction and accessibility
- [x] Implement bounded Phase 1 slice: keyboard-first quick switcher, skip link, focus handling, and truthful signed-in status label; CI passed. Acceptance criteria and evidence: [Phase 1 implementation](PHASE_1_IMPLEMENTATION.md).
- [ ] Complete browser/manual interaction review and owner acceptance before treating this slice as fully accepted.
- [x] Implement Phase 1C explicit device-revocation confirmation and focus handling; CI passed. Acceptance criteria/evidence: [PHASE_1C_DEVICE_REVOCATION_CONFIRMATION.md](PHASE_1C_DEVICE_REVOCATION_CONFIRMATION.md).
- [ ] Complete Phase 1C browser/manual confirm, cancel, focus, and error review.
- [x] Implement Phase 1D mobile account controls and sign-out failure state; CI passed. Acceptance criteria/evidence: [PHASE_1D_MOBILE_ACCOUNT_CONTROLS.md](PHASE_1D_MOBILE_ACCOUNT_CONTROLS.md).
- [ ] Complete Phase 1D browser/manual responsive and sign-out failure review.
- [x] Implement Phase 1E safe sign-in error mapping and retry states; CI passed. Acceptance criteria/evidence: [PHASE_1E_AUTH_ERROR_STATES.md](PHASE_1E_AUTH_ERROR_STATES.md).
- [ ] Complete Phase 1E browser/manual error and retry review.
- [x] Implement Phase 1B device-list loading, refreshing, empty, and error states; CI passed. Acceptance criteria/evidence: [PHASE_1B_DEVICE_LOADING.md](PHASE_1B_DEVICE_LOADING.md).
- [ ] Complete Phase 1B browser/manual state review.
- [ ] Design loading, empty, unavailable, error, success, confirmation, and retry states.
- [ ] Review keyboard-only navigation, focus order, focus visibility, and escape/cancel behavior.
- [ ] Review semantic labels, screen-reader behavior, contrast, scalable text, and reduced motion.
- [ ] Review narrow mobile, tablet, and desktop layouts.
- [ ] Ensure all visible controls are functional or clearly disabled with a reason.
- [ ] Keep non-connected features honest; no fake data or false success states.
- [ ] Add appropriate UI/accessibility checks where they provide repeatable value.

### Phase 1 exit
- [ ] Owner accepts the visual/interaction direction.
- [ ] UI acceptance criteria pass with observed evidence.
- [ ] No new privileged actions or external side effects were enabled.

## Phase 2 — Foundation security and environment validation

### Rules and data ownership
- [x] Phase 2A: make `/users/{uid}` backend-owned, allow owner read only, and test denied client writes. Merged in [PR #8](https://github.com/mdanasaaq-design/Awwab/pull/8); CI run 39116859040 passed. Acceptance criteria/evidence: [PHASE_2A_PROFILE_WRITE_BOUNDARY.md](PHASE_2A_PROFILE_WRITE_BOUNDARY.md).
- [x] Phase 2F collection ownership rules and emulator tests merged in [PR #13](https://github.com/mdanasaaq-design/Awwab/pull/13); CI run 39118165874 passed all four jobs. Acceptance criteria/evidence: [PHASE_2F_DATA_OWNERSHIP_RULES.md](PHASE_2F_DATA_OWNERSHIP_RULES.md).
- [x] Decide that /jobs and /connections are backend-only with default deny; PR #13 merged and CI run 39118165874 passed.
- [x] Review client write permissions for memories, automations, preferences, and notifications in Phase 2F; CI run 39118165874 passed.
- [x] Phase 2G project/task field allowlists, enums, immutable creation timestamps, and source provenance merged in [PR #14](https://github.com/mdanasaaq-design/Awwab/pull/14); CI run 39118461462 passed all four jobs. Acceptance criteria/evidence: [PHASE_2G_PROJECT_TASK_RULES.md](PHASE_2G_PROJECT_TASK_RULES.md). Nested list/cross-document checks remain follow-ups.
- [ ] Add negative Rules tests for protected profile fields, unexpected keys, cross-user access, and disallowed state changes.

### Device lifecycle and backend
- [x] Phase 2B atomic first-device bootstrap and callable emulator tests merged in [PR #9](https://github.com/mdanasaaq-design/Awwab/pull/9); CI run 39117195997 passed. Acceptance criteria/evidence: [PHASE_2B_BOOTSTRAP_CONCURRENCY.md](PHASE_2B_BOOTSTRAP_CONCURRENCY.md).
- [x] Phase 2C transactional last-trusted-device revocation merged in [PR #10](https://github.com/mdanasaaq-design/Awwab/pull/10); CI run 39117401427 passed concurrent, final-device, idempotent, and pending-device tests. Acceptance criteria/evidence: [PHASE_2C_LAST_DEVICE_REVOCATION.md](PHASE_2C_LAST_DEVICE_REVOCATION.md).
- [ ] Review registration/approval/revocation idempotency and retry behavior.
- [x] Phase 2D shared device callable DTOs and web generics merged in [PR #11](https://github.com/mdanasaaq-design/Awwab/pull/11); CI run 39117694957 passed. Acceptance criteria/evidence: [PHASE_2D_CONTRACT_ALIGNMENT.md](PHASE_2D_CONTRACT_ALIGNMENT.md).
- [x] Phase 2E callable authorization/validation/state tests merged in [PR #12](https://github.com/mdanasaaq-design/Awwab/pull/12); CI run 39117914336 passed all four jobs. Acceptance criteria/evidence: [PHASE_2E_CALLABLE_COVERAGE.md](PHASE_2E_CALLABLE_COVERAGE.md).
- [ ] Test audit behavior for successful and failed security transitions.
- [x] Audit current App Check initialization/enforcement and document the staged rollout; see [PHASE_2H_APPCHECK_ENVIRONMENT.md](PHASE_2H_APPCHECK_ENVIRONMENT.md). No enforcement was enabled.
- [ ] Validate App Check with a real development web client/provider and observe callable acceptance/rejection before any enforcement change.

### Environment and validation
- [ ] Establish a dedicated development Firebase project/environment and verify it end-to-end.
- [ ] Keep development and production project IDs, secrets, OAuth clients, App Check settings, and deployment credentials separate.
- [ ] Use Node.js 22 for reproducible validation.
- [ ] Run web typecheck/build.
- [ ] Run Functions typecheck/build.
- [ ] Run shared contract typecheck.
- [ ] Run Firestore Rules tests against the emulator.
- [ ] Run backend callable emulator tests.
- [ ] Record exact commands, environment, results, and unresolved failures in CURRENT_STATUS.md.

### Phase 2 exit
- [ ] Critical profile/device concurrency risks are closed or explicitly accepted by the owner.
- [ ] Rules and callable tests cover positive and negative paths.
- [ ] Development Firebase authentication/device lifecycle is verified.
- [ ] No assistant execution is enabled until the required security gate passes.

## Phase 3 — Assistant Core v0

**Current slice:** provider-neutral plan validation and trusted tool-policy preflight are present on `feat/assistant-core-foundation`; acceptance remains unchecked until CI evidence is observed. Scope and limitations: [Assistant Core Foundation](PHASE_3_AGENT_CORE_FOUNDATION.md).

- [ ] Define versioned assistant request/response and error contracts.
- [ ] Add authenticated assistant request endpoint.
- [ ] Add provider-neutral model interface.
- [ ] Add model routing policy based on task, quality, latency, cost, privacy, and availability.
- [ ] Add scoped context selector and conversation persistence.
- [ ] Add structured plan representation and bounded execution state.
- [ ] Add allowlisted tool registry and deterministic policy engine.
- [ ] Add approval gate bound to exact target/action/payload.
- [ ] Add execution limits, timeout/retry policy, idempotency, and cancellation where possible.
- [ ] Add side-effect-specific verification and activity trace/correlation IDs.
- [ ] Connect the web composer only after endpoint/error behavior is real.
- [ ] Add safe-task benchmark fixtures and security regression tests.

### Phase 3 exit
- [ ] Safe tasks complete end-to-end with verified outcomes and auditable evidence.
- [ ] Unauthenticated/unauthorized actions fail closed.
- [ ] No unrestricted arbitrary-code or high-impact action tool is exposed.

## Phase 4 — Personal context and research

- [ ] Define memory write/retention/delete/export policy.
- [ ] Add provenance, confidence, sensitivity, expiry, and user confirmation where appropriate.
- [ ] Add inspect/edit/delete controls for durable memory.
- [ ] Add permission-scoped retrieval, ranking, and context budgets.
- [ ] Define research tool contract and retrieval adapter.
- [ ] Add source extraction/ranking and claim-to-evidence citation model.
- [ ] Add uncertainty handling and research evaluation set.
- [ ] Add memory-poisoning and indirect prompt-injection tests.

### Phase 4 exit
- [ ] Memory and research benchmarks pass agreed privacy, quality, and safety thresholds.

## Phase 5 — Productivity and project intelligence

- [ ] Implement tasks API and task lifecycle.
- [ ] Design and implement Today, reminders, goals, and follow-up.
- [ ] Add project/repository references, decisions, issues/PR context, and project status.
- [ ] Add approved GitHub development workflow with bounded changes and verification.
- [ ] Distinguish user commitments from AI recommendations.
- [ ] Add useful empty/loading/error states for every connected view.
- [ ] Add integration tests for a complete task workflow and a complete project workflow.

### Phase 5 exit
- [ ] Each shipped workflow is backed by real state and has verifiable success/failure outcomes.

## Phase 6 — Tool platform, automation, and proactivity

- [ ] Add versioned tool schemas, scopes, risk, data classification, timeout, retry, idempotency, budget, audit, and verification metadata.
- [ ] Add durable job model, scheduler, cancellation, bounded retries, and execution history.
- [ ] Add automation kill switch and per-automation limits.
- [ ] Add explicit approval policies for high-impact actions.
- [ ] Add relevance scoring, notification budgets, quiet hours, dismiss/snooze, and feedback.
- [ ] Assess MCP only for a concrete interoperability need.
- [ ] Add adversarial and failure-recovery tests before enabling scheduled execution.

### Phase 6 exit
- [ ] Automations can be audited, cancelled, bounded, verified, and recovered safely.

## Phase 7 — Android and multimodal

- [ ] Document and verify Android Gradle/JDK/SDK setup.
- [ ] Establish repeatable Android build and test commands.
- [ ] Integrate Auth and device trust through the shared server-side model.
- [ ] Implement assistant requests, Today, notifications, approvals, and quick actions.
- [ ] Validate permissions, lifecycle, App Check/Play Integrity, and notification behavior.
- [ ] Evaluate voice/STT/TTS, file/image understanding, and attachment provenance.
- [ ] Ensure voice is never the sole authorization for sensitive actions.

### Phase 7 exit
- [ ] Every shipped Android capability has device-level validation and the same backend security gates as web.

## Phase 8 — Release readiness and deployment

- [ ] Confirm production/development separation and least-privilege IAM.
- [ ] Configure and verify secrets, billing alerts, spend controls, and monitoring.
- [ ] Document backup/restore, rollback, and incident response.
- [ ] Complete privacy, retention, export, and deletion decisions.
- [ ] Run full applicable release regression and security review.
- [ ] Review known issues and explicitly accept or resolve release-blocking risks.
- [ ] Obtain explicit owner authorization for the specific production deployment.

## Backlog discipline

- Do not begin P2/P3 autonomy while P0 security/validation blockers remain open.
- Do not mark a task complete because code exists; require appropriate evidence.
- Split implementation into bounded pull requests with acceptance criteria written before editing.
- Keep this file and CURRENT_STATUS.md synchronized when evidence changes.
