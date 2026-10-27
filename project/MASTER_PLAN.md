# Awwab Master Plan and Work Audit

**Reviewed:** 2026-10-27  
**Repository:** [mdanasaaq-design/Awwab](https://github.com/mdanasaaq-design/Awwab)  
**Planning status:** Audit and sequencing only; no application code or deployment is authorized by this document.  
**Canonical trackers:** [Current status](CURRENT_STATUS.md) · [Phase plan](PHASE_PLAN.md) · [Tasks](TASKS.md) · [Risks](ISSUES_AND_RISKS.md) · [Decisions](DECISIONS.md)

## 1. Owner direction and non-negotiables

1. Build Awwab as a standalone personal assistant; external agent projects are research references only.
2. Refine the web command center first, then harden the foundation, then connect assistant capabilities behind tested gates.
3. Use a command-center visual direction: information-dense, powerful, keyboard-friendly, calm and deliberate; avoid generic “vibe-coded” UI.
4. Plan bounded work and acceptance criteria before implementation. Audit what was planned, what actually changed, and what evidence exists.
5. Keep the current Firebase project on its existing plan. Do not upgrade to Blaze, add billing commitments, or start paid services without explicit owner approval.
6. No production Hosting deployment, Firestore Rules deployment, Cloud Functions deployment, data migration, or live security-policy change without explicit authorization.
7. Never claim success based only on a build; distinguish implemented, locally validated, CI validated, live validated, blocked, and not tested.
8. Do not copy third-party code or install an agent framework as a side effect of research.

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
| Workspace data | Placeholder UI | Connect only after data ownership and backend path are verified |
| Android | Minimal shell | Reproducible build, auth/device trust, lifecycle and device tests later |
| Production release | Not ready; no deployment authorized | Release checklist, cost/monitoring/recovery/security evidence and explicit approval |

## 5. Ordered phases and exact steps

### Phase 0 — Reconcile source of truth and evidence

1. Identify the actual Git clone and the extracted ZIP; do not rename/delete either.
2. Compare local changes in apps/web/src/device.ts and backend/functions/src/index.ts with GitHub main.
3. Fetch latest main; check open/unmerged PRs and branches before editing.
4. Update all Markdown status, decisions, risks, tasks, roadmap and handoff to one baseline.
5. Preserve evidence labels: local build, CI, emulator, live development, production.
6. Exit only when the canonical repository and the local working copy are clearly identified and the plan contains no stale “done” claims.

### Phase 1 — Finish web command-center acceptance (no backend activation)

1. Review the command-center overview and all existing UI slices in a browser.
2. Test sign-in persistence after refresh, sign-out, sign-in errors and retry.
3. Test device list loading, empty, error, refresh, registration failure and revocation confirmation/cancel.
4. Review keyboard-only navigation, skip link, quick switcher, escape/cancel, focus return and visible focus.
5. Review narrow mobile, tablet and desktop layouts; verify cards don't overlap and controls remain usable.
6. Check accessible names, live status announcements, contrast, zoom/scalable text and reduced motion.
7. Ensure all unconnected assistant/workspace views are explicitly unavailable and have no fake live data.
8. Record screenshots/manual results and owner acceptance; keep privileged execution disabled.
9. Exit when the checklist is observed, not merely when the build passes.

### Phase 2 — Choose and validate the no-Blaze backend architecture

1. Freeze live deployment attempts and keep Firebase on its current plan.
2. Write an architecture decision comparison for: (A) remain blocked on Firebase Functions; (B) Cloudflare Worker API with Firebase Auth + Firestore; (C) a different free-tier backend/data-store option.
3. Compare free-tier limits, billing exposure, token verification, Firestore IAM/service-account access, secrets, region, rate limits, observability and rollback.
4. Select one option only after risks and owner approval. Until then, no account creation or cloud resource provisioning.
5. Define the HTTP/callable compatibility contract for all seven existing functions and error mapping.
6. Define authentication: verify Firebase ID tokens server-side, derive UID from verified claims, validate App Check strategy separately, and never trust client-supplied UID/device trust.
7. Define authorization: preserve bootstrap atomicity, trusted-device requirements, last-device revocation invariant, user scoping, rate limiting and append-only audit.
8. Define Firestore access and least-privilege credentials; do not weaken client Rules.
9. Create local unit tests with mocked auth/database boundaries, including invalid/expired tokens, cross-user access, malformed inputs, retries, races, and backend failures.
10. Run a local/emulator integration suite and document exactly what it proves and does not prove.
11. Deploy to a dedicated non-production environment only after explicit approval and architecture decision.
12. Run live Auth, first-device bootstrap, second-device registration, pending state, approve, list, revoke, final-device rejection, and audit verification.
13. Exit only when the live test is repeatable, security invariants hold, and costs/limits are understood.

### Phase 3 — Foundation closure

1. Complete Firestore Rules tests for protected fields, cross-user access, nested list validation, references, and invalid transitions.
2. Complete UserProfile/persisted profile DTO decision and shared contract coverage.
3. Review callable idempotency, retries, audit success/failure, sanitized errors and recovery.
4. Validate App Check with real development web provider/token metrics; decide enforcement separately.
5. Re-run full checks on Node 22: web typecheck/build, Functions typecheck/build, shared typecheck, Firestore Rules tests, callable tests.
6. Record environment, commands, results and unresolved risks.
7. Exit only when P0 risks are closed or explicitly accepted and the development Auth/device lifecycle works.

### Phase 4 — Assistant Core v0, plan-only

1. Define versioned request/response/error schemas in the shared package.
2. Add an authenticated endpoint with server-derived UID and request limits.
3. Add a provider-neutral model adapter with server-side secrets.
4. Validate model output against strict runtime schemas and an Awwab-owned capability allowlist.
5. Persist user-scoped plans/jobs and audit correlation; make duplicate request behavior explicit.
6. Return a plan only. No tools, shell, browser control or external side effects.
7. Add tests for unauthenticated access, cross-user access, invalid model output, unknown capabilities, timeout, retry, idempotency, sanitized failures and audit.
8. Keep the web composer disabled until endpoint and UI states are real and verified.
9. Exit after local/emulator tests and a small repeatable plan-quality evaluation; do not deploy automatically.

### Phase 5 — Real productivity workflows

1. Define data contracts for tasks, projects, Today, reminders, goals and decisions.
2. Confirm per-collection owner/writer rules and field/state validation.
3. Connect one workflow at a time; implement loading/empty/error/retry/success states.
4. Add repository/GitHub integrations only with explicit scopes, reviewable diffs, and verified results.
5. Never claim a task or repository action succeeded without reading back evidence.
6. Exit when each shipped workflow has integration tests and recovery behavior.

### Phase 6 — Memory and research

1. Define memory provenance, sensitivity, confidence, expiry, confirmation and user deletion controls.
2. Add permission-scoped retrieval and context budgets.
3. Add source-backed research with claim/evidence mapping, citations and uncertainty.
4. Isolate retrieved content as untrusted data; test indirect prompt injection and memory poisoning.
5. Evaluate privacy, factuality, citations, deletion and cross-user isolation before release.

### Phase 7 — Tools and automation

1. Define versioned tool contracts, scopes, risk/data classification, idempotency, timeout, retries, audit and verification.
2. Add approval bound to exact action/payload, user/session and expiry.
3. Add bounded jobs only if workload requires them; implement cancellation, retry budgets and kill switch.
4. Add proactive suggestions only with relevance thresholds, quiet hours, budgets and dismissal controls.
5. Test partial failure, duplicate side effects, cancellation, revoked credentials and recovery.
6. No unrestricted shell, computer control or financial/security-account actions.

### Phase 8 — Android and multimodal

1. Establish documented JDK/Gradle/SDK baseline and reproducible Android build/tests.
2. Integrate Firebase Auth and the same server-side device trust/security model.
3. Add approvals, notifications and quick actions only after backend parity.
4. Add voice/files/images with permissions, cancellation, retention and failure states.
5. Test on real/emulated devices and do not treat voice as authorization.

### Phase 9 — Release readiness (separate owner approval)

1. Separate development and production resources, IDs, secrets and OAuth/App Check settings.
2. Review least-privilege IAM, data retention/export/deletion, privacy, backup/restore and incident response.
3. Set budgets/alerts and understand actual quotas/charges for every provider.
4. Verify monitoring, audit, rollback and recovery drills.
5. Run the full release regression, accessibility, security and cost review.
6. Document known limitations and exact deployment targets.
7. Ask for explicit authorization for the specific release. No plan or passing build is deployment approval.

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

**Documentation and source reconciliation only.** Finish synchronizing Markdown, then inspect the actual Git clone versus the ZIP-edited copy. The next application-code change is not authorized until the architecture comparison and Phase 1 acceptance plan are reviewed. The immediate backend deployment is blocked by the current Firebase plan and must not be retried as a workaround.
