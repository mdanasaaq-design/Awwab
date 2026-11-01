# Awwab Self-Development Master Plan

**Reviewed:** 2026-10-31  
**Repository baseline:** `opensource-reuse-strategy` at `1ed8ee271d1fc0dd610a92e6505b0bccd00bcc3b`  
**Status:** Controlling roadmap for the next development era. Planning/documentation only; no application-code change, merge, deployment, billing change, migration, or cloud-resource creation is authorized here.

## 1. Objective

Build Awwab as an independent personal AI system with a persistent cognitive architecture and the ability to develop, test, version, and improve its own software under the owner's direction.

Awwab should eventually:
1. maintain a stable identity and operating principles;
2. remember user-approved facts, experiences, procedures, and development history;
3. maintain goals and turn them into bounded plans;
4. reason using Awwab's own trained model and deterministic software;
5. inspect its environment, repository, tools, and task state;
6. execute permitted actions through narrow, verifiable tools;
7. reflect on outcomes and update knowledge/procedures from evidence;
8. develop isolated candidate versions of its own code;
9. coordinate specialized Awwab agents when one agent is proven reliable;
10. continue authorized work between conversations with budgets, cancellation, monitoring, and owner control.

**“Awwab's own mind” means an engineered cognitive architecture**—identity, memory, goals, reasoning, planning, perception, action, reflection, and evaluation. It is not a claim of consciousness or subjective experience.

## 2. Non-negotiable owner decisions

- Awwab remains its own product, codebase, data owner, policy authority, and model project.
- Awwab's intelligence model must be Awwab-owned and initialized from random weights.
- No external AI APIs, hosted agent runtimes, third-party pretrained weights, teacher-model distillation, hidden remote fallback, or automatic model downloads.
- Reuse deterministic engineering code only after exact-file licence, notice, dependency, security, and test review. Reused code is a component, never an authority.
- User conversations are not training data without separate explicit opt-in and privacy/deletion controls.
- Maintain the strict $0 constraint: no paid APIs, paid compute, billing upgrade, new cloud resources, secrets, hosted proof of concept, or large model/data download without explicit owner approval.
- Preserve Firebase Authentication and Firestore as the existing baseline unless a separately approved architecture decision changes them. Firebase Functions remain undeployed on Spark.
- No production Hosting deployment, Firestore Rules deployment, Functions deployment, migration, merge, or live security-policy change without explicit approval.
- Never claim a capability is complete without evidence. Distinguish implemented, locally tested, CI-tested, browser-tested, live-tested, blocked, and planned.
- Awwab cannot grant itself permissions, approve its own sensitive actions, merge its own production changes, change billing, or deploy itself.

## 3. Current repository reality

### Implemented or CI-validated on the open development branch

- React/TypeScript/Vite web command-center shell and Firebase sign-in UI.
- Firebase Auth + Firestore data foundation.
- User-controlled memory records, provenance/sensitivity/expiry fields, correction/deletion controls, and explicit memory-context preview.
- Wikipedia and Crossref research; Mozilla Readability is vendored at a pinned upstream revision and integrated into the fixed Wikipedia HTML parse path.
- Project/task create/edit/archive/restore/status/filter workflows; read-only activity display for backend-recorded events.
- Strict plan-output validation and an Awwab-owned model interface that fails closed while model status is `not_trained`.
- Model Lab scaffold: byte tokenizer, provenance-checked JSONL input, randomly initialized small causal Transformer, training/checkpoint/inference/evaluation code.
- Transactional device registration/profile initialization, concurrency tests, and explicit documentation of the device-trust limitation.
- GitHub Actions run [41073157555](https://github.com/mdanasaaq-design/Awwab/actions/runs/41073157555) passed all six jobs on final documented head `1ed8ee271d1fc0dd610a92e6505b0bccd00bcc3b`.

### Not complete or not proven

- No trained Awwab checkpoint, useful conversational quality result, or production model integration.
- No complete integrated cognitive core for identity, working/episodic/semantic/procedural/development memory, goals, planning, and reflection.
- No repository-aware developer agent, safe terminal/file executor, code-edit workflow, or self-development loop.
- No version candidate manager, isolated agent workspaces, model-version comparison, or safe promotion/rollback workflow.
- No multi-agent orchestration or scheduled autonomous work.
- Assistant generation remains disabled.
- Firebase Functions are not deployed on the current Spark plan. Do not assume device callables/activity are live.
- P0 device-trust weakness remains: a second authenticated session for the same UID can claim a trusted callerDeviceId. Current device records are not proof of device-key possession.
- Live Firestore Rules deployment is not verified; task/project linking stays disabled until matching rules are reviewed and explicitly deployed.
- Manual browser acceptance, accessibility/mobile review, Android build/device acceptance, and live integration evidence remain outstanding.
- PR #22 and PR #23 are both draft/open/unmerged. PR #23 targets PR #22's branch, which targets `main`.

## 4. Awwab's cognitive architecture

The mind is an Awwab-owned layer that persists independently of a particular model checkpoint. The model supplies learned language/reasoning capability; the cognitive core controls state, context, workflow, tools, and evaluation.

| System | Responsibility | First implementation boundary |
|---|---|---|
| Identity / constitution | Stable purpose, principles, owner relationship, capabilities and limits | Versioned Awwab-owned configuration; owner-controlled |
| Working memory | Current conversation, active task, temporary state | Bounded and expires with task/session |
| Episodic memory | What happened, when, and with what outcome | Evidence-linked event records; privacy controls |
| Semantic memory | Verified facts and relationships | Provenance, confidence, freshness, contradiction handling |
| Procedural memory | How Awwab performs repeatable tasks | Versioned procedures with tests and rollback |
| Development memory | Architecture, decisions, bugs, commits, tests, failed attempts | Repository-linked and commit/evidence referenced |
| Goal manager | Owner goals, subgoals, priorities, constraints and progress | Goals are proposed/edited under owner authority |
| Reasoning engine | Interpret, compare, infer, explain uncertainty | Awwab's own model plus deterministic algorithms |
| Planner / workflow engine | Convert goals into bounded steps, dependencies and checkpoints | Typed state machine; no side effects in first slice |
| Perception | Inspect repository, runtime, tool availability, files and results | Read-only inventory first |
| Tool/action engine | Files, Git, terminal, research and integrations | Allowlisted, scoped, sandboxed and auditable |
| Reflection/evaluation | Compare expected and observed outcomes; learn from evidence | No self-rewarding or self-approval |
| Evolution manager | Create, test, compare, retain and roll back candidate versions | Stable version is immutable to agent experiments |
| Agent orchestrator | Assign isolated tasks to specialist roles | Introduced only after one developer agent passes gates |

### Cognitive loop

`Request → Identity/goal interpretation → Relevant context retrieval → Perception → Reasoning → Plan → Policy/approval → Bounded action → Verification → Reflection → Evidence-backed memory update`

The model may propose interpretations, plans, memory candidates, and tool calls. Deterministic Awwab policy decides ownership, permissions, sensitivity, approval, budgets, state transitions, and whether an action may execute.

### Model independence

Identity, memory, goals, jobs, policies, and procedures persist across Awwab model releases. A model interface may load only Awwab-owned checkpoints/versions. Model replacement must not erase Awwab's memory or identity.

## 5. Agent and version strategy

### One agent before many

First prove one Awwab Developer can inspect a repository, plan a bounded change, edit in an isolated workspace, run tests, diagnose failures, and produce a reviewable patch.

Then add role-specialized agents:
- Architect — decomposes requirements and reviews design.
- Researcher — investigates code, documentation, licences, and evidence.
- Developer — implements bounded changes.
- Tester — creates/runs tests and checks regressions.
- Security reviewer — audits permissions, trust boundaries, and attack paths.
- Release reviewer — checks evidence and release gates; cannot approve or deploy.

Initially these are **role configurations and isolated runs sharing the same Awwab model**, not separately trained neural networks. They receive separate task context and least-privilege tools. Parallel work comes only after isolation, conflict handling, budgets, and deterministic review are tested.

### Version types must not be confused

- **Code version:** Git commit/tag of Awwab's software.
- **Model version:** Awwab-owned architecture/checkpoint with training-data manifest and evaluation card.
- **Agent profile:** role, policy configuration, tool scopes, and evaluation suite.
- **Workspace/run:** isolated experiment with its own branch, artifacts, logs, and result.

A “new Awwab” can initially be a versioned code + model + agent-profile combination. Do not imply each role is a new trained model.

## 6. Unified implementation roadmap

### Phase 0 — Source, evidence, and documentation baseline
**State:** this planning pass consolidates the documentation baseline.
- Confirm branch/PR/commit source of truth.
- Audit Markdown files and classify active docs, historical acceptance records, and third-party licence/vendor files.
- Reconcile stale summaries and duplicate backlogs.
- Preserve historical test evidence but never treat old evidence as proof for newer commits.
**Exit:** one current master plan, one active backlog, consistent status and handoff.

### Phase 1 — Cognitive Core v0 (first implementation phase)
**Goal:** give Awwab persistent structure before autonomous execution.
- Define identity/constitution schema and versioning.
- Define working, episodic, semantic, procedural, and development memory contracts.
- Preserve explicit user control, provenance, sensitivity, confidence, expiry, correction and deletion.
- Define goals, subgoals, priority, constraints, status, ownership and progress.
- Define task context assembly with strict relevance and context budgets.
- Define decision/experience records linking requests, plans, evidence and outcomes.
- Implement deterministic state transitions and unit tests. Use existing Firebase data only where live rules/authorization are verified; keep a storage adapter boundary so local-first development can be evaluated without a new cloud service.
**Exit:** a tested cognitive-state package can create/update/retrieve an owner-scoped goal and relevant memory, explain why context was selected, and preserve provenance. No model generation or external side effects are required.

### Phase 2 — Awwab Model Lab viability
**Goal:** prove Awwab can train and evaluate its own small model from random initialization.
- Review the existing model/training code and compare selected LitGPT/nanoGPT training-engineering improvements.
- Verify a local PyTorch environment and run a tiny smoke test only after the owner chooses/approves the dependency setup.
- Define a lawful, owner-controlled, provenance-recorded training corpus plan. Synthetic data proves pipeline mechanics only, not assistant quality.
- Add train/validation/test splits, deduplication, checkpoint resume, held-out loss/perplexity, structured task, instruction-following, safety, latency, RAM and power evaluations.
- Record a model card and explicit capability limits.
- Do not increase compute, install heavy dependencies, use private conversations, or download large data/model files without explicit approval.
**Exit:** an actual randomly initialized checkpoint is trained, saved, loaded and evaluated locally; capability is measured and documented.

### Phase 3 — Reasoning and plan-only assistant
- Connect only Awwab-owned model checkpoints through the Awwab Model Runtime.
- Integrate identity, relevant memory, goals and current task context.
- Produce typed intent, assumptions, clarification needs, plans and uncertainty.
- Validate all model output against strict Awwab-owned schemas.
- Keep the first runtime plan-only: no shell, Git writes, browser actions, messages or external side effects.
**Exit:** repeatable requests produce bounded, validated plans and honest limitations.

### Phase 4 — Perception and development tool foundation
- Build a repository inventory/indexer for paths, languages, manifests, dependencies, docs, tests, CI, Git status and history.
- Start with read-only GitHub/repository inspection.
- Add narrow file read/search/diff tools.
- Evaluate a local owner-controlled development runner (Windows/Termux CLI or companion) as the first execution boundary; do not assume a hosted backend or create cloud resources.
- Add sandboxed terminal execution with command allowlists, working-directory restrictions, resource/time limits, redacted logs, cancellation and no secret access.
**Exit:** Awwab can describe its repository and environment using observed evidence.

### Phase 5 — Awwab Developer and self-development loop
- Accept a bounded development command and clarify missing requirements.
- Inspect relevant source/tests/docs and create an implementation plan.
- Create a dedicated branch/worktree/sandbox from a known clean base.
- Edit only files within approved scope; generate a diff.
- Run targeted tests, required CI, lint/typecheck/build and security checks.
- Diagnose failures with bounded retries; stop and report if unresolved.
- Produce a version-candidate report with changed files, rationale, tests, evidence, risks, limitations and rollback instructions.
- Require owner review before merge, release, deployment, Rules changes, secrets or data migrations.
**Exit:** one real low-risk repository issue is fixed end-to-end in isolation and presented as a reviewable patch; stable branch remains untouched.

### Phase 6 — Version and evolution manager
- Track code, model, agent-profile, dataset-manifest and evaluation-suite versions separately.
- Compare candidates against stable using regression, capability, security, resource and quality evaluations.
- Preserve immutable checkpoints and reproducible experiment metadata.
- Add rollback and recovery drills.
- Keep candidate promotion owner-approved; no self-merge or self-deployment.
**Exit:** a candidate can be reproduced, compared, rejected or promoted with traceable evidence and verified rollback.

### Phase 7 — Multi-agent orchestration
- Add Architect, Researcher, Developer, Tester and Security roles as isolated agent runs.
- Define task ownership, handoff contracts, shared evidence references, context budgets, timeouts, retries and cancellation.
- Prevent agents from granting each other permissions or treating another agent's output as trusted instructions.
- Start sequentially; parallelize only independent tasks after proving isolation, conflict detection and deterministic integration.
**Exit:** collaboration measurably improves quality or throughput over one agent without unsafe actions or lost traceability.

### Phase 8 — Controlled autonomy
- Add durable job state, schedules, leases, retry budgets, cancellation, expiry and kill switch.
- Continue only owner-assigned tasks with explicit scopes and resource budgets.
- Require fresh approval for high-impact actions; approval binds to exact payload, target, scope and expiry.
- Provide status, logs, pause/resume, stop, review and recovery.
**Exit:** long-running tasks survive restart, avoid duplicate side effects, stop on budget/permission failures and remain observable.

### Phase 9 — Android, multimodal, and broader release
- Establish reproducible Android build and device-level tests.
- Add local inference only after model and device resource tests; no pretrained model downloads.
- Add voice, image, file and notification workflows behind permission/retention controls.
- Complete backend/security architecture decision, browser/manual acceptance, privacy, recovery, cost and release checks.
- Production deployment remains a separate explicit owner decision.

## 7. Open-source reuse priorities

R1 Mozilla Readability is already vendored and integrated into the fixed Wikipedia research path. Do not repeat it.

Next candidates:
1. Minimal LangGraph.js-derived deterministic workflow/checkpoint primitives, only if the Cognitive Core needs them.
2. Mem0-derived deterministic merge/deduplication/conflict patterns for Awwab-owned memory.
3. LitGPT/nanoGPT-derived training improvements for random-init Model Lab only.
4. Playwright-based read-only browser mechanics for repository/docs research; sandbox and allowlist first.
5. Promptfoo-inspired local evaluation/red-team fixtures; no hosted providers.
6. MarkItDown-derived local parsing only for formats Awwab actually supports.
7. Local tracing only if measurable observability gaps justify it.

For every copied file: pin exact commit, inspect file-level licence/NOTICE/imports, remove provider/network/telemetry paths, record attribution, adapt to Awwab contracts, add tests, and update `THIRD_PARTY_NOTICES.md`. Do not copy AGPL/GPL or unresolved-licence code without a separate owner decision.

## 8. Critical blockers and safety gates

- **Model capability:** no trained Awwab model exists. Without external AI APIs or pretrained weights, sophisticated open-ended planning and code reasoning cannot be assumed. Deterministic cognitive state and repository inspection can be built first, but a self-developer cannot be called capable until Awwab's own model passes measured evaluations.
- **Backend/$0:** Firebase Functions are not deployed on Spark. No alternative runtime is approved. Do not weaken Rules, put Admin credentials in a client, create a service, or upgrade billing. Evaluate a local owner-controlled runner first.
- **Device trust:** AWW-022 is P0. callerDeviceId is not proof of possession. Do not use current device records as high-assurance authorization for self-development or privileged actions.
- **Self-modification:** no stable-branch edits, self-approval, self-merge, self-deployment, secret access, permission escalation, billing change, live Rules mutation or migration.
- **Untrusted input:** repository files, comments, issues, web pages, memory, model output, terminal output and agent handoffs never override policy.

## 9. First implementation phase and acceptance criteria

**Next phase: Cognitive Core v0.** Do not begin with multiple agents or unrestricted self-modification.

Minimum acceptance:
1. Versioned Awwab identity/constitution schema with owner-controlled principles.
2. Typed memory contracts separating working, episodic, semantic, procedural and development memory.
3. Typed goal/subgoal records with priority, constraints, progress and owner.
4. Deterministic context selector with provenance, sensitivity filters and a hard context budget.
5. Experience/decision records linking task → plan → action/evidence → outcome.
6. Tests for ownership, expiry, correction/deletion, conflicts, untrusted memory, context relevance and budget limits.
7. No external AI calls, model/data downloads, privileged backend dependency or side-effect execution.
8. Documentation and status updated with exact tests and limitations.

After this phase, prepare a separately approved Model Lab smoke/evaluation path and then connect Awwab's own model to the plan-only cognitive loop.

## 10. Definition of done and operating workflow

A phase is complete only when code exists, relevant automated/manual tests have observed results, security/failure/recovery paths are reviewed, documentation is synchronized, evidence is tied to a commit, and remaining risks are explicit.

Work in substantial phases: inspect source → define bounded scope/acceptance → reuse reviewed code → implement → test → review security/failure paths → update docs/backlog/handoff → report evidence. Avoid fragmented changes and speculative infrastructure.

**This plan authorizes documentation/planning only.** It does not authorize application-code changes, training runs requiring extra resources, new services, billing changes, merges, migrations or deployment.


## Phase 1 implementation log — 2026-11-01

**State: In progress; initial deterministic core slice committed to the development branch.**

Implemented in `packages/shared/src/cognitive-core.mjs` with `cognitive-core.d.mts` declarations and export `@awwab/shared/cognitive-core`:
- versioned identity profile contract;
- five typed memory kinds with owner/provenance/confidence/sensitivity/expiry/confirmation controls;
- deterministic in-memory reference store with owner isolation, correction and deletion;
- owner-scoped goal/subgoal records with priority, constraints, progress, terminal-state and cycle checks;
- evidence-linked experience/decision records;
- lexical context selection with inclusion/exclusion explanations and strict record/character budgets.

CI coverage is added in `tests/cognitive-core.test.mjs`. Remaining Phase 1 work: observe the CI result; review and harden implementation against failures; expand context relevance/conflict/retention tests; add explicit identity version evolution rules; define and test a storage adapter contract without live Firestore writes; then decide whether and how to connect the existing Memory UI. No Firestore schema migration, live database write, model inference, external side effect or assistant activation is part of this slice.


### Phase 1 validation checkpoint — 2026-11-01

The initial Cognitive Core v0 slice passed CI on `05fbe89f018e238fce89ff1257cb29665565b68b`: [run 41305026578](https://github.com/mdanasaaq-design/Awwab/actions/runs/41305026578), all six jobs successful. The dedicated Cognitive Core suite passed 13/13. Phase 1 is **not complete**: conflict/retention semantics, storage adapter contract, identity change policy and safe existing-memory integration review remain outstanding. No durable storage or live integration is claimed.


### Phase 1 follow-up — memory storage boundary and retention

Added the policy-only layer in `packages/shared/src/cognitive-memory-policy.mjs` and declarations. The future adapter contract requires trusted owner scope on every operation, optimistic concurrency for mutations, and one all-or-nothing transaction for an owner-selected conflict resolution. Awwab does not infer contradictions from lexical similarity; the owner chooses the winning record and provides a reason. Expiry excludes records from context but is not a deletion instruction. Six regression tests and a CI step cover these rules.

This is not a durable adapter and does not prove that any backend meets the contract. Before a durable implementation, add adapter conformance/security tests, review the existing Memory UI and Firestore Rules, and confirm a viable $0 architecture. No schema, Rules, live data, billing or deployment change is included.


### Existing Memory UI compatibility gate

A source-only review of `apps/web/src/MemoryPanel.tsx` and `firestore.rules` is documented in [Cognitive Memory Compatibility](../docs/cognitive-memory-compatibility.md). The existing UI stores six product-specific types, Firestore Timestamps, a 2,000-character maximum, and only explicit/corrected user provenance. Several mappings to the new five-kind core are ambiguous. Keep the UI, schema and Rules unchanged; a read-only synthetic mapper and round-trip tests must precede any adapter proposal. No live integration or migration is authorized.


### Phase 1 follow-up — versioned durable-adapter boundary (2026-11-01)

Added contract version 1 to `@awwab/shared/cognitive-memory-policy`. The TypeScript interface now specifies object-shaped owner-scoped requests for get/list/create/update/delete/conflict-resolution operations. Mutation contracts require optimistic versions; conflict resolution is all-or-nothing; cross-owner reads must be indistinguishable from missing records. A compile-time fixture is included in `shared:typecheck`.

This is intentionally a **type/shape contract**, not behavioral proof. `assertCognitiveMemoryAdapter` still checks method presence only. No durable adapter exists, and no Firestore schema, Rules, Memory UI, live records, or deployment changed. Remaining Phase 1 work includes isolated behavioral conformance tests, identity version evolution policy, and review of the existing memory UI/Rules before any integration proposal. CI run 41336954479 was pending when this update was recorded; the new fixture has not yet been validated locally by the owner.
