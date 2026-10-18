# Awwab Architecture

## Objective

Awwab must become a reliable personal agent platform rather than a collection of disconnected AI features.

Separate:
- identity/device trust
- user data/memory
- assistant orchestration
- model providers
- retrieval/research
- tools/integrations
- policy/approvals
- execution/verification
- automation
- observability/evaluation
- client presentation

## Current technology baseline

- Web: React + TypeScript + Vite
- Android: Kotlin + Jetpack Compose
- Backend: Firebase
- Auth: Firebase Authentication
- Data: Cloud Firestore
- Notifications: Firebase Cloud Messaging
- App integrity: Firebase App Check
- Privileged backend: Cloud Functions 2nd gen
- Runtime: Node.js 22 + TypeScript
- Hosting: Firebase Hosting
- AI: provider-agnostic backend orchestration

This is the current baseline, not a permanent lock-in.

## Logical architecture

```
Clients
  |
Identity / Device Trust / App Integrity
  |
Awwab Assistant Runtime
  +-- Context & Memory
  +-- Planner / Model Router
  +-- Research / Retrieval
  +-- Tool Registry
  +-- Policy / Approval
  +-- Execution / Verification
  +-- Audit / Evaluation
  |
Scoped integrations
```

## Request lifecycle

1. Ingress — authenticate and validate.
2. Normalize — intent, constraints, desired outcome.
3. Context — retrieve only relevant information.
4. Risk — classify requested actions/data.
5. Plan — create a structured plan for multi-step work.
6. Policy — determine allowed tools/actions.
7. Approval — confirm sensitive actions.
8. Execute — call scoped backend tools.
9. Verify — check results/side effects.
10. Commit state — persist justified changes.
11. Respond — result, evidence, failures, next steps.
12. Audit/evaluate — record important events and quality signals.

A model must not bypass this lifecycle.

## Planner/executor separation

The planner proposes steps, tools, context, risks and approval needs.

The executor deterministically:
- validates permissions
- validates arguments
- enforces budgets/timeouts
- executes
- records evidence
- verifies outcomes

## Tool architecture

Every tool should declare:
- stable ID/version
- input/output schema
- required scopes
- risk level
- data classification
- idempotency
- timeout/retry policy
- approval policy
- audit event
- verification strategy

Tools are allowlisted. No unrestricted arbitrary-code tool is exposed to the model.

MCP may be used for interoperability, but Awwab's own authorization and policy layer remains authoritative.

## Model routing

Use a router instead of hard-coding one provider. Route based on:
- task class
- quality
- latency
- cost
- privacy
- context requirements
- tool compatibility
- availability

## Deterministic vs model-driven

Deterministic code handles authorization, permissions, budgets, validation, state transitions, scheduling and audit integrity.

Models handle language understanding, synthesis, classification, planning proposals, retrieval and multimodal interpretation.

Never outsource a security decision to an LLM.

## Long-running work

Research, coding and automations may need durable jobs with:
- job ID
- status
- progress
- cancellation
- timeout
- retries
- idempotency
- partial failure handling
- final verification

## Reliability

External operations need bounded timeout/retry, failure classification, idempotency where necessary and verification.

## Cost

Track model usage, tool calls, external APIs, storage and automation frequency. Add budgets before autonomous automation.

## Scalability

Keep interfaces replaceable before splitting infrastructure. Do not introduce microservices until a demonstrated reliability, scale, security, cost or maintainability problem requires them.


## Research-informed independence rule (2026-10-18)

Awwab remains a separate, standalone product with its own architecture and code. Open-source agent projects reviewed for this effort are design references, not runtime components. Do not copy their code or add them as dependencies as an implied consequence of this research. Any future exception needs a documented decision and license/security/operations review.

Awwab should independently implement the useful architectural patterns:
- a controlled request lifecycle and explicit state machine;
- provider-neutral planning;
- a versioned allowlisted tool registry;
- deterministic authorization and risk policy;
- approvals bound to exact actions;
- durable job records only when needed, with idempotency and recovery;
- evidence-based verification and append-oriented audit;
- prompt-injection isolation for retrieved content;
- bounded execution and measurable quality/cost.

### Runtime boundary for the first slice

Keep the first assistant runtime inside the existing TypeScript/Node.js 22 backend boundary. Do not add a new service or agent framework yet. Implement a plan-only vertical slice first, with no tool side effects. Keep the web composer disabled until the backend contract, authorization and test coverage are ready. Evaluate whether long-running jobs require a separate worker only after a measured need is established.

The first slice should define its own request, plan, job-status and error contracts in the shared package; enforce authentication and ownership in the backend; validate model output with runtime schemas; and record minimal audit evidence. It should not assume that Firestore transactions alone provide a task queue or exactly-once external execution.
