# Awwab Standalone Agent Runtime — Research and Decision

**Reviewed:** 2026-10-18  
**Status:** Architecture direction accepted; no framework selected; no runtime code added  
**Scope:** Source-level ecosystem research to inform an Awwab-owned implementation

## Decision in one paragraph

Awwab remains a separate, standalone product. The projects below informed the design, but Awwab will not copy their code or make them runtime dependencies as a result of this research. The immediate technical direction is to build a small native TypeScript/Node.js 22 plan-only assistant pipeline inside the existing Firebase backend boundary, using Awwab-owned contracts, state, policy and tests. We should defer framework selection and long-running worker infrastructure until a measured need justifies them.

## What the research suggests

| Project / standard | Useful pattern to study | Fit for Awwab | Decision |
|---|---|---|---|
| [Mastra](https://github.com/mastra-ai/mastra) | TypeScript agent/workflow APIs, memory, approvals, evaluation and observability | Strong ecosystem comparison; verify Node 22, persistence, Functions compatibility and licensing if ever reconsidered | Reference only; no dependency |
| [LangGraph.js](https://github.com/langchain-ai/langgraphjs) | Explicit graph state, checkpoints, interrupts and resumable workflows | Strong alternative for durable, explicit state transitions; adds framework concepts and persistence choices | Reference only; no dependency |
| [OpenClaw](https://github.com/openclaw/openclaw) | Gateway/session boundaries, tool policy, sandboxing and prompt-injection threat model | Useful architecture/security study; broad product/runtime footprint is not a direct fit | Reference only; do not transplant |
| [Dodaios](https://github.com/Dodaios/Dodaios) | Personal-agent UX, multimodal/desktop integrations and broad agent workflows | Useful product inspiration; Python/desktop orientation differs from Awwab web/Firebase/Node baseline | Reference only |
| [Khoj](https://github.com/khoj-ai/khoj) | Personal knowledge retrieval and self-hosted second-brain patterns | Useful retrieval ideas; AGPL-3.0 licensing deserves careful review before any code reuse | Reference only; no code reuse |
| [OpenAgent](https://github.com/the-open-agent/openagent) | RAG, tool integrations and agent-loop ideas | Backend is Go-oriented; not a direct Firebase Functions integration | Reference only |
| [MCP reference servers](https://github.com/modelcontextprotocol/servers) | A common tool/data interoperability protocol | Potential future boundary for selected integrations; individual servers need production security review | Optional future interoperability; never an authorization system |

## Standalone implementation rules

1. Awwab owns request/plan/job schemas, tool contracts, permission checks, approvals, execution, verification and audit.
2. Third-party research may influence concepts, not silently introduce source code, packages, services or operational assumptions.
3. Any future dependency proposal must include a concrete use case, license review, security assessment, Node.js 22/Firebase compatibility, operational cost and an exit strategy.
4. Model output is untrusted data. Deterministic code enforces identity, ownership, scopes, risk, budgets and state transitions.
5. No unrestricted shell, generic code execution, browser control or background autonomy in the first runtime slice.
6. Do not mark an operation successful without independently checkable evidence.

## Recommended architecture

    Web / Android clients
            |
    Firebase Auth + device authorization + App Check (where enforced)
            |
    Awwab-owned callable request boundary
            |
    Input schema + server-derived identity + request limits
            |
    Provider-neutral model adapter -> structured plan
            |
    Awwab-owned schema validation + capability allowlist
            |
    User-scoped plan/job persistence + append-oriented audit
            |
    Return plan with status=planned (no side effects)

A later increment may add approval and a deterministic executor. A still later increment may add durable workers if measured workloads exceed safe callable execution limits. Firestore persistence is not, by itself, a guarantee of exactly-once external side effects.

## First bounded proof of concept

**Goal:** prove the trust boundary and structured-plan contract without doing anything externally.

### Acceptance criteria

- [ ] Request identity is derived from verified backend auth; client-supplied user IDs are ignored/rejected.
- [ ] Input length, request shape and budgets are validated.
- [ ] Model output must pass a runtime schema; malformed/partial output becomes a typed failure.
- [ ] Unknown tool IDs and invalid tool arguments are rejected before any execution path.
- [ ] No tool execution or external side effects are reachable from this slice.
- [ ] Plans/jobs can only be read by their authenticated owner.
- [ ] Request IDs/idempotency prevent duplicate plan records on safe retries.
- [ ] Errors are sanitized; audit events use correlation IDs and avoid secrets.
- [ ] Tests cover unauthenticated requests, malformed output, permission failures, duplicate requests, timeouts and cross-user reads.
- [ ] Build/typecheck and emulator tests run on Node.js 22 and actual outcomes are recorded.
- [ ] Web composer remains disabled; no deployment occurs.

### Explicitly out of scope

- Choosing or embedding Mastra/LangGraph.js or any other researched agent project.
- Real tool execution, sensitive-action approvals, arbitrary shell/browser control, scheduled autonomy, multi-agent orchestration or production deployment.
- A separate worker/microservice before a measured need is demonstrated.

## Important existing project gates

Awwab's current status documents show that the assistant runtime is disconnected, the composer is disabled, and project/task/research/automation/activity pages are not yet live workflows. Security and validation gates are tracked in [Current Status](../project/CURRENT_STATUS.md) and [Issues and Risks](../project/ISSUES_AND_RISKS.md). Re-read those files and current main before implementing the next increment.

## Research links

- [Mastra repository](https://github.com/mastra-ai/mastra) · [Mastra docs](https://mastra.ai/docs)
- [LangGraph.js repository](https://github.com/langchain-ai/langgraphjs) · [Persistence concepts](https://github.com/langchain-ai/langgraphjs/blob/main/docs/docs/concepts/persistence.md) · [Human-in-the-loop](https://github.com/langchain-ai/langgraphjs/blob/main/docs/docs/agents/human-in-the-loop.md)
- [OpenClaw repository](https://github.com/openclaw/openclaw) · [Security overview](https://github.com/openclaw/openclaw/blob/main/docs/gateway/security/index.md) · [Prompt-injection guidance](https://github.com/openclaw/openclaw/blob/main/docs/gateway/security/prompt-injection.md)
- [Dodaios repository](https://github.com/Dodaios/Dodaios)
- [Khoj repository and license](https://github.com/khoj-ai/khoj)
- [OpenAgent repository](https://github.com/the-open-agent/openagent)
- [MCP reference servers](https://github.com/modelcontextprotocol/servers)


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
