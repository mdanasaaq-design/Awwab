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
