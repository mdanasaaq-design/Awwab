# Awwab Agent System

## Purpose

Define how Awwab turns a natural-language request into a safe, useful outcome.

## Agent loop

```
REQUEST -> UNDERSTAND -> CONTEXT -> PLAN -> POLICY/RISK
                                     |
                              APPROVAL if needed
                                     |
                                  EXECUTE
                                     |
                                  VERIFY
                                     |
                              PERSIST/AUDIT
                                     |
                                  RESPOND
```

The loop must be bounded.

## Request envelope

Eventually include:
- requestId
- userId
- deviceId
- conversationId
- user input
- attachments
- client context
- requested mode
- timestamp
- correlationId

## Intent classes

answer, research, plan, data mutation, external action, automation, project/development work, reminder/follow-up, multimodal analysis.

Classification may be model-assisted; authorization is deterministic.

## Context hierarchy

1. explicit current request
2. active conversation
3. active task/project
4. confirmed preferences
5. relevant durable memory
6. external retrieved knowledge
7. broader history only if necessary

Never retrieve all personal data by default.

## Plan

A structured plan may contain objective, assumptions, steps, tools, required context, expected outputs, risks, approval requirements, verification criteria and budget/time estimates.

Simple requests should not be over-planned.

## Tool selection

Consider capability match, permissions, risk, input completeness, sensitivity, cost, latency and reliability.

The model proposes; policy authorizes.

## Execution

Each execution receives tool ID/version, validated arguments, user/device scope, authorization, approval if required, timeout, retry policy, budget and correlation ID.

## Verification

Verification must be side-effect specific. Examples:
- email -> accepted message ID
- GitHub -> inspect resulting repository state
- reminder -> confirm stored schedule
- file -> confirm expected state
- research -> confirm sources and claim mapping

Absence of an exception is not proof of success.

## Failure classes

user error, authorization failure, unavailable tool, timeout, transient failure, permanent failure, verification failure, policy rejection, model failure.

Retry only transient/idempotent operations.

## Cancellation

Long-running work must support cancellation where possible. Never claim an external side effect was undone unless verified.

## Autonomy tiers

0 answer
1 recommend
2 prepare/draft
3 reversible low-risk execution
4 explicitly approved high-impact execution
5 scheduled bounded autonomy

Default to the lowest tier that solves the task well.

## Multi-agent

Do not introduce multiple autonomous agents by default. Use sub-agents only when decomposition, isolated permissions and coordination benefits justify them.

## Computer use

Future only. If introduced, sandbox it with explicit scope, action limits, approval, state verification, kill switch and full audit.

## Core rule

Awwab should reason broadly but act narrowly.


## Runtime implementation boundary (research update — 2026-10-18)

The system described above is the intended Awwab-owned design, not an instruction to embed another agent product. Awwab owns the request lifecycle, job state, tool registry, policy decisions, approvals, audit records and verification. External projects studied during research are references; their code and runtime are not part of Awwab.

### First implementation slice: plan-only

The first runtime increment must be deliberately non-executing:

- accept an authenticated request with a request ID, user ID derived from verified auth (never trusted from client payload), conversation ID, bounded text, and correlation ID;
- normalize and validate input with shared schemas;
- retrieve no broad personal history by default;
- use a provider-neutral adapter to request a structured plan;
- validate the complete plan and all proposed tool IDs/arguments against Awwab-owned schemas and an allowlist;
- persist a user-scoped plan/job state and append an audit event;
- return planned or a typed failure, never executed;
- expose no arbitrary shell, browser, filesystem, or generic-code tool.

### Required invariants

1. The model cannot set the authoritative user ID, scopes, approval result or job ownership.
2. Invalid, unknown or out-of-scope tools are rejected before any tool execution.
3. The plan-only slice has no side-effect execution path.
4. Stored job/plan reads are scoped to the authenticated owner on the server, not just hidden in the UI.
5. A retry cannot create duplicate durable records or repeat external side effects; use idempotency keys where writes are introduced.
6. Errors are typed and sanitized; secrets, raw credentials and unnecessary personal context are not placed in logs.
7. A job records status transitions and correlation IDs sufficient to diagnose failures.

### Durable work and recovery

Do not assume a single callable invocation is suitable for long-running research or automation. Start with bounded calls and measure actual limits. If durable execution is needed, introduce an explicit worker/job boundary with lease/attempt semantics, idempotent transitions, cancellation and recovery tests. Choose a separate worker service only when evidence shows Cloud Functions is unsuitable; avoid premature infrastructure splitting.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
