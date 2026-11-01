> **ACTIVE TASK QUEUE — 2026-11-01**  
> Controlling plan: [Self-Development Master Plan](SELF_DEVELOPMENT_MASTER_PLAN.md). This block supersedes earlier active-queue summaries; historical checklists below remain evidence records.  
>
> ## Current phase — Cognitive Core v0
> - [x] Initial deterministic core: versioned identity, five memory kinds, owner-scoped in-memory store, goals/subgoals, evidence-linked experiences and bounded context selection. Local validation recorded by owner on 2026-11-01: 27 tests passed, shared typecheck passed.
> - [x] Memory conflict/retention policy prototype with owner-selected conflict commands and no automatic hard deletion.
> - [x] Read-only legacy-memory compatibility mapper with synthetic round-trip tests; no live MemoryPanel/Firestore integration.
> - [x] Versioned durable-adapter TypeScript contract, owner-scoped request shapes and compile-time contract fixture committed to development branch at `f324bb5`.
> - [ ] Observe CI for adapter contract update and run the new type fixture/tests locally after owner sync.
> - [ ] Add behavioral conformance tests against an isolated in-memory adapter implementation; do not represent method-shape/type checks as security conformance.
> - [ ] Formalize identity version evolution and correction/retention edge cases.
> - [ ] Review existing MemoryPanel and Rules before proposing any integration; no writes/migration.
>
> ## Gates retained
> - Assistant generation remains disabled until Awwab's own random-init checkpoint passes held-out capability/safety evaluation.
> - High-assurance device actions remain disabled: AWW-022 callerDeviceId spoofing is unresolved.
> - Privileged backend operations remain blocked until a secure hard-$0 runtime is proven and explicitly approved.
> - PR #22 → PR #23 ancestry and exact main baseline must be reconciled before any merge; no merge authorized.
> - Live Firestore Rules state remains unverified; no Rules deployment without approval.
>
> ## Next after Cognitive Core
> - Prepare a separate, owner-approved Model Lab local smoke-test/data/evaluation decision. Do not install heavy dependencies, download data/model weights, or train until approved.
> - Then build read-only repository inventory/indexing and evaluate a local Windows/Termux runner before any sandboxed file-edit or terminal execution.
>
> ---
>
> **ACTIVE TASK QUEUE — 2026-10-31 (supersedes older unchecked historical lists below)**  
> Controlling plan: [Self-Development Master Plan](SELF_DEVELOPMENT_MASTER_PLAN.md). Full work inventory: [Pending Work Audit](PENDING_WORK_AUDIT.md). Historical checklists below are retained as records and must not be treated as the active queue without revalidation.
>
> ## P0 — blockers / gates
> - [ ] Keep assistant generation disabled until an Awwab-owned random-init checkpoint passes held-out capability/safety evaluation.
> - [ ] Keep high-assurance device actions disabled: AWW-022 callerDeviceId spoofing remains confirmed; no production device trust claim.
> - [ ] Keep privileged backend operations blocked until a hard-$0 secure runtime is proven and explicitly approved; no Blaze upgrade or hosted resource creation.
> - [ ] Reconcile PR #22 → PR #23 branch chain and exact main ancestry before any merge; no merge is authorized by this plan.
> - [ ] Verify live Firestore Rules state read-only; no Rules deployment without approval.
>
> ## P1 — next implementation phase: Cognitive Core v0
> - [ ] Define versioned Awwab identity/constitution contracts.
> - [ ] Define working, episodic, semantic, procedural and development memory types.
> - [ ] Define owner-controlled goals/subgoals, priority, constraints and progress.
> - [ ] Implement deterministic context selection with provenance, sensitivity filters and context budgets.
> - [ ] Add evidence-linked experience/decision records and reflection contracts.
> - [ ] Add deterministic tests for ownership, expiry, correction/deletion, conflicts, relevance and context budgets.
> - [ ] Preserve existing memory UI/data; do not silently auto-inject or train on saved memories.
>
> ## P1 — Model Lab readiness (separate approval gate)
> - [ ] Decide local PyTorch environment and run tiny smoke tests only after owner approval.
> - [ ] Define a lawful, provenance-recorded, owner-controlled training corpus and held-out evaluation plan.
> - [ ] Add reproducibility, checkpoint resume, structured-task, instruction-following, safety and resource benchmarks.
> - [ ] Train/evaluate an actual random-init checkpoint only after explicit resource/data approval.
>
> ## P1 — after Cognitive Core and model gates
> - [ ] Build read-only repository inventory/indexer and GitHub inspection.
> - [ ] Evaluate a local Windows/Termux development runner; no hosted backend assumption.
> - [ ] Add sandboxed file edit, Git worktree, allowlisted test execution, cancellation and redacted audit.
> - [ ] Prove one Developer agent end-to-end on a low-risk issue and produce a reviewable diff.
> - [ ] Add version candidate metadata, comparison, reproducibility and rollback.
>
> ## P2 — later
> - [ ] Add specialist agent profiles and sequential coordination; parallelize only after measured benefit.
> - [ ] Add durable scheduled autonomy with budgets, cancellation, expiry and kill switch.
> - [ ] Continue selected open-source reuse R2–R7 after exact-file licence/security review.
> - [ ] Complete manual browser/accessibility/mobile acceptance and Android build/device validation.
> - [ ] Revisit device-key proof only when a secure $0 server execution path exists or the owner explicitly changes constraints.
>
> ---
>
# Awwab Tasks

**Last reviewed:** 2026-10-28  
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
- [x] Implement Phase 1G page/browser-title context; merged in [PR #20](https://github.com/mdanasaaq-design/Awwab/pull/20), CI passed. Manual browser review remains pending; acceptance criteria: [PHASE_1G_PAGE_CONTEXT.md](PHASE_1G_PAGE_CONTEXT.md).
- [ ] Define page hierarchy, navigation behavior, page titles, and consistent status language.
- [x] Phase 1H command-center operational overview is present on `main`; source acceptance audit recorded in [PHASE_1H_COMMAND_CENTER_OVERVIEW.md](PHASE_1H_COMMAND_CENTER_OVERVIEW.md). CI passed in runs [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) and [40685073409](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685073409). [ ] Desktop/mobile browser acceptance remains pending; do not treat source review or CI as visual verification.
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
- [x] Implement Phase 1F trusted-device successful-empty copy and polite status announcement; merged in [PR #19](https://github.com/mdanasaaq-design/Awwab/pull/19), all four CI jobs passed in [run 39126668502](https://github.com/mdanasaaq-design/Awwab/actions/runs/39126668502). Manual browser review remains pending; acceptance criteria: [PHASE_1F_DEVICE_EMPTY_STATE.md](PHASE_1F_DEVICE_EMPTY_STATE.md).
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
- [x] Test audit behavior for successful security transitions and verify failed transitions are not falsely recorded as successful; callable emulator test passed in [run 40691341042](https://github.com/mdanasaaq-design/Awwab/actions/runs/40691341042). Failed-attempt audit logging remains a separate policy decision.
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
- Prefer direct, bounded commits to GitHub `main` for low-risk changes; use branches/PRs when a meaningful review boundary or elevated risk justifies them.
- Write acceptance criteria before application-code edits and keep this file and CURRENT_STATUS.md synchronized when evidence changes.


## 2026-10-27 audit addendum — current blockers and next execution order

### Phase 0 — Source-of-truth reconciliation
- [ ] Identify the actual Git clone and the extracted ZIP copy; preserve both until compared.
- [ ] Compare apps/web/src/device.ts and backend/functions/src/index.ts local region edits against GitHub main.
- [ ] Confirm latest main/PR status before further code edits; update all evidence labels.
- [ ] Keep the master plan, status, risk register, decisions, changelog and handoff synchronized.

### Phase 1 — UX acceptance (before backend activation)
- [ ] Test sign-in persistence, sign-out, sign-in error/retry, and refresh.
- [ ] Test device loading/empty/error/refresh/registration failure/revocation confirm-cancel.
- [ ] Review keyboard navigation, quick switcher, skip link, focus order/return, Escape and visible focus.
- [ ] Review narrow mobile, tablet and desktop layouts for overlap/clipping.
- [ ] Review accessible names, status announcements, contrast, zoom and reduced motion.
- [ ] Record browser/manual results and owner acceptance; keep unconnected views truthful.

### Backend architecture gate — no Blaze upgrade
- [ ] Document comparison of blocked Firebase Functions, Cloudflare Worker + Firebase Auth/Firestore, and one alternative free-tier option.
- [ ] Evaluate verified Firebase ID tokens, revocation, UID derivation, Firestore least-privilege access, secrets, region, quotas, rate limiting, monitoring, cost and rollback.
- [ ] Obtain owner approval of one architecture before account/resource creation or migration.
- [ ] Specify compatible API contracts for health, registerDevice, bootstrapFirstDevice, listDevices, approveDevice, revokeDevice and ensureUserProfile.
- [ ] Preserve atomic bootstrap, last-trusted-device protection, audit and fail-closed authorization.
- [ ] Add local tests for invalid/expired tokens, cross-user access, malformed inputs, concurrency, retries, idempotency and sanitized errors.
- [ ] Only after explicit approval, validate in a non-production environment and record the real device lifecycle.

### Foundation and later phases
- [ ] Complete nested list/reference/state-transition Rules coverage and UserProfile contract decision.
- [ ] Validate App Check with a real development provider/token before considering enforcement.
- [ ] Run full checks on Node 22 and record exact outcomes.
- [ ] Implement plan-only Assistant Core only after security/backend gates; no tool side effects.
- [ ] Keep workspace data, memory/research, tools/automation, Android and release work behind their phase-specific gates.

**Billing/deployment hold:** Do not retry Cloud Functions deployment, upgrade Firebase, deploy Hosting/Rules, create Cloudflare resources, migrate data, or change live security policies without explicit owner authorization.

See [Master Plan](MASTER_PLAN.md) for full step-by-step acceptance criteria and dependencies.


## Phase 0 — live repository audit follow-up (2026-10-28)

- [x] Inspect GitHub repository/default branch and current main head (`07651e3`).
- [x] Inspect open PR #16/#17 and record their draft/open state, scope, and divergence from current main.
- [x] Confirm current main has no explicit `asia-south1` region in the web Functions client or backend callable declarations; local ZIP edits are not on main.
- [x] Locate actual clone at `C:\Users\rexy2\Awwab`; confirm remote, branch, HEAD (`3a7d914`), and clean tracked tree.
- [x] Fetch `origin`; confirm local `main` is 60 commits behind and 0 ahead, with no local-only commits.
- [x] Back up the untracked local `package-lock.json` to `C:\Users\rexy2\Awwab-package-lock.local-backup-20261028.json` and verify identical SHA-256 hashes.
- [ ] Fast-forward local `main` and inspect any lockfile difference without discarding local data.
- [ ] Review PR #16 against current main and obtain a non-cancelled Rules test run after reconciliation.
- [ ] Review PR #17 against current main; preserve it as a pure validator/preflight with no execution side effects.
- [ ] After synchronization, proceed to Phase 1 manual browser acceptance; do not confuse source review or CI with browser validation.

**Hold:** Do not merge PR #16/#17, merge stale feature branches wholesale, deploy, change Rules, upgrade billing, or provision an alternative backend during reconciliation.


## Phase 1 — keyboard accessibility follow-up (2026-10-28)

- [x] Extend the existing `:focus-visible` outline to native `select` and `textarea` controls in [commit 4aea511](https://github.com/mdanasaaq-design/Awwab/commit/4aea511b03fd24b8dc57148d216a817530238384).
- [ ] Confirm GitHub Actions for this CSS change.
- [ ] Complete browser keyboard-focus review; source edits and CI do not replace manual review.
## Free-only local prototypes

- [x] Record the strict $0 backend feasibility gate in [Backend Architecture Options](BACKEND_ARCHITECTURE_OPTIONS.md).
- [x] Add a synthetic-data-only device lifecycle model and Node.js test cases under [project/prototypes](prototypes/).
- [x] Run the initial local prototype tests: 8 passed, 0 failed (user-confirmed Node.js test output, 2026-10-28).
- [x] Run the expanded local prototype tests: 12 passed, 0 failed (user-confirmed PowerShell output, 2026-10-28).
- [ ] Do not connect the mock to the live UI or treat it as proof of Firestore transaction correctness.
- [ ] Continue investigating only solutions that require no billing, no paid service, and no weakening of Firestore Rules.
- [x] Perform a source-only device backend review; findings and guardrails recorded in [DEVICE_BACKEND_SECURITY_REVIEW.md](DEVICE_BACKEND_SECURITY_REVIEW.md).
- [x] Expand local regression coverage for pending-device revocation, repeat-revocation idempotency, cross-user target-ID attempts, metadata bounds, and invalid caller IDs.
- [x] Run the expanded local prototype suite and record the actual result: 12 passed, 0 failed (user-confirmed PowerShell output, 2026-10-28).
- [x] Draft a server-verifiable device-key proof-of-possession design and document its limits in [DEVICE_BINDING_DESIGN.md](DEVICE_BINDING_DESIGN.md); this is a proposal only, not implementation.
- [ ] Add explicit registration/profile initialization retry tests and decide their idempotency contract.
- [x] Add an isolated Node.js Ed25519 device-key proof-of-possession model with synthetic identities and tests for replay, wrong key/user/action/target, expiry, pending/revoked status, and key replacement.
- [x] Run both original local prototype test suites: **24 passed, 0 failed** (12 device-key proof tests + 12 device-lifecycle tests; user-reported PowerShell run, 2026-10-28).
- [x] Review proof-model edge cases and add regressions for exclusive expiry, unsafe expiry arithmetic, retry after invalid signature, and revocation after challenge issuance; document limits in [DEVICE_BINDING_REVIEW.md](DEVICE_BINDING_REVIEW.md).
- [x] Run the updated regression suite locally and record the exact user-reported result: **27 passed, 0 failed, 0 skipped** (15 device-key proof tests + 12 device-lifecycle tests; PowerShell output supplied 2026-10-28).
- [x] Refine the backend feasibility research with a concrete Worker + Firebase ID-token verification + server-only Google identity candidate and explicit blockers in [FREE_ZERO_FIRESTORE_BACKEND_FEASIBILITY.md](FREE_ZERO_FIRESTORE_BACKEND_FEASIBILITY.md); this is desk research only, not proof or approval.
- [x] Research Firestore IAM database-scope limitations and service-account key risks; document why a Worker identity is not approved for the existing shared database.
- [x] Compare an isolated Supabase Free + Edge Function device-service candidate against the Worker + Google IAM approach; document Firebase-token claim caveats, isolation benefits, quota/pause limits, and unresolved security gates.
- [x] Write a local-only Supabase device-service security/test specification covering Firebase token validation, role-claim dependency, Postgres transaction invariants, RLS, secret handling, and strict $0 hard stops in [SUPABASE_DEVICE_SERVICE_TEST_PLAN.md](SUPABASE_DEVICE_SERVICE_TEST_PLAN.md).
- [x] Add a local-only synthetic Firebase JWT verification harness with adversarial claim/signature tests; this validates the model only, not real JWKS/network/Edge Runtime behavior.
- [x] Complete Phase 1 source-only Firebase token-verifier review against official Firebase/Supabase docs; findings and Phase 2 hardening requirements recorded in [PHASE_1_FIREBASE_TOKEN_VERIFIER_REVIEW.md](PHASE_1_FIREBASE_TOKEN_VERIFIER_REVIEW.md). This does not approve production use.
- [x] Implement Phase 2 synthetic verifier hardening: `auth_time`, bounded config/time arithmetic, strict base64url/UTF-8 parsing, JWT type and key-set validation, with expanded regression cases. Implementation and test cases are committed; execution of the expanded suite is still pending.
- [ ] Run the Phase 2 verifier regression suite after the hardening changes and record the exact result; passing the synthetic suite does not approve production use.
- [ ] Independently review a production-grade JWT/JWKS verification design and verify Google key caching/rotation, revocation policy, Edge Function gateway bypass, and failure behavior.
- [ ] Resolve the Firebase role-claim dependency without Blaze/Identity Platform, or reject the Supabase candidate; do not create a project until the owner explicitly approves a separate non-production proof of concept.
- [ ] Obtain explicit approval before creating any Supabase project, secret, integration, or deployment.

## Phase 3 — backend architecture decision (2026-10-28)

- [x] Compare Firebase callable Functions, Cloudflare Worker + Google service identity, isolated Supabase Edge Function/database, direct browser writes, and deferral under the strict $0 requirement.
- [x] Record the decision and acceptance gates in [PHASE_3_BACKEND_DECISION.md](PHASE_3_BACKEND_DECISION.md).
- [x] Select isolated Supabase device-only service as the preferred **research candidate** because it offers a narrower data boundary than privileged access to the existing shared Firestore database.
- [x] Record the current operating decision: **no candidate is approved for provisioning or deployment; defer live device management** until token verification, atomicity, security, and strict-$0 requirements are demonstrated.
- [ ] Resolve the Supabase Firebase role-claim / custom-verification question without requiring Blaze or Identity Platform.
- [ ] Complete local adversarial design tests and independent review before any hosted proof of concept.
- [ ] Obtain explicit owner approval before creating any account, resource, secret, or deployment.

**Important:** Phase 3 research/decision is complete; backend implementation/provisioning acceptance is not. Existing backend acceptance-gate items above remain unchecked.


## Open-source reuse programme (added 2026-10-30)

- [ ] R1: inspect exact Mozilla Readability commit, source files, Apache-2.0 notices and tests; integrate a pure article parser into Research.
- [ ] R2: inspect LangGraph.js and port only the minimal deterministic workflow/checkpoint primitives Awwab needs.
- [ ] R3: inspect Mem0 deterministic merge/deduplication logic and Graphiti temporal provenance patterns; preserve Awwab consent and Firestore ownership.
- [ ] R4: implement a local read-only Playwright adapter with a narrow allowlist and sandbox.
- [ ] R5: compare LitGPT/nanoGPT training code and port selected random-init training/checkpoint optimizations; no pretrained weights.
- [ ] R6: adapt selected MarkItDown document parsing for explicitly supported file types.
- [ ] R7: add Promptfoo-inspired local red-team/evaluation fixtures and minimal OpenTelemetry only if useful.

See [Open-Source Reuse Catalogue](../docs/OPEN_SOURCE_REUSE_CATALOG.md) for source links, licences, exclusions, implementation order and acceptance criteria. Do not start an item before exact-file licence and dependency review.


## Task/project reference security — 2026-10-30

- [x] Pass the owner UID into task validation on both create and update.
- [x] Require every non-null task `projectId` to exist under that same user's project collection.
- [x] Add emulator coverage for same-owner, null, missing, cross-user and update-path references.
- [ ] Confirm all six CI jobs pass on current branch head `6284409d460d861e0bad5f1148284819e4b957ea` (run [41069341725](https://github.com/mdanasaaq-design/Awwab/actions/runs/41069341725) pending at documentation time).
- [ ] Review and approve the Rules change before merge.
- [ ] Deploy matching Rules only after explicit owner authorization; keep UI project linking disabled until then.


### Task/project Rules test correction — 2026-10-30

- [x] Diagnose CI failure: update rule omitted the newly required `uid` validator argument.
- [x] Correct update rule to call `validTask(request.resource.data, uid)` in commit `3b5405e147ca64ff9f5af1951a9154bceed2efa1`.
- [ ] Re-run all CI jobs on the corrected PR head and verify the Firestore Rules emulator suite.


## Workspace Security and Data Integrity phase — 2026-10-30

- [x] Deny hard deletion of projects in Firestore Rules.
- [x] Remove project delete action from the UI; retain archive/restore.
- [x] Require task completion timestamps to match `done` state.
- [x] Stamp completion with server request time, preserve it during completed-task edits, and clear it when reopening.
- [x] Add emulator regressions for project deletion and task completion lifecycle.
- [ ] Run and pass all six CI jobs on the latest branch head.
- [ ] Review/merge/deploy Rules only after explicit owner approval; keep project linking disabled until then.


### Workspace Rules compatibility fix — 2026-10-30

- [x] Diagnose failure for legacy non-done tasks without `completedAt`.
- [x] Allow the completion field to be omitted or null for non-done tasks while still requiring it for `done`.
- [ ] Re-run all CI jobs on latest head and verify the Rules emulator suite.


### Workspace Security and Data Integrity — validation result

- [x] All six CI jobs passed on tested head `60ca4f9aacf76239ea57082e70a5483974067402` in [run 41070757092](https://github.com/mdanasaaq-design/Awwab/actions/runs/41070757092).
- [x] Firestore Rules emulator and backend callable emulator jobs passed.
- [ ] Manual browser acceptance remains outstanding.
- [ ] Review/merge/deploy Rules only after explicit owner approval; project linking remains disabled until then.


## Backend Independence and Trusted Device Architecture — 2026-10-30

- [x] Review Firebase Auth, Firestore, Functions v2 and deployment constraints.
- [x] Confirm caller-supplied trusted device ID is not proof of possession with a two-session emulator characterization test.
- [x] Make device registration + activity event transactional and idempotent under concurrent retries.
- [x] Make profile initialization transactional under concurrent first sign-in.
- [x] Add callable emulator tests for registration races, audit consistency and profile initialization races.
- [x] Add Settings disclosure explaining current device trust limitation.
- [x] Record architecture decision: retain Firebase Auth + Firestore; no second backend or billing change.
- [x] Record explicit NO-GO for production trusted-device security until device-key proof and a hard-$0 server path are verified.
- [ ] Implement and independently review server-side device-key proof, challenge consumption, recovery and rotation when an approved backend runtime is available.
- [ ] Revisit the $0 runtime gate only with explicit owner approval; no Blaze upgrade or deployment is authorized.


### Backend Independence and Trusted Device — validation result

- [x] All six CI jobs passed in [run 41072625634](https://github.com/mdanasaaq-design/Awwab/actions/runs/41072625634) on head `1e0ef8537ab5481c8842292510fffe2d1092903f`.
- [x] CI runs the device lifecycle and Ed25519 key-proof local model tests; both passed.
- [x] Backend callable emulator suite passed, including concurrency/idempotency tests and the explicit known-limitation spoofing test.
- [x] Web build, Functions/shared checks, Firestore Rules, memory/research, and Model Lab jobs passed.
- [ ] Production trusted-device proof-of-possession remains blocked; do not treat this phase as production security approval.


## Phase 1 progress — 2026-11-01

<details>
<summary>Initial Cognitive Core v0 slice (implementation started)</summary>

- [x] Add dependency-free shared cognitive-core module and TypeScript declarations.
- [x] Define versioned identity profile contract.
- [x] Define five memory kinds and provenance/sensitivity/expiry/confirmation controls.
- [x] Add owner-scoped in-memory reference store with correction/deletion.
- [x] Add goal/subgoal lifecycle, progress and cycle guards.
- [x] Add evidence-linked experience records.
- [x] Add deterministic lexical context selection with exclusion reasons and hard budgets.
- [x] Add dedicated Node test suite and CI step.
- [ ] Verify latest CI run and fix any failures.
- [ ] Expand tests for memory conflicts, retention and context relevance edge cases.
- [ ] Specify identity version evolution and storage adapter contracts.
- [ ] Review whether existing Memory UI can safely consume the new contracts; no live integration until Rules are verified.

</details>


## Cognitive Core v0 validation result — 2026-11-01

- [x] Verify CI on code head `05fbe89f018e238fce89ff1257cb29665565b68b`: [run 41305026578](https://github.com/mdanasaaq-design/Awwab/actions/runs/41305026578), all six jobs passed; Cognitive Core suite 13/13.
- [ ] Expand tests for memory conflict handling, retention and context relevance edge cases.
- [ ] Specify the storage adapter contract and verify owner-scoped persistence requirements before implementing a durable adapter.
- [ ] Define identity change/review policy beyond sequential immutable version history.
- [ ] Review safe integration with existing Memory UI; do not enable live writes until Rules are verified.


### Cognitive memory boundary and policy prototype — 2026-11-01

- [x] Specify the owner-scoped async storage adapter surface, optimistic version checks and atomic conflict-resolution requirement in [Cognitive Memory Storage Contract](../docs/cognitive-memory-storage-contract.md).
- [x] Add runtime adapter-shape assertion (shape only; not a security or transaction proof).
- [x] Add owner-selected conflict-resolution command builder; no automatic contradiction inference or writes.
- [x] Add deterministic expiry classification; expired data is excluded from context but never auto-hard-deleted.
- [x] Add policy regression tests and CI coverage.
- [x] Verify CI on code head `17abc62c794c0381731e662c0f942fd9d32264cf`: [run 41306843643](https://github.com/mdanasaaq-design/Awwab/actions/runs/41306843643), all six jobs passed; policy + Cognitive Core tests passed.
- [ ] Implement adapter conformance tests before selecting any durable store.
- [ ] Review existing Memory UI/schema and Firestore Rules compatibility; no live integration or writes until approved.


### Existing Memory UI compatibility review — 2026-11-01

- [x] Inspect `apps/web/src/MemoryPanel.tsx` and current `firestore.rules` memory contract.
- [x] Document the proposed field/type/provenance/timestamp mapping and incompatibilities in [Cognitive Memory Compatibility](../docs/cognitive-memory-compatibility.md).
- [ ] Build a read-only mapper over synthetic fixtures and reject ambiguous type conversions.
- [ ] Add round-trip and adapter conformance tests before considering integration.
- [ ] Review Rules compatibility and obtain explicit approval before any schema/Rules/live-data change.
 
### Cognitive memory compatibility mapper — 2026-11-01
- [x] Implement a pure, read-only mapper for unambiguous existing MemoryPanel records.
- [x] Reject ambiguous goal/project types and non-expiring temporary context rather than guessing.
- [x] Preserve owner scope, source provenance, confirmation, sensitivity, confidence, visibility, expiry and original legacy type.
- [x] Add synthetic round-trip/rejection tests and CI coverage.
- [ ] Run and inspect fresh CI for this mapper; do not claim validation until it completes.
- [ ] Add adapter conformance tests and review Firestore Rules before proposing any integration.
- [ ] Keep MemoryPanel/Firestore integration, schema changes, migrations and live writes disabled pending separate approval.
