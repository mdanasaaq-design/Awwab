# New Chat Handoff — Awwab

**Updated:** 2026-10-27  
**Repository:** [mdanasaaq-design/Awwab](https://github.com/mdanasaaq-design/Awwab)  
**Handoff branch:** docs/independent-agent-runtime-research  
**Default branch:** main  
**Purpose:** Preserve project decisions and exact next steps when continuing in a new ChatGPT conversation.

## Owner's direction

- Awwab is a standalone product with its own code, logic, architecture and runtime.
- Research other open-source projects to learn patterns; do not copy their code or embed their runtimes into Awwab.
- Prioritize the web command-center redesign first, then harden the foundation, then connect assistant capabilities behind tested safety gates.
- Work in GitHub directly where possible, use small reviewable pull requests, and write acceptance criteria before application-code edits.
- Do not deploy production without explicit authorization.
- Avoid generic “vibe-coded” UI; target a dense, powerful, keyboard-friendly command center.

## What this branch changes

This is a **documentation-only** change. It records research, architecture direction, decision records, status, and this handoff. It does not add runtime code, dependencies, secrets, Firebase configuration, tests, or deployment changes.

Files updated:
- docs/ai-strategy.md — independent-runtime rules, bounded execution and plan-only experiment.
- docs/agent-system.md — plan-only first slice and runtime invariants.
- docs/architecture.md — standalone boundary and first runtime deployment boundary.
- project/DECISIONS.md — ADR-016 and ADR-017.
- project/CURRENT_STATUS.md — research status and recommended next bounded change.
- README.md — research/handoff links and updated next steps.

Files added:
- docs/agent-runtime-research.md — comparison, decisions, architecture, acceptance criteria and links.
- project/NEW_CHAT_HANDOFF.md — this continuation guide.

## Research conclusion

No framework is selected. Mastra and LangGraph.js are useful TypeScript comparison references; OpenClaw is a gateway/security reference; Dodaios is a personal-agent UX reference; Khoj is a knowledge-retrieval reference; OpenAgent is a Go-oriented architecture reference; MCP is an optional future interoperability protocol, not a security boundary. None is being added as an Awwab dependency.

## Verified current project reality

Based on the repository's status docs and source review:
- Web: React + TypeScript + Vite command-center shell.
- Backend: Firebase Cloud Functions 2nd gen, TypeScript, Node.js 22.
- Auth/data: Firebase Authentication and Cloud Firestore; App Check initialization is optional and enforcement is not established by the status doc.
- Android: Kotlin + Jetpack Compose shell, not yet validated as an integrated assistant.
- Assistant runtime: disconnected; composer remains disabled.
- Projects, tasks, research, automations and activity are placeholder views without live data.
- Deployment: not performed.
- Previous recorded local web build passed on Node 24, but the repository targets Node 22; validate on Node 22 for reproducibility.
- Review [Current Status](CURRENT_STATUS.md), [Phase Plan](PHASE_PLAN.md), [Tasks](TASKS.md), and [Issues and Risks](ISSUES_AND_RISKS.md) before coding. Treat their statuses as evidence records that may need refresh from current main.

## Next action recommended

Do not jump directly to unrestricted tool execution. First complete the already stated web command-center UX phase and foundation security/validation gates. Then propose and implement a bounded **Awwab-owned plan-only Assistant Core v0**.

### Plan-only Assistant Core v0 acceptance criteria

1. Authenticate at the backend and derive the authoritative user ID from verified auth context.
2. Validate a bounded request envelope using shared/runtime schemas.
3. Call a provider-neutral model adapter to produce a structured plan.
4. Validate the full model output and every proposed capability against Awwab-owned schemas and an allowlist.
5. Persist user-scoped plan/job state and an audit event with correlation ID.
6. Return planned or a typed failure; no tools or external side effects execute.
7. Reject unauthenticated requests, malformed model output, unknown tools and cross-user reads.
8. Cover duplicate requests/idempotency, timeouts, sanitized failures and recovery behavior with tests.
9. Run typecheck/build and emulator tests on Node.js 22; report observed evidence.
10. Keep the composer disabled and do not deploy.

## Hard constraints

- No Mastra, LangGraph.js, OpenClaw, Dodaios, Khoj, OpenAgent or MCP server code copied into Awwab.
- No new framework dependency without a separate written decision.
- No arbitrary shell or unrestricted browser/computer control.
- No model-based authorization; deterministic server policy owns permission decisions.
- No production deployment without explicit owner authorization.
- Never claim a test, build, or end-to-end flow passed unless it was actually run and observed.

## Start a new chat with

“Continue Awwab from the repository handoff. First inspect the latest main and the PR/branch state. Keep Awwab standalone and do not integrate or copy other projects. Tell me the current state and propose the next bounded change with acceptance criteria before editing application code.”


## Latest handoff update — 2026-10-27

- Read [Master Plan and Work Audit](MASTER_PLAN.md) before starting implementation; it contains the full audit and ordered steps.
- The owner chose to remain on the current Firebase plan. Cloud Functions deployment is blocked by Blaze and no functions are deployed. Do not retry deployment or upgrade billing.
- Firestore Native default database exists in asia-south1 (Mumbai). This does not prove rules, functions or the real device lifecycle work end-to-end.
- Local extracted ZIP copy passed functions typecheck/build and web build, but it is not a Git clone. Its region edits are not known to be present on GitHub main. Reconcile exact diffs first.
- Cloudflare Workers is a candidate for architecture research only; no backend migration or account/resource creation is approved.
- No Hosting, Rules, or Functions deployment is authorized. Keep the assistant composer disabled and avoid any production or paid-resource changes.
## Source reconciliation handoff — 2026-10-28

- Current GitHub `main`: `07651e30ed0b6f40e843b4fe90cb876dfdbd15d7`.
- Actual local clone: `C:\Users\rexy2\Awwab`, remote `https://github.com/mdanasaaq-design/Awwab.git`; before sync, local `main` was `3a7d914`, and after fetching `origin` it was 60 commits behind, 0 ahead. No tracked edits or local-only commits were reported.
- Untracked local `package-lock.json` was preserved and copied to `C:\Users\rexy2\Awwab-package-lock.local-backup-20261028.json`; the SHA-256 hashes matched. Do not delete the backup or discard the local lockfile until its contents have been compared.
- `C:\Users\rexy2\Downloads\Awwab` is an extracted copy, not a Git repository. Keep it untouched.
- **Next local operation:** fast-forward the actual clone with `git -C "C:\Users\rexy2\Awwab" pull --ff-only origin main`, stop on failure, then verify status and inspect lockfile differences. No production deploy, Rules/Functions deploy, billing upgrade, migration, or paid resource creation is authorized.
- **Next project phase:** after local sync, complete Phase 1 manual browser acceptance (auth persistence/error/retry; device loading/empty/error/revoke flows; quick-switcher/skip-link focus; responsive and accessibility checks). Current-main source inspection is not a substitute for observing the UI in a browser.

## Phase 1 execution update — 2026-10-28

- Bounded source fix committed directly to GitHub `main`: `dbed29520c01e2027c6dd7f3953d6a3f632050cb` — profile initialization failures no longer mislabel device registration as failed.
- Acceptance criteria are recorded in [Phase 1H Command Center Overview](PHASE_1H_COMMAND_CENTER_OVERVIEW.md); task and status records are updated.
- GitHub Actions run [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) subsequently passed all four jobs, including web typecheck/build and both Firebase emulator suites. Browser/manual review remains pending.
- No deployment, Rules change, billing upgrade, or backend migration was performed.


## Owner direction correction — open-source code reuse (2026-10-30)

The owner explicitly wants us to take useful source code from public GitHub projects, adapt it, and integrate it directly into Awwab. Do not repeat the earlier instruction that all external projects are reference-only. Awwab remains independently owned; this is code reuse, not a request to run another company's agent or use its AI model.

- Read [Open-Source Reuse Catalogue and Integration Plan](../docs/OPEN_SOURCE_REUSE_CATALOG.md) first.
- New planning branch: `opensource-reuse-strategy`, based on `d81779e9996c69b88e6c140ea473eb4b603c4a17`.
- PR #22 remains draft/open; latest run [40872007847](https://github.com/mdanasaaq-design/Awwab/actions/runs/40872007847) passed all six jobs on its head.
- First code task: inspect exact Mozilla Readability source commit/files/licence, then integrate the pure article parser into Research with tests and attribution.
- Next: LangGraph.js state/checkpoint primitives; Mem0 memory algorithms; Playwright local browser adapter; LitGPT/nanoGPT training improvements; MarkItDown parser patterns; Promptfoo evaluation.
- No third-party pretrained weights, AI APIs, hosted agents, teacher distillation or remote fallback.
- Every copied file requires exact-file licence/security review and a `THIRD_PARTY_NOTICES.md` entry. Avoid GPL/AGPL and unresolved licences pending a separate owner decision.
- Do not deploy, merge, enable billing, create cloud resources, download model/data weights or use paid APIs without explicit approval.

When resuming, inspect the current branch head and CI, then begin R1 rather than restarting the research phase.


## A5 continuation — workspace CRUD implementation (2026-10-30)

- Active development branch: `opensource-reuse-strategy`; open draft PR #23 targets `phase-4-memory-research-safety`, which itself is an unmerged draft PR #22 against `main`.
- The branch contains the accumulated Phase 4 and v1.0 work beyond `main`; re-check the exact comparison before any merge. Do not merge either PR without explicit owner approval.
- Added `apps/web/src/WorkspaceDataPanel.tsx`: Firestore-backed project CRUD (create/edit/archive/restore/delete) and task CRUD (create, priority/due date, status filter/update, delete). App routes Projects and Tasks to these panels; responsive styles added.
- Task-to-project links remain disabled because current active Rules only check that projectId is a string, not that it references a project owned by the same user.
- Latest workspace code commits: `1b19052` (panel), `2e4209a` (App integration), `6bc18ee` (styles), `41606e7` (remove duplicate placeholder rendering).
- **Validation pending:** latest CI run is not visible through the available GitHub run lookup; no local typecheck/build or emulator/browser run has been performed for this slice. Do not claim it passes until observed.
- No production deploy, Firestore Rules deploy, billing change, cloud resource creation, or merge was performed.
- Assistant generation remains unavailable because Awwab's own model has not yet been trained. Automations/activity remain placeholders; memory/research need manual browser acceptance. Continue with validation and a UI review before starting another broad feature.


### Activity view follow-up — 2026-10-30

- Added `ActivityPanel` to `apps/web/src/WorkspaceDataPanel.tsx`, reading the latest 100 events from the signed-in user's activity collection; connected it in `App.tsx` and styled event timestamps.
- Updated command-center copy so project/task/research/memory/activity sections are labelled available; assistant generation and automations remain unavailable.
- Activity is read-only and may be empty until a backend that records events is available. No event writes, Rules changes, backend deployment or production deployment were added.
- Latest observed commit before documentation sync: `e68b50b` for workspace status copy; activity implementation commits: `b3a0b47`, `e606ba2`, `5b4ff07`.


### Workspace acceptance follow-up — 2026-10-30

- Tasks also support editing title, description, priority, and due date; status transitions and deletion remain available.
- Review Firestore rules compatibility in `tests/firestore.rules.test.js`: project create/archive/update and task create/status update/delete contracts are covered by the existing emulator suite. The UI's task fields (`dueAt`, nullable `projectId`, `completedAt`) match the current rule schema.
- No same-user task-to-project link is offered because current rules do not enforce reference ownership.
- **Automated validation passed:** CI run [41068393446](https://github.com/mdanasaaq-design/Awwab/actions/runs/41068393446) passed all six jobs on code commit `4782136a6eb487b57effb28fae866fa6288a9293`, including web typecheck/build and Firestore/callable emulator suites. Subsequent commits are documentation-only. Browser acceptance and live Firebase Rules status remain outstanding.
