# Current Status

**Last reviewed:** 2026-10-27  
**Repository:** `mdanasaaq-design/Awwab`  
**Reviewed baseline:** `876b747fd02c210a19bddd565d015d7800f5ec68` — `main` before the repository-organization pass  
**Current planning focus:** Web command-center UX first, then foundation hardening  
**Hosting evidence:** Live Hosting's last listed release is 2026-10-16; temporary preview `awwab-check` was deployed on 2026-10-27 and expires 2026-11-03. The preview UI result is awaiting manual confirmation.

## Executive state

Awwab has a documented product/architecture blueprint, a web command-center shell, a Firebase-backed authentication/device-management foundation, Firestore Rules tests, CI, and a minimal native Android shell.

Awwab is **not yet a complete or production-ready personal AI assistant**. The current web UI explicitly states that the assistant runtime is not connected and keeps the composer disabled. Projects, tasks, research, automations, and activity are placeholder views rather than live workflows.

The blueprint describes the intended product. It must not be mistaken for implemented capability.

## Current implementation

### Web
- React + TypeScript + Vite workspace.
- Email/password Firebase sign-in UI and Firebase client initialization.
- Optional web App Check initialization when a site key is configured.
- Command-center navigation and responsive styling baseline.
- Device registration, first-device bootstrap, device listing, approval, revocation, and profile initialization callables wired from the web client.
- Assistant composer is intentionally disabled; no assistant runtime is connected.
- Projects, tasks, research, automations, and activity views have no live data connection.
- Settings includes trusted-device management UI.

### Backend and data
- Firebase Cloud Functions 2nd gen with Node.js 22 baseline.
- Firestore user-scoped hierarchy and default-deny fallback Rules.
- Backend callable functions for health, device lifecycle, profile initialization, and security activity logging.
- Firestore Rules test harness and tests.
- Shared TypeScript contracts exist, but the contracts and callable DTOs need alignment.
- Assistant request pipeline, model provider/router, tool registry/policy, approval/execution/verification pipeline, and durable job system are not implemented.

### Android
- Native Kotlin + Jetpack Compose shell exists.
- Current main activity is a minimal placeholder screen; assistant, Auth/device trust, notifications, approvals, and shared assistant workflows are not established as working.
- Android build and device-level validation have not been verified in this audit.

## Validation evidence

| Check | Evidence | State |
|---|---|---|
| Web TypeScript + production bundle | Local `npm run web:build` on 2026-10-27; `tsc -b && vite build` completed successfully | **Passed locally** |
| Firebase client config in generated bundle | All six required values from local `apps/web/.env.local` were found in generated JS assets on 2026-10-27; values were not printed | **Passed locally** |
| Firebase Hosting preview upload | `firebase hosting:channel:deploy awwab-check --expires 7d` completed on 2026-10-27; four files released to preview version `d0cc38145cf9844d` | **Deploy passed; browser behavior pending** |
| Web typecheck/build CI | PR #3 checks passed before merge on 2026-10-16 | **Passed in CI** |
| Functions typecheck/build CI | PR #3 checks passed before merge on 2026-10-16 | **Passed in CI** |
| Shared contract typecheck CI | PR #3 checks passed before merge on 2026-10-16 | **Passed in CI** |
| Firestore Rules test CI | PR #3 checks passed before merge on 2026-10-16 | **Passed in CI** |
| Local Firestore emulator Rules tests | No separate local result recorded in this status | **Not verified locally** |
| Backend callable tests | Expanded auth/input/state callable emulator suite passed in CI run [39117914336](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117914336); real development-project/device lifecycle remains outstanding | **Partially validated** |
| Real Firebase Auth/device lifecycle | No end-to-end result recorded | **Outstanding** |
| Dedicated development Firebase setup | Not verified end-to-end | **Outstanding** |
| App Check enforcement | Web client initialization is optional; callable declarations do not enable `enforceAppCheck`; no live provider/token check recorded | **Not enabled / not validated** |
| Android build/integration tests | No observed result recorded | **Outstanding** |
| Production deploy/restore/monitoring | No deployment performed; release gates not complete | **Not started** |

**Runtime note:** The local workstation reported Node.js 24.19.0, while the repository and CI specify Node.js 22. The local web build passed on Node 24, but future full validation should use Node 22 for reproducibility.

## Highest-priority risks

1. **Profile write boundary:** owner Rules allow broad create/update access to the profile document without field restrictions.
2. **First-device bootstrap concurrency:** device existence is checked separately from trusted-device creation.
3. **Last trusted device concurrency:** trusted-device count is checked separately from revocation.
4. **Shared DTO drift:** shared contracts, web callable types, and backend response shapes are not fully aligned.
5. **Backend test gap:** callable authorization/state-transition/failure tests are not established.
6. **Data model / Rules ambiguity:** jobs and connections appear in the data model but do not have explicit client Rules matches; default deny applies.
7. **Project/task data integrity:** PR #14 enforces top-level project/task schemas and timestamp/source integrity; list element validation, cross-document references, and detailed state-transition policy remain open.
8. **Environment separation:** development Firebase and production readiness still need explicit validation.

The detailed register and acceptance criteria are in [Issues and Risks](ISSUES_AND_RISKS.md).

## Active implementation work

- Phase 1 command-center UX slices were merged in [PR #5](https://github.com/mdanasaaq-design/Awwab/pull/5), [PR #6](https://github.com/mdanasaaq-design/Awwab/pull/6), and [PR #7](https://github.com/mdanasaaq-design/Awwab/pull/7). Automated CI passed; browser/manual interaction, responsive, and owner UX acceptance checks remain outstanding.
- Phase 2A profile-write hardening was merged in [PR #8](https://github.com/mdanasaaq-design/Awwab/pull/8); CI run [39116859040](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116859040) passed.
- Phase 2B atomic bootstrap was merged in [PR #9](https://github.com/mdanasaaq-design/Awwab/pull/9); CI run [39117195997](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117195997) passed all four jobs.
- Phase 2C transactional last-device revocation was merged in [PR #10](https://github.com/mdanasaaq-design/Awwab/pull/10); CI run [39117401427](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117401427) passed all four jobs.
- Phase 2D device callable DTO alignment was merged in [PR #11](https://github.com/mdanasaaq-design/Awwab/pull/11); the planned `UserProfile` interface remains a separate domain/schema gap.
- Phase 2E callable authorization and state-transition coverage was merged in [PR #12](https://github.com/mdanasaaq-design/Awwab/pull/12); CI run [39117914336](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117914336) passed all four jobs.
- Phase 2F collection ownership and narrow client mutation rules were merged in [PR #13](https://github.com/mdanasaaq-design/Awwab/pull/13); CI run [39118165874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39118165874) passed all four jobs.
- Phase 2G project/task field-level Rules were merged in [PR #14](https://github.com/mdanasaaq-design/Awwab/pull/14); CI run [39118461462](https://github.com/mdanasaaq-design/Awwab/actions/runs/39118461462) passed all four jobs. Nested list-element validation, cross-document consistency, and detailed status-transition policy remain open.
- Phase 2H App Check/environment readiness audit is in progress on branch `docs/phase-2-app-check-audit`. Acceptance criteria and current configuration findings are in [PHASE_2H_APPCHECK_ENVIRONMENT.md](PHASE_2H_APPCHECK_ENVIRONMENT.md). This slice is documentation-only; no enforcement or deployment change is being made.
- Phase 1F trusted-device successful-empty state copy/accessibility adjustment was merged in [PR #19](https://github.com/mdanasaaq-design/Awwab/pull/19); all four CI jobs passed in [run 39126668502](https://github.com/mdanasaaq-design/Awwab/actions/runs/39126668502). Manual browser review remains pending.
- Phase 1G browser document title/page context was merged in [PR #20](https://github.com/mdanasaaq-design/Awwab/pull/20); all four CI jobs passed in [run 39126859097](https://github.com/mdanasaaq-design/Awwab/actions/runs/39126859097). Manual browser review remains pending; acceptance criteria: [PHASE_1G_PAGE_CONTEXT.md](PHASE_1G_PAGE_CONTEXT.md).
- Phase 1H command-center operational overview was implemented directly on `main` across `apps/web/src/App.tsx` and `apps/web/src/styles.css`; acceptance criteria are in [PHASE_1H_COMMAND_CENTER_OVERVIEW.md](PHASE_1H_COMMAND_CENTER_OVERVIEW.md). Build and browser/manual validation remain pending; no deployment was performed.
- No Firebase deployment has been performed.

## Next phases

1. **Phase 0 — Planning/evidence baseline:** keep status, tasks, risks, and roadmap aligned.
2. **Phase 1 — Web command-center UX:** first product implementation phase. Improve information hierarchy, keyboard workflows, responsive layout, accessibility, and truthful capability states. Do not connect privileged actions in this phase.
3. **Phase 2 — Foundation hardening:** resolve the security/contract risks above, add backend callable tests, and validate the emulator/development environment.
4. **Phase 3 — Assistant Core v0:** introduce a narrow authenticated request pipeline with policy, approval, execution, verification, and audit.
5. Continue with memory/research, productivity/project intelligence, controlled tools/automation, Android/multimodal, and release readiness only after prior gates pass.

See [Phase Plan](PHASE_PLAN.md), [Tasks](TASKS.md), and [Roadmap](../docs/roadmap.md).

## Local workspace note

The user's Windows workstation has a Git-connected clone nested inside a separate extracted project copy. The outer copy is not a Git repository and sampled root files differ from the clone. A separate local backup contains the prior untracked Firebase configuration and lockfile. Keep the Git clone as the working source and preserve the outer copy and backup until local housekeeping is handled as a separate, explicitly verified task. No local folder deletion or rename is authorized by this status update.

## Operating rules

- Work directly on GitHub `main` for bounded, low-risk changes by default; batch related edits into coherent commits.
- Use a branch/PR only when parallel work, a risky or broad change, or a meaningful review boundary makes it necessary—not for every file or minor fix.
- Write acceptance criteria before editing application code and update project tracking alongside the change.
- Validate proportionately; CI is evidence when available, not a mandatory ceremony for every documentation or low-risk change. Never claim unobserved build/browser success.
- Do not commit local secrets or `.env.local`.
- Do not deploy until Phase 8 and explicit owner authorization.


## Agent-runtime research update — 2026-10-18

**State:** Research documented; no runtime implementation has been made by this research update.

The open-source review identified useful patterns in Mastra, LangGraph.js, OpenClaw, Dodaios, Khoj, OpenAgent and MCP. Awwab's decision is to remain standalone: these projects are references for architecture and threat modeling, not code/runtime integrations. No agent framework has been selected and no new dependency has been added.

### Recommended next bounded change

Implement an Awwab-owned **plan-only Assistant Core v0** behind the existing Node.js 22/Firebase backend. It should authenticate and validate a request, use a provider-neutral model adapter to produce a schema-validated plan, validate proposed capabilities against an Awwab-owned allowlist, persist user-scoped plan/job state, and record an audit event. It must not execute tools or external side effects.

### Entry gates and evidence still required

- Re-read current main and the latest security/contract status before coding.
- Resolve or explicitly gate any remaining P0 security and backend validation issues in project/ISSUES_AND_RISKS.md.
- Confirm shared contract shape and callable error conventions.
- Write acceptance criteria and tests before application-code edits.
- Validate with Node.js 22 and the Firebase Emulator Suite; record actual results rather than inferred success.
- Keep the composer disabled and do not deploy as part of this increment.

See [Agent Runtime Research](../docs/agent-runtime-research.md), [Architecture Decisions](DECISIONS.md), and [New Chat Handoff](NEW_CHAT_HANDOFF.md).


## Live project update — 2026-10-27 (observed)

- Firebase project awwab-5d95f is accessible.
- Default Firestore Native database exists in asia-south1 (Mumbai), STANDARD edition. It was created with deletion protection enabled.
- firebase functions:list --project awwab-5d95f returned No functions found.
- firebase deploy --only functions --project awwab-5d95f was blocked before deployment because Blaze is required to enable Artifact Registry/complete Functions deployment. No function or Hosting deployment occurred in that attempt.
- In the user's extracted Windows ZIP copy, npm run functions:typecheck, npm run functions:build, and npm run web:build passed on 2026-10-27. The local copy is not a Git clone; these local edits/results must not be assumed to exist on GitHub main.
- Local code was edited to use asia-south1 for frontend callable calls and all seven backend callables. Reconcile with GitHub before any sync or deploy.
- Owner selected **stay on current Firebase plan**. Cloudflare Workers is only a candidate for a documented architecture comparison; no migration or Cloudflare resource creation is approved.
- Production Hosting, Firestore Rules and Functions deployment remain unauthorized. The live device-management lifecycle remains unverified and is expected to fail while callable functions are absent.

See [Master Plan](MASTER_PLAN.md) for the full planned-vs-done audit and exact next steps.


## GitHub source reconciliation update — 2026-10-28

- Current GitHub `main` head: [97d908a](https://github.com/mdanasaaq-design/Awwab/commit/97d908a3a0c8905ba7864018f8ef4d6b8a960652).
- PR #16 (`fix/phase-2-nested-field-validation`) remains draft/open. Its latest reported CI run was cancelled; its branch diverges from current main. Rules emulator acceptance remains pending.
- PR #17 (`feat/assistant-core-foundation`) remains draft/open. A CI run reported success, but its branch diverges from current main. It contains a plan-policy validator only, not a connected assistant runtime.
- Current main's frontend Functions client does not specify `asia-south1`; backend callable declarations also use default region. The local ZIP's region edits have not been reconciled to GitHub.
- The old `fix/web-build-types` branch is stale relative to current main and must not be merged wholesale.
- The local clone was inspected on 2026-10-28; see the source-reconciliation update below. Fast-forward synchronization remains pending.

## Source reconciliation update — 2026-10-28

- Application-code baseline reviewed: `07651e30ed0b6f40e843b4fe90cb876dfdbd15d7` (`docs: record Phase 0 GitHub source audit`). Documentation-only reconciliation commits followed; the local sync remains pending.
- The actual Windows clone is `C:\Users\rexy2\Awwab`, remote `origin` is the canonical Awwab repository, and local `main` was at `3a7d914` before sync. After `git fetch origin`, local `main` was 60 commits behind and 0 commits ahead of `origin/main`; no tracked working-tree edits or local-only commits were reported.
- An untracked local `package-lock.json` (410,433 bytes) remains in the clone. Its backup at `C:\Users\rexy2\Awwab-package-lock.local-backup-20261028.json` was verified byte-identical using SHA-256. Preserve both until the local file is compared with the tracked GitHub version.
- `C:\Users\rexy2\Downloads\Awwab` is an extracted non-Git copy; no `.git` metadata was found there. Do not treat it as the canonical working clone.
- **Pending:** fast-forward local `main`, inspect any lockfile difference without discarding it, then continue the Phase 1 manual browser acceptance gate. No deployment or billing changes are authorized.

## Phase 1 execution update — 2026-10-28

- Source review identified inaccurate failure attribution: the signed-in initialization chain treated a profile-initialization error as a device-registration failure.
- Implemented a bounded fix in `apps/web/src/App.tsx` at commit `dbed29520c01e2027c6dd7f3953d6a3f632050cb`. Registration outcome is now recorded separately; profile initialization errors remain visible without overwriting the device status. Registration/module failures still show the registration-failed state.
- The change does not alter Firebase configuration, backend behavior, Rules, dependencies, or deployment settings.
- **Validation:** the GitHub connector has not yet surfaced a CI run or check result for this commit. Do not mark build/typecheck as passed until the actual run is observed. Manual browser validation remains pending.


## Verification correction — 2026-10-28

- The older source-reconciliation entry above records the baseline before the Phase 1 code change and is retained as history; its stated baseline head is not the current main head.
- The device/profile setup error-attribution fix is in `apps/web/src/App.tsx` at commit `dbed29520c01e2027c6dd7f3953d6a3f632050cb`.
- GitHub Actions run [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657), triggered by the subsequent documentation commit on `main`, passed all four jobs: Web typecheck/build, Functions/shared typecheck/build, Firestore Rules tests, and backend callable emulator tests. The run includes the code fix.
- Manual browser verification remains pending. Local fast-forward synchronization and lockfile comparison remain pending; no deployment or Firebase billing change is authorized.


## Keyboard accessibility follow-up — 2026-10-28

- Added native `select` and `textarea` to the existing global `:focus-visible` outline in [commit 4aea511](https://github.com/mdanasaaq-design/Awwab/commit/4aea511b03fd24b8dc57148d216a817530238384). This closes a small source-level keyboard affordance gap without changing layout or behavior.
- CI for this new commit and manual browser confirmation are pending. The previous successful run validates the earlier setup-error fix, not this newer CSS commit.
- No production deploy, Firebase configuration/Rules change, dependency change, or billing action was performed.


## Keyboard accessibility verification correction — 2026-10-28

- GitHub Actions run [40685073409](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685073409) passed all four jobs: Web typecheck/build, Functions/shared typecheck, Firestore security rules tests, and backend callable emulator tests. The run was triggered by the subsequent documentation commit and includes the 4aea511 keyboard-focus CSS change.
- Manual browser review is still pending. Source review confirms the CSS selector now includes select:focus-visible and textarea:focus-visible; it does not prove the rendered appearance in a browser.
- Device-management live integration remains blocked by the existing architecture decision: the repository's callable functions are not deployed, and the current Firebase plan does not permit that deployment. No retry or billing upgrade was made.


## Backend architecture research — 2026-10-28

- Created [project/BACKEND_ARCHITECTURE_OPTIONS.md](BACKEND_ARCHITECTURE_OPTIONS.md) with a sourced comparison of staying on Firebase Spark, a Cloudflare Worker API with Firebase Auth/Firestore, and Supabase Edge Functions/Postgres/Auth.
- Current safe state remains unchanged: no Cloud Functions deployment, no Blaze upgrade, no alternate provider account/resource, no migration, and no Rules change. No architecture decision has been made on the owner's behalf.
- The key unresolved requirement is not merely a free endpoint: any replacement must verify Firebase identity server-side, preserve user scoping and server-owned device records, and prove atomic bootstrap and last-trusted-device protection before live use.


## Device authorization transaction hardening — 2026-10-28

- Hardened `approveDevice` and `revokeDevice` so caller-device trust is read within the same Firestore transaction as the protected mutation. Approval audit activity is written atomically with the approval.
- Added a callable emulator regression test proving a revoked device cannot subsequently approve or revoke another device.
- Verification passed on commit `317e742b368d3f37e0948270978c50096e858974`: [GitHub Actions run 40685807443](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685807443). All four jobs passed: web typecheck/build, Functions/shared typecheck, Firestore Rules tests, and backend callable emulator tests. The new revoked-caller test passed; 4 callable test groups passed overall.
- This is emulator/CI verification, not live Firebase verification. Production remains unchanged; no deploy, billing change, Rules change, or backend provisioning was performed.


## Device security verification update — 2026-10-28

- Phase 2C last-trusted-device revocation is verified in CI, not pending: [run 40685807443](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685807443) passed all four jobs on code/test commit `317e742b368d3f37e0948270978c50096e858974`.
- Callable emulator coverage verifies concurrent revocations permit exactly one state transition, preserve one trusted device, reject sequential revocation of the final trusted device, allow idempotent repeats, and allow pending-device revocation. The revoked-caller authorization regression test also passes. The callable suite reported 4 passing test groups.
- Device approval/revocation caller trust checks are performed inside the mutation transaction; approval audit activity is atomic with approval. Details: [Phase 2C acceptance record](PHASE_2C_LAST_DEVICE_REVOCATION.md) and [authorization risk resolution](ISSUES_AND_RISKS.md).
- Evidence is from CI emulators only. Live Firebase Auth/device lifecycle and manual browser acceptance remain outstanding. No deployment, billing upgrade, Rules change, or backend provisioning occurred.


## Device audit outcome test — 2026-10-28

- Added a callable emulator test in [commit 5768d085](https://github.com/mdanasaaq-design/Awwab/commit/5768d085f5e1ec6111242348e1ee1c844f942496) to verify that bootstrap, registration, approval, and revocation write the expected successful audit events and that failed security transitions are not falsely represented as successful activity.
- The first test run exposed an incorrect test setup: the test attempted to revoke a device while two trusted devices still existed, which is valid behavior. Corrected the sequence to revoke one trusted device first, then assert that the remaining final trusted device cannot be revoked. Correction: [commit 2a0280ee](https://github.com/mdanasaaq-design/Awwab/commit/2a0280ee9993e3852c56ed1d07d7f1d979c1cc55).
- The corrected callable emulator test passed in CI run [40691341042](https://github.com/mdanasaaq-design/Awwab/actions/runs/40691341042); all four jobs passed: web typecheck/build, Functions/shared typecheck/build, Firestore Rules tests, and backend callable emulator tests.
- This test validates emulator audit behavior only. It does not add failed-attempt audit events and does not validate live Firebase, deployed Functions, or the browser. No deployment, billing change, Rules change, or resource provisioning was performed.


## Nested project/task Rules validation investigation — 2026-10-28

- Recorded Phase 2I acceptance criteria in [project/PHASE_2I_NESTED_FIELD_VALIDATION.md](PHASE_2I_NESTED_FIELD_VALIDATION.md) before attempting implementation.
- A direct port of PR #16's bounded list validation and task project-reference checks failed the Rules emulator suite: valid project writes produced evaluation errors. A static-index adjustment did not resolve it.
- Reverted the unverified Rules and test edits to the previous baseline in [commit ee12ffd](https://github.com/mdanasaaq-design/Awwab/commit/ee12ffdece44765e0a7e85c57e65e139dd37a0a7) and [commit 4c88064](https://github.com/mdanasaaq-design/Awwab/commit/4c88064260251b6fbea2c1d9eeefa65effa6afbc). The Phase 2I implementation remains blocked and unchecked; investigate in a controlled branch before retrying.
- The restored baseline passed all four CI jobs in [run 40692497914](https://github.com/mdanasaaq-design/Awwab/actions/runs/40692497914), including Firestore Rules emulator tests. Phase 2I remains blocked pending a reproducible fix. No live Firestore Rules deployment occurred.


## Phase 1H source acceptance audit — 2026-10-28

- Reviewed the current `main` implementation of the command-center overview in `apps/web/src/App.tsx` and `apps/web/src/styles.css`.
- The three status cards are present; Assistant Core and workspace data are explicitly marked not connected; device-trust status is derived from `deviceStatus` and uses distinct trusted/attention/pending styles. The assistant composer remains disabled.
- The overview switches to a single-column layout at the narrow-mobile breakpoint. This is source inspection, not proof of rendered readability or no overflow.
- Updated [Phase 1H acceptance record](PHASE_1H_COMMAND_CENTER_OVERVIEW.md) and [Tasks](TASKS.md) to distinguish source-verified criteria from outstanding visual/manual acceptance.
- Automated CI evidence for the relevant frontend baseline and keyboard-focus CSS is recorded in runs [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) and [40685073409](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685073409). Browser review across desktop and narrow mobile, keyboard interaction, focus appearance, and screen-reader behavior remain outstanding.
- No application code, backend, Firebase Rules/configuration, dependency, secret, or deployment setting changed in this audit. No deployment was performed.


## Open-source reuse strategy update — 2026-10-30

**Current planning branch:** `opensource-reuse-strategy`, based on `d81779e9996c69b88e6c140ea473eb4b603c4a17`.

The owner clarified that useful public GitHub source code should be copied/adapted and integrated into Awwab itself. Previous reference-only/no-copy wording is superseded. This is code reuse, not dependence on another AI model or hosted agent.

- Detailed catalogue: [OPEN_SOURCE_REUSE_CATALOG.md](../docs/OPEN_SOURCE_REUSE_CATALOG.md).
- First planned code task: inspect and vendor/adapt Mozilla Readability's pure article parser (Apache-2.0), with attribution and tests.
- Subsequent candidates: LangGraph.js workflow primitives, Mem0 memory algorithms, Playwright browser engine, Promptfoo evaluation patterns, and LitGPT/nanoGPT training optimizations.
- Firecrawl (AGPL-3.0), Piper (GPL-3.0), Whisper pretrained weights, and repositories with unresolved licences are not approved for copying/use.
- No third-party pretrained model weights, external AI API, hosted agent, teacher distillation or remote fallback is allowed.
- No source code has been copied by this documentation update. The next implementation phase must pin upstream commit SHA and exact file list before the transplant.
- Latest observed CI run [40872007847](https://github.com/mdanasaaq-design/Awwab/actions/runs/40872007847) passed all six jobs on `d81779e`. PR #22 remains open and draft. The new documentation branch has not been merged or deployed.


## R1 Readability source import — 2026-10-30

- Vendored Mozilla Readability `Readability.js` from exact upstream commit `ab4027a8b37669745016869a37a504727992b2ba` (Apache-2.0) and copied the full licence.
- Added a typed Awwab wrapper with HTML size cap, HTTP(S)-only source provenance, plain-text output and no network access.
- Added deterministic wrapper/provenance tests and a CI step; CI result is pending because the new branch has not yet been run through a PR workflow.
- The existing ResearchPanel is not yet wired to this parser. URL fetching/CORS and SSRF protections are separate work and remain open.


### R1 Research integration update — 2026-10-30

- ResearchPanel now calls the fixed Wikipedia parse API for full page HTML and passes it to the locally vendored Readability parser.
- The UI displays plain-text article extracts; parser failure/short content falls back to the original search excerpt. Crossref behavior is unchanged.
- No arbitrary URL fetcher, CORS proxy, crawler, model call or third-party service was added.
- The implementation commit's CI already passed the Readability wrapper/provenance tests and web typecheck/build. Remaining jobs in run [41064461385](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064461385) are still being checked.
- Manual browser testing against multiple Wikipedia pages, non-English pages, very long pages and parser fallback is still required.


### R1 CI completion — 2026-10-30

Latest branch-head CI run [41064652230](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064652230) passed all six jobs. The earlier implementation run [41064461385](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064461385) also passed all six jobs. Manual browser testing of the Research UI and representative article output remains outstanding.


## Assistant plan-output validation follow-up — 2026-10-30

- Tightened the plan-only runtime validator to reject unknown top-level/step properties and duplicate step IDs. Regression tests cover injected metadata, injected step fields, and duplicate IDs.
- Commits: `2ef5666` (validator) and `b069548` (tests); the Phase 4 record and changelog were updated afterward.
- **Validation state:** no workflow run or status check has yet been surfaced for the new commits. The previous six-job CI success does not cover this follow-up. Do not treat it as validated until a fresh run completes.
- **Capability state unchanged:** Awwab's own model remains untrained; generation remains disabled; the runtime is plan-only and no tools or external side effects are enabled.


## Project and task workspace implementation — 2026-10-30

- Added `apps/web/src/WorkspaceDataPanel.tsx` with signed-in-user-scoped Firestore CRUD for projects and tasks.
- Projects: create, edit name/description, archive/restore, and delete. Tasks: create with priority and optional due date, filter by status, update status, and delete.
- All writes use the existing `users/{uid}/projects` and `users/{uid}/tasks` paths and match the current client-writable Firestore field contracts. Task-to-project linking is intentionally withheld because current Rules do not yet validate same-user project references.
- Connected the panels in `apps/web/src/App.tsx` and added responsive styles. Automations remains an empty placeholder; activity is a read-only backend-event view.
- **Automated validation:** GitHub Actions run [41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446) passed all six jobs on code commit `4782136a6eb487b57effb28fae866fa6288a9293`, including web typecheck/build, Functions/shared typecheck/build, Firestore Rules emulator tests, callable emulator tests, assistant runtime contracts, parser provenance tests, and Model Lab standard-library checks. Later commits only updated documentation. **Manual browser acceptance and live Firebase Rules status remain unverified.** Client writes will be denied if the matching Rules are not deployed in the target Firebase project. No Rules deployment, data migration, production deployment, or billing change was performed.
- Assistant generation remains disabled until Awwab's own randomly initialized model is actually trained, evaluated, and integrated. This workspace work does not make Awwab v1.0 release-ready.


### Read-only activity view — 2026-10-30

- Added an account-scoped, read-only activity feed using the existing `users/{uid}/activity` collection and the latest 100 records.
- The UI displays only backend-recorded event type, action, tool, actor type, outcome, and timestamp. It does not create or infer activity events.
- The view may remain empty because live backend callables are not deployed on the current Firebase plan. No backend, Rules, or production deployment was performed.
- GitHub Actions run [41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446) passed all six jobs for the workspace/activity code. Manual browser acceptance and live Firebase Rules status remain pending.


### Workspace feature completeness update — 2026-10-30

- Task records now support editing title, description, priority and due date in addition to status changes and deletion.
- The command-center workspace overview now labels Projects, Tasks, Research and Memory as available in this development branch. Activity is available as a read-only history view; Automations remains explicitly not connected.
- The workspace UI source and Firestore Rules contract align for the fields currently written by the panels; the Firestore Rules emulator suite passed in run [41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446). This does not prove the same Rules are deployed in the live Firebase project; browser acceptance remains pending.
