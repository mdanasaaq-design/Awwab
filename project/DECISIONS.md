# Architecture Decisions

## ADR-001 — Firebase as current backend baseline
**Status:** Accepted for foundation; subject to validation

Firebase is the current baseline because it provides authentication, synchronized data, messaging, App Check and server-side functions with low initial infrastructure overhead. It remains replaceable if real workload, cost, security or capability requirements justify a change.

## ADR-002 — Native Android client
**Status:** Accepted

Awwab has a first-class native Android client using Kotlin + Jetpack Compose.

## ADR-003 — Backend-mediated privileged tools
**Status:** Accepted

Sensitive credentials and privileged tool execution remain behind backend boundaries.

## ADR-004 — Explicit approval for sensitive actions
**Status:** Accepted

Sensitive actions require explicit confirmation unless a future documented policy establishes a narrower safe authorization mechanism.

## ADR-005 — Provider-agnostic AI orchestration
**Status:** Accepted

Awwab exposes a model-provider interface rather than coupling product state to one vendor.

## ADR-006 — Planner/executor separation
**Status:** Accepted

The model may propose a plan, but deterministic policy/execution code decides what can run. Authorization and side effects cannot depend on probabilistic model behavior.

## ADR-007 — User-scoped Firestore hierarchy
**Status:** Accepted

Personal data is primarily organized under `/users/{uid}/...` with ownership enforced by Rules and backend authorization.

## ADR-008 — Firebase Auth plus Awwab device authorization
**Status:** Accepted

Firebase Authentication remains account identity. Awwab device state provides installation-level authorization.

## ADR-009 — Approval binds to exact action
**Status:** Accepted

Approval binds to the exact target/action/payload or a cryptographic payload hash. It cannot be reused for a materially different action.

## ADR-010 — Append-oriented audit
**Status:** Accepted

Security-relevant activity is backend-controlled and append-oriented.

## ADR-011 — Tool registry and policy engine
**Status:** Accepted

Tools must be registered with schemas, scopes, risk class, budgets and verification strategy.

## ADR-012 — Graduated autonomy
**Status:** Accepted

Autonomy tiers:
- Tier 0: answer
- Tier 1: recommend
- Tier 2: prepare/draft
- Tier 3: execute reversible low-risk actions
- Tier 4: execute approved high-impact actions
- Tier 5: scheduled bounded autonomy

Higher tiers require stronger controls.

## ADR-013 — Evaluation as a product subsystem
**Status:** Accepted

Awwab continuously evaluates factuality, tool correctness, safety, reliability, latency and cost.

## ADR-014 — MCP interoperability
**Status:** Proposed/guarded

MCP may be adopted for interoperability. It does not replace Awwab authorization, policy, approval or audit.

## ADR-015 — No premature microservices
**Status:** Accepted

Keep modular interfaces before splitting infrastructure into separate services. Operational complexity must be justified.


## ADR-016 — Awwab-owned standalone agent runtime
**Status:** Accepted

Awwab independently implements its own request lifecycle, provider adapter, job state, tool registry, deterministic policy, approvals, audit and verification. Open-source projects researched for this direction are architecture and threat-model references only. No code transplant or runtime dependency is implied. A future dependency proposal must include a separate decision, license review, Node.js 22/Firebase compatibility analysis, security review and measurable benefit.

## ADR-017 — Plan-only assistant runtime as first increment
**Status:** Accepted for the first runtime experiment

The first assistant runtime slice may create and persist a validated plan but must not execute tools or external side effects. It must enforce server-derived user identity, runtime schema validation, Awwab-owned capability allowlisting, user-scoped persistence, typed failures and audit correlation. Tool execution, sensitive approvals, autonomous jobs and computer use remain later increments gated by tests and explicit scope.


## ADR-018 — Keep the current Firebase billing plan
**Status:** Accepted on 2026-10-27

The owner chose option B: do not upgrade the Firebase project to Blaze at this time. Cloud Functions deployment is blocked. Do not retry deployment or create paid resources without a separate explicit owner decision. This decision does not authorize a security-rule workaround.

## ADR-019 — Alternative backend is research-only until approved
**Status:** Proposed / not selected

Cloudflare Workers with Firebase Authentication and Firestore is a candidate, not a final architecture. Before selection, compare token verification/revocation, least-privilege Firestore access, secrets, region, quotas, rate limiting, observability, cost, rollback, and data migration risk against other viable options. No account or cloud resource should be created until the owner approves the architecture.

## ADR-020 — Reconcile local ZIP edits before syncing
**Status:** Accepted on 2026-10-27

The local Windows folder was extracted from a ZIP and is not a Git clone. Region edits in the local copy passed build checks but are not known to be on GitHub main. Do not assume local and remote code match, overwrite either copy, or deploy until exact diffs are reviewed.


---

> **Planning sync — 2026-10-27:** Current blockers and decisions are tracked centrally in [Master Plan and Work Audit](MASTER_PLAN.md). Historical acceptance criteria and prior CI results must not be interpreted as proof that live Firebase integration works.


## ADR-020 — Reuse and adapt open-source source code inside Awwab
**Status:** Accepted — 2026-10-30

Awwab should not recreate mature engineering unnecessarily. The project may copy, adapt and maintain selected source files/modules from public repositories inside Awwab after exact-file licence, provenance, dependency and security review. Prefer small deterministic components over whole agent products. Awwab retains its own contracts, identity, data model, policy, permissions, approval, execution, verification and audit. Maintain upstream attribution and a `THIRD_PARTY_NOTICES.md` register. GPL/AGPL and unresolved licences require a separate owner licensing decision.

## ADR-021 — Open-source code reuse does not relax independent-model requirements
**Status:** Accepted — 2026-10-30

Awwab may reuse training algorithms, tensor utilities, optimizers, model architecture implementation patterns, checkpoint code and evaluation tools, but Awwab's own model weights must start from random initialization. No third-party pretrained weights, model API, hosted agent, teacher-model distillation or remote AI fallback. User conversations are not training data without separate explicit opt-in. The source catalogue is [OPEN_SOURCE_REUSE_CATALOG.md](../docs/OPEN_SOURCE_REUSE_CATALOG.md).


## ADR-022 — Awwab cognitive core is independent of model checkpoints (2026-10-31)
**Status:** Accepted as target architecture. Identity, memory, goals, policies, task state and development history belong to Awwab-owned persistent state and survive model upgrades. The model supplies learned reasoning capability but does not own permissions or identity.

## ADR-023 — One developer agent before multi-agent autonomy (2026-10-31)
**Status:** Accepted. Prove one isolated Developer agent end-to-end before adding specialist agents or parallel execution. Initial roles share Awwab's own model; they are not separate neural models.

## ADR-024 — Local owner-controlled development execution is the first candidate (2026-10-31)
**Status:** Accepted for evaluation, not yet implemented. Evaluate Windows/Termux local execution before provisioning a hosted backend because Firebase Functions are undeployed on Spark and no alternate backend is approved. No local bridge or broad shell access is authorized by this decision alone.

## ADR-025 — Self-evolution is candidate-based and owner-promoted (2026-10-31)
**Status:** Accepted. Agent experiments occur in isolated branches/worktrees. Awwab may prepare, test and compare candidates; only the owner may approve merge, release, deployment, Rules changes, secrets, billing or migrations.

## ADR-026 — No consciousness or capability overclaim (2026-10-31)
**Status:** Accepted. “Own mind” refers to an engineered cognitive architecture, not subjective awareness. A tiny synthetic-trained model is a pipeline proof, not a capable assistant. Capability claims require measured evaluations.


## ADR-027 — Cognitive Core is deterministic and model-independent (2026-11-01)
**Status:** Accepted. Identity, memory, goals, context selection and evidence records live in an Awwab-owned shared module and must persist independently of model checkpoints. The first implementation is dependency-free and deterministic; the model cannot own permissions or state transitions.

## ADR-028 — First Cognitive Core store is in-memory reference only (2026-11-01)
**Status:** Accepted. Do not connect new cognitive records to Firestore until an explicit storage adapter contract, owner-scoped Rules, expiry/correction/deletion/retention behavior and live validation are reviewed. Existing Memory UI/schema remain unchanged in this phase slice. No migration or cloud writes are authorized.
