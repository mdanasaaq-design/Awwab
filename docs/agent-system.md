# Awwab Agent System

## Purpose

Define how Awwab turns a natural-language request into a safe, useful outcome.

## Current implementation boundary

The first code slice is a provider-neutral plan validator and policy preflight in `backend/functions/src/agent-core.ts`. It validates a bounded, versioned plan and derives tool risk/approval requirements from a trusted backend allowlist. It does not call a model, retrieve user context, persist state, or execute tools. CI passed for the current branch in run [39125085569](https://github.com/mdanasaaq-design/Awwab/actions/runs/39125085569), but the change is still in a draft PR and is not an enabled assistant runtime.

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
