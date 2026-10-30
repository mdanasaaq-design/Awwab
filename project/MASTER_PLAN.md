# Awwab Master Plan and Work Audit

**Reviewed:** 2026-10-30  
**Repository:** [mdanasaaq-design/Awwab](https://github.com/mdanasaaq-design/Awwab)  
**Planning status:** Active v1.0 implementation on draft PR #23, dependent on draft PR #22; no merge or production deployment is authorized.  
**Canonical trackers:** [Current status](CURRENT_STATUS.md) · [Phase plan](PHASE_PLAN.md) · [Tasks](TASKS.md) · [Risks](ISSUES_AND_RISKS.md) · [Decisions](DECISIONS.md)

## 1. Owner direction and non-negotiables

1. Build Awwab as a standalone personal assistant. Selected deterministic engineering source code may be copied/adapted after exact-file licence, security, attribution, and test review; Awwab retains its own product, permissions, data boundaries, and independently trained model.
2. Refine the web command center first, then harden the foundation, then connect assistant capabilities behind tested gates.
3. Use a command-center visual direction: information-dense, powerful, keyboard-friendly, calm and deliberate; avoid generic “vibe-coded” UI.
4. Plan bounded work and acceptance criteria before implementation. Audit what was planned, what actually changed, and what evidence exists.
5. Keep the current Firebase project on its existing plan. Do not upgrade to Blaze, add billing commitments, or start paid services without explicit owner approval.
6. No production Hosting deployment, Firestore Rules deployment, Cloud Functions deployment, data migration, or live security-policy change without explicit authorization.
7. Never claim success based only on a build; distinguish implemented, locally validated, CI validated, live validated, blocked, and not tested.
8. Do not add broad agent frameworks or third-party learned weights as a side effect of research. Reuse only bounded, reviewed components recorded in the open-source reuse catalogue.

## 2. Executive audit: observed reality as of 2026-10-27

### Confirmed from current conversation / command output

- Firebase project awwab-5d95f is accessible through the CLI.
- The default Firestore Native database exists in asia-south1 (Mumbai), STANDARD edition, with deletion protection enabled at creation.
- firebase functions:list --project awwab-5d95f returned **No functions found**.
- firebase deploy --only functions --project awwab-5d95f stopped before deployment because the project must be on Blaze to enable Artifact Registry / complete Cloud Functions deployment.
- No functions were deployed by that attempt; Hosting was not deployed by that attempt.
- In the local extracted Windows project copy, these commands passed on 2026-10-27:
  - npm run functions:typecheck
  - npm run functions:build
  - npm run web:build (Vite 8.3.0; 36 modules)
- The local copy was edited to set the web callable client and all seven Functions callables to asia-south1. Those edits have **not been proven to exist on GitHub main**. The working directory is an extracted ZIP without Git metadata, so local edits and GitHub history must be reconciled before any pull/deploy workflow.
- A Firebase Hosting release already exists at https://awwab-5d95f.web.app; its code/config is not assumed to match the just-built local copy.
- The previous UI test report said sign-in and navigation passed, while assistant input, device trust, and workspace data were not tested. Later Settings test showed device registration failed; the observed CORS/404 calls matched missing deployed functions.
- The new Firestore database has not been proven end-to-end with deployed rules, deployed functions, and a real Auth/device lifecycle. Treat live data access as unverified.

### Repository documentation/code audit (not equivalent to a fresh full code review)

- Web command-center shell and authentication/device-management UI exist.
- Assistant runtime is disconnected; composer remains disabled.
- Projects, tasks, research, automations and activity remain placeholder views without live data.
- Seven callable exports exist in the repository backend source: health, registerDevice, bootstrapFirstDevice, listDevices, approveDevice, revokeDevice, ensureUserProfile.
- The Android project is a minimal Compose shell; no fresh Android build/device test evidence was supplied.
- Existing security work includes backend-owned root profiles, atomic first-device bootstrap, transactional last-device revocation, shared device DTOs, callable emulator coverage, collection ownership rules, and project/task top-level validation. Remaining nested-list/reference/state-transition and real-environment checks are tracked separately.
- App Check initialization is optional and server-side callable enforcement has not been demonstrated.
- Repository Node baseline is Node.js 22. The latest local build ran on Node 24.19.0, so Node 22 reproducibility remains outstanding.

## 3. Decision: free-plan backend path is not selected yet

**Current decision:** stay on the current Firebase plan. Do not deploy Cloud Functions and do not upgrade to Blaze.

Cloudflare Workers is a **candidate for investigation**, not an accepted architecture yet. A plan-only architecture comparison must check:
- Firebase Authentication ID-token verification and revocation expectations;
- least-privilege backend access to Firestore, secret management, and service-account blast radius;
- whether to keep Firestore or use another data store and what migration/export/backup cost that creates;
- region, latency, quotas, cold-start/CPU limits, logs, rate limiting, abuse controls, and total cost;
- compatibility of TypeScript dependencies and callable API contracts;
- local tests, emulator/test fixtures, rollback, and production separation.

Do not place Firebase Admin credentials in the browser, commit secrets, use a broadly privileged service account, or weaken Firestore Rules to compensate for the missing backend. Do not create a Cloudflare account or provision services until the owner agrees to that route after the comparison. The current Firebase implementation remains the source baseline while the architecture decision is pending.

## 4. Work planned vs. work actually completed

| Workstream | Evidence-backed state | Remaining work |
|---|---|---|
| Phase-based planning | Roadmap, phase plan, tasks, risk register and architecture docs exist | Synchronize all status docs to this audit; keep one master index |
| Web command center | Several bounded UI slices merged and CI passed historically; local web build passed in the extracted copy | Manual review at mobile/tablet/desktop, keyboard/focus, accessibility, truthful state and owner acceptance |
| Firebase web config | Local .env.local was fixed previously and “Firebase not configured” message disappeared | Recheck only in the actual working clone and browser; never commit local env |
| Firestore region | Default DB created in Mumbai | Verify project configuration and rules without changing them; decide backend architecture before any data writes |
| Functions region | Local extracted copy was edited to asia-south1; builds pass | Reconcile changes with GitHub main; test region alignment; deployment blocked by Blaze |
| Cloud Functions deployment | Not deployed; deployment attempt blocked by Blaze | Do not retry unless plan/architecture changes with explicit approval |
| Firestore Rules deployment | Existing rules are in repository; live deployment not confirmed | Inspect/test current rules; deployment is a live access-policy change and needs separate approval |
| Device lifecycle | Backend source and emulator tests exist in repository history; live registration failed because callable endpoints were absent | Implement/test a viable no-Blaze backend plan, then run real Auth/device lifecycle end-to-end |
| App Check | Client initialization optional; enforcement not enabled/validated | Validate provider/token in a development environment before any enforcement decision |
| Assistant Core | Plan-only architecture is documented; no connected runtime | Finish UX/foundation/environment gates; later implement plan-only endpoint with no side effects |
| Workspace data | User-controlled memory, research, project CRUD, task CRUD, and read-only activity UI implemented on draft PR #23; CI passed on code revision | Manual browser acceptance; verify live Rules; add same-user project-reference validation before linking tasks to projects |
| Android | Minimal shell | Reproducible build, auth/device trust, lifecycle and device tests later |
| Production release | Not ready; no deployment authorized | Release checklist, cost/monitoring/recovery/security evidence and explicit approval |

## 5. Ordered phases and exact steps

### Phase 0 — Reconcile source of truth and evidence

1. Identify the actual Git clone and extracted ZIP; do not rename or delete either.
2. Compare local edits in apps/web/src/device.ts and backend/functions/src/index.ts with GitHub main.
3. Check latest main and open/unmerged PRs before any application-code edit.
4. Keep evidence labelled as local build, CI, emulator, live development or production.
5. Synchronize status, tasks, risks, decisions, roadmap, changelog and handoff.
6. Exit only when the canonical working copy is identified and no stale completion claim remains.

### Phase 1 — Finish web command-center acceptance (no backend activation)

1. Review the command-center overview and all existing UI slices in a browser.
2. Test sign-in persistence after refresh, sign-out, sign-in errors and retry.
3. Test device-list loading, empty, error, refresh, registration failure, and revocation confirmation/cancel.
4. Review keyboard-only navigation, skip link, quick switcher, Escape/cancel, focus return and visible focus.
5. Review narrow mobile, tablet and desktop layouts for overlap/clipping and control usability.
6. Check accessible names, live status announcements, contrast, zoom/scalable text and reduced motion.
7. Ensure unconnected assistant/workspace views are explicitly unavailable and contain no fake live data.
8. Record screenshots/manual results and owner acceptance; keep privileged execution disabled.
9. Exit only when checks have been observed, not merely when the build passes.

### Phase 2 — Foundation security and environment validation

This phase now includes the backend architecture decision required by the no-Blaze constraint, followed by security and environment validation. Cloudflare Workers is a candidate only; it is not selected.

#### 2A. Backend architecture and cost gate

1. Keep Firebase on the current plan. Do not upgrade to Blaze or retry Functions deployment.
2. Compare: (A) remain blocked on Firebase Functions; (B) Cloudflare Worker API with Firebase Auth and Firestore; (C) one other viable free-tier backend/data-store option.
3. Compare free-tier limits, billing exposure, Firebase ID-token verification/revocation, Firestore access, service-account permissions, secret storage, region/latency, quotas, rate limits, monitoring, cost, rollback and data migration.
4. Decide whether to retain Firestore or migrate data only after documenting export, backup, restore and ownership implications.
5. Select an architecture only after explicit owner approval. Until then, do not create accounts/resources, migrate data or change live policies.
6. Define API/error contracts for health, registerDevice, bootstrapFirstDevice, listDevices, approveDevice, revokeDevice and ensureUserProfile.
7. Verify identity server-side, derive UID from verified token claims, and never trust client-supplied UID or client-asserted device trust.
8. Preserve atomic bootstrap, trusted-device authorization, last-trusted-device protection, user scoping, rate limits, audit events and fail-closed behavior. Never weaken Firestore Rules to work around the deployment blocker.

#### 2B. Security and environment closure

1. Complete Firestore Rules tests for protected fields, cross-user access, nested list validation, references and invalid transitions.
2. Resolve the UserProfile/persisted-profile DTO decision and cover shared request/response/error contracts.
3. Review callable idempotency, retries, audit success/failure, sanitized errors and recovery.
4. Add local tests for invalid/expired tokens, cross-user access, malformed inputs, concurrency, retries and backend failures.
5. Run emulator/integration tests and state precisely what they prove and do not prove.
6. Validate App Check with a real development web provider/token and observe metrics before considering enforcement. Validate Android separately.
7. Run the full documented suite on Node.js 22: web typecheck/build, Functions typecheck/build, shared typecheck, Firestore Rules tests and callable tests.
8. After architecture approval, validate the real Auth/device lifecycle in a dedicated non-production environment: first-device bootstrap, second-device registration, pending state, approval, list, revocation, last-device rejection and audit verification.
9. Exit only when critical risks are closed or explicitly accepted, tests have observed results, and live development behavior is repeatable.

### Phase 3 — Assistant Core v0, plan-only

1. Define versioned assistant request/response/error schemas in the shared package.
2. Add an authenticated endpoint with server-derived UID, request limits and ownership checks.
3. Add a provider-neutral model adapter; keep model credentials server-side.
4. Validate model output with strict runtime schemas and an Awwab-owned capability allowlist.
5. Persist user-scoped plan/job state and an audit correlation ID; define duplicate-request behavior.
6. Return a validated plan only. Do not execute tools or external side effects.
7. Test unauthenticated access, cross-user access, invalid model output, unknown capabilities, timeouts, retries, idempotency, sanitized errors and audit.
8. Keep the web composer disabled until the endpoint and UI states are real and verified.
9. Exit after repeatable local/emulator tests and a small plan-quality evaluation; no automatic deployment.

### Phase 4 — Personal context and research

1. Define memory provenance, sensitivity, confidence, expiry, confirmation and user deletion controls.
2. Add permission-scoped retrieval and explicit context budgets.
3. Add source-backed research with claim/evidence mapping, citations and uncertainty.
4. Treat retrieved web pages, documents, repository content and tool output as untrusted data.
5. Test indirect prompt injection, memory poisoning, privacy, deletion and cross-user isolation.
6. Exit only when factuality, citation quality, privacy and safety evaluations meet documented thresholds.

### Phase 5 — Productivity and project intelligence

1. Define data contracts for tasks, projects, Today, reminders, goals and decisions.
2. Confirm per-collection owner/writer rules and field/state validation.
3. Connect one workflow at a time with loading, empty, error, retry and successful-data states.
4. Add repository/GitHub workflows only with explicit scopes, reviewable diffs and verified results.
5. Never claim a task or repository action succeeded without reading back evidence.
6. Exit when each shipped workflow has integration tests, failure recovery and user-visible evidence.

### Phase 6 — Tools, automation and proactivity

1. Define versioned tool contracts, scopes, risk/data classification, idempotency, timeout, retry, audit and verification metadata.
2. Bind approvals to exact action/payload, user/session and expiry; re-check authorization immediately before side effects.
3. Add durable jobs only if measured workloads require them; implement cancellation, retry budgets and a kill switch.
4. Add proactive suggestions only with relevance thresholds, quiet hours, notification budgets and dismissal controls.
5. Test partial failure, duplicate side effects, cancellation, revoked credentials and recovery.
6. Do not expose unrestricted shell/computer control or financial/security-account actions.

### Phase 7 — Android and multimodal

1. Establish a documented JDK/Gradle/SDK baseline and reproducible Android build/tests.
2. Integrate Auth and device trust using the same server-side security model as web.
3. Add approvals, notifications and quick actions only after backend parity.
4. Add voice, files and images with permissions, cancellation, retention and failure states.
5. Test on real/emulated devices; voice is an interaction channel, never sufficient authorization.
6. Exit only when each shipped capability has device-level evidence and server-side policy parity.

### Phase 8 — Release readiness (separate owner approval)

1. Separate development and production resources, IDs, secrets, OAuth and App Check settings.
2. Review least-privilege IAM, data retention/export/deletion, privacy, backup/restore and incident response.
3. Set budgets/alerts and understand quotas/charges for every provider.
4. Verify monitoring, audit, rollback and recovery drills.
5. Run the full release regression, accessibility, security and cost review.
6. Document known limitations and exact deployment targets.
7. Request explicit authorization for the specific release. No plan or passing build is deployment approval.

## 6. Definition of done for every bounded change

- Scope and acceptance criteria written before application-code edits.
- One coherent change with minimal unrelated churn.
- Automated tests appropriate to risk and observed manual tests where necessary.
- Security, authorization, privacy and failure/recovery paths reviewed.
- No false success claims or fake live data.
- Docs/status/tasks/risks/decisions updated together.
- Exact validation environment and output recorded.
- No deployment or paid resource creation without explicit approval.

## 7. Current next action

**Continue Awwab v1.0 implementation and acceptance on the existing development branch.** Current branch `opensource-reuse-strategy` contains the accumulated Phase 4 and v1.0 work beyond `main`; re-check the exact comparison before any merge. draft PR #23 targets `phase-4-memory-research-safety` (draft PR #22), which targets `main`. Do not merge either PR without explicit owner approval. Latest workspace code passed all six CI jobs in [run 41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446). Next: manual browser acceptance, verify live Firestore Rules status, resolve the no-Blaze backend architecture, then continue with safe task/project reference validation and remaining product capabilities. Assistant generation remains disabled until Awwab's own model is trained and evaluated. No production deployment, Rules deployment, billing upgrade, migration, or paid resource creation is authorized.


## Phase 0 live GitHub audit — 2026-10-28

The repository is private, writable by the connected GitHub integration, and uses `main` as its default branch. The current main head is [97d908a](https://github.com/mdanasaaq-design/Awwab/commit/97d908a3a0c8905ba7864018f8ef4d6b8a960652), the master-plan documentation commit.

### Current open PR inventory

- [PR #16 — project/task list and reference validation](https://github.com/mdanasaaq-design/Awwab/pull/16): draft, open, based on `main`; branch `fix/phase-2-nested-field-validation`; 7 changed files. Latest reported workflow on the PR head was **cancelled**, so acceptance is not complete. Its branch compares as diverged from current `main` (13 commits ahead, 49 behind in the comparison result). Do not merge until the branch is reconciled and the Rules emulator suite passes against current main.
- [PR #17 — provider-neutral plan-policy preflight](https://github.com/mdanasaaq-design/Awwab/pull/17): draft, open, based on `main`; branch `feat/assistant-core-foundation`; 8 changed files. A CI run reported success for its head, including the new agent-core tests and existing suites, but the branch compares as diverged from current `main` (12 commits ahead, 49 behind in the comparison result). This is only a planning/policy validator; it does not make the assistant runtime live. Do not merge until reviewed against the current base and Phase 2 gates are respected.
- [`fix/web-build-types`](https://github.com/mdanasaaq-design/Awwab/tree/fix/web-build-types) has two commits ahead and is 53 commits behind current main in the comparison result. Its earlier Vite declaration change is not proof that the current region edit exists there. Do not merge this stale branch wholesale.

### Confirmed current-main code state

- `apps/web/src/device.ts` currently returns `getFunctions(firebaseApp)` without the explicit `asia-south1` region.
- `backend/functions/src/index.ts` currently defines all seven callables using default-region `onCall(...)` signatures.
- Therefore the local extracted ZIP's Mumbai region edits are **not present on current main**. They are also not known to be committed in the older `fix/web-build-types` branch.
- The actual local Git clone is `C:\Users\rexy2\Awwab`, with `origin` set to `https://github.com/mdanasaaq-design/Awwab.git` and branch `main` at `3a7d914` before synchronization.
- A read-only `git fetch origin` succeeded and moved the local remote-tracking reference to `07651e30ed0b6f40e843b4fe90cb876dfdbd15d7`. Local `main` is 60 commits behind `origin/main`, 0 commits ahead; there are no tracked local edits or local-only commits.
- The local clone contains an untracked root `package-lock.json` (410,433 bytes). A byte-identical backup was verified by SHA-256 at `C:\Users\rexy2\Awwab-package-lock.local-backup-20261028.json`. The original file remains in place. Do not discard it without comparing its contents to GitHub's tracked lockfile.
- `C:\Users\rexy2\Downloads\Awwab` is an extracted project copy, not a Git repository. `Awwab-main` and `Awwab-local-backup` also showed no `.git` metadata. Keep these copies untouched until their purpose is no longer needed.
- The remaining local-only operation is a fast-forward synchronization of the actual clone, followed by verification of the resulting status and lockfile diff. This assistant cannot execute commands on the user's Windows filesystem directly; do not keep asking the user for diagnostics already completed.

### Next exact local action (only when the user is at the computer)

The lockfile backup is already verified. If local synchronization is needed, run `git -C "C:\Users\rexy2\Awwab" pull --ff-only origin main`; stop if it fails, and inspect rather than discard any post-pull `package-lock.json` difference. This operation is not a deployment and must not be coupled to Firebase changes.

**Phase 0 exit gate:** complete the fast-forward and verify the local tree, then review PR #16/#17 against current main. The repository source audit is complete; local synchronization is pending. No application-code edit, PR merge, Firebase deployment, Rules change, paid resource, or migration is authorized by this audit.


### Backend architecture research snapshot — 2026-10-28

- Added [Backend Architecture Options](BACKEND_ARCHITECTURE_OPTIONS.md), comparing staying on Spark/deferred live device management, a Cloudflare Worker API with existing Firebase Auth/Firestore, and Supabase Edge Functions/Postgres/Auth.
- **No architecture is selected.** Keep the existing Firebase project unchanged and do not upgrade billing, create accounts/resources, migrate data, or deploy alternate infrastructure without explicit owner approval.
- Cloudflare Workers Free currently lists 100,000 requests/day and 10 ms CPU per request; Supabase Free currently lists 500,000 Edge Function invocations/month and 500 MB database per project. These are vendor-published quotas, not guarantees of free operation or proof that Awwab's security requirements are met. Source links and the required security proof are in the comparison document.


## 2026-10-30 strategy correction — reuse open-source code inside Awwab

The owner clarified the intended approach: do not merely study other agent repositories; select useful source code, adapt it, and incorporate it into Awwab so the project can move faster. Earlier statements in this plan that prohibited copying all third-party code are superseded.

Awwab remains independent at the product and intelligence level:
- Awwab owns the product, UI, contracts, data boundaries, permissions, approvals, tools, audit and model weights.
- Reused code supplies bounded engineering components (workflow state, browser mechanics, parsers, memory algorithms, training optimizations, evaluation and tracing).
- No third-party pretrained weights, teacher distillation, external AI API, hosted agent runtime or silent remote fallback.
- Every copied file needs exact-commit/file licence review, attribution, dependency/security review, tests and a `THIRD_PARTY_NOTICES.md` entry.
- GPL/AGPL and unresolved-licence sources are excluded until a separate licensing decision.

The authoritative candidate matrix, what to copy, what to avoid, and phased acceptance criteria are in [Open-Source Reuse Catalogue](../docs/OPEN_SOURCE_REUSE_CATALOG.md).

### New implementation order

1. R1 — Mozilla Readability pure parser integration for Research.
2. R2 — minimal LangGraph.js-derived workflow/checkpoint primitives.
3. R3 — Mem0/Graphiti-derived memory merge, conflict and temporal provenance improvements.
4. R4 — local read-only Playwright browser adapter, with explicit sandbox and domain/action allowlists.
5. R5 — LitGPT/nanoGPT-derived training optimizations with random initialization only.
6. R6 — local document parsing adapted from selected MarkItDown code.
7. R7 — Promptfoo-derived evaluation fixtures and minimal OpenTelemetry.

The first code task is R1 source inspection and bounded parser integration. This does not authorize a crawler, CORS bypass, private-network fetching, external service, dependency sprawl or production deployment.

### Latest verification snapshot

On 2026-10-30, GitHub Actions run [40872007847](https://github.com/mdanasaaq-design/Awwab/actions/runs/40872007847) passed all six jobs on `d81779e9996c69b88e6c140ea473eb4b603c4a17`. PR #22 remains open/draft. This new documentation branch is separate; no merge/deploy has occurred.


## A5 v1.0 implementation snapshot — 2026-10-30

### Implemented on the draft development branch
- Sign-in and command-center shell, device-management UI, user-controlled Firestore memory, Wikipedia/Crossref research, and Mozilla Readability article extraction.
- Project create/edit/archive/restore/delete workflows.
- Task create/edit/status/filter/delete workflows with priority and due date.
- Read-only activity register showing up to 100 backend-recorded events.
- Strict provider plan-response validation and the independent Model Lab scaffold.

### Automated evidence
- GitHub Actions [run 41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446) passed all six jobs on code commit `4782136a6eb487b57effb28fae866fa6288a9293`, including web typecheck/build, Functions/shared typecheck/build, Firestore Rules emulator tests, callable emulator tests, assistant runtime/parser tests, and Model Lab standard-library/provenance tests.
- Later changes after that code commit were documentation-only. Browser and live Firebase acceptance are not covered by CI.

### Still blocks a real v1.0 release
- Awwab's own model has not been trained from random initialization or evaluated for useful conversational capability; generation is disabled.
- Cloud Functions are not deployed under the current Firebase plan. Device lifecycle and activity logging are therefore not proven live. Do not upgrade billing or deploy without separate approval.
- Verify the live Firestore Rules before relying on project/task/memory writes. Emulator success is not proof that live Rules match the repository.
- Automations are not implemented. Task-to-project linking remains disabled until the owner-scoped reference Rules change is reviewed, merged, and explicitly deployed; branch implementation and emulator regressions are present, but current CI is pending.
- Manual browser acceptance, accessibility review, mobile review, Android build/device acceptance, and release/rollback checks remain outstanding.

### Owner constraints
- Preserve Firebase Auth and Firestore unless an alternate backend is explicitly approved.
- Keep the $0 budget; no paid APIs, third-party pretrained weights, model downloads, or cloud resources.
- Keep Awwab independent. Reuse code only with pinned upstream commits, licences, attribution, and tests.
- No merge, production Hosting deployment, Firestore Rules deployment, Functions deployment, migration, or billing change without explicit approval.


### Task/project reference security slice — 2026-10-30

- Added same-user project existence validation to task create/update Rules; null or omitted references remain allowed.
- Added emulator cases for valid same-owner, null, missing, cross-user, and update-path references.
- Rules commit: `156a2391d53b046db7f030d7018a26afa2b179ed`; test commit: `6284409d460d861e0bad5f1148284819e4b957ea`.
- CI run [41069341725](https://github.com/mdanasaaq-design/Awwab/actions/runs/41069341725) is pending. This change is not validated until the complete workflow passes.
- Keep task/project linking disabled until the Rules change is reviewed, merged and explicitly deployed. No deployment or merge was performed.


### Task/project Rules follow-up — CI correction (2026-10-30)

The first full run [41069341725](https://github.com/mdanasaaq-design/Awwab/actions/runs/41069341725) caught a missing UID argument on the task update path (`validTask` expected two arguments). The create path passed; update did not. Corrected update to pass `uid` in commit `3b5405e147ca64ff9f5af1951a9154bceed2efa1`. Do not mark this security slice validated until a fresh full CI run passes on the corrected PR head. No deployment or merge.


### Workspace Security and Data Integrity phase — 2026-10-30

- Deny hard deletion of projects in Firestore Rules and remove project delete from the UI; archive/restore preserves references.
- Enforce task completion timestamp consistency and server-time completion transitions.
- Add emulator regressions for denied project deletion and completion lifecycle.
- Commits: Rules `52721d3`, tests `85d7430`, UI `44944a4`.
- CI for the preceding head `2278f744` passed all six jobs in [41069754336](https://github.com/mdanasaaq-design/Awwab/actions/runs/41069754336); the current phase commits require a new complete CI run before closure.
- Preserve no-merge/no-deploy boundary. Do not enable project linking until matching Rules are reviewed, merged and explicitly deployed.
