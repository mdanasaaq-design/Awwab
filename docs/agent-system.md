# Awwab Agent System

**Target design:** an Awwab-owned bounded agent runtime. Current implementation is still a plan-only assistant boundary; no developer agent or tool executor is live.

## Agent lifecycle

```
REQUEST → IDENTITY/GOAL → CONTEXT → PERCEPTION → REASONING
        → PLAN → POLICY/APPROVAL → EXECUTE → VERIFY
        → REFLECT → MEMORY/AUDIT → RESPOND
```

The lifecycle is bounded by step, time, resource and tool budgets. It supports cancellation and typed failure states.

## Cognitive inputs

- Versioned Awwab identity/constitution.
- Current user request and conversation.
- Active goal, task and project.
- Relevant working, episodic, semantic, procedural and development memory.
- Observed repository/runtime/tool state.
- Explicit user constraints and permission state.

Never retrieve all personal data by default. Every context item retains provenance, sensitivity and trust classification.

## Plan contract

A plan records objective, assumptions, missing information, steps, dependencies, required tools, expected outputs, risk, approval, budget, verification criteria and rollback approach. Simple requests should not be over-planned. Unknown or unsupported capabilities must be surfaced rather than invented.

## Single-agent-first rule

Build and evaluate one Developer agent before introducing a team. The first agent must inspect a repository read-only, explain architecture and evidence-backed issues, produce a bounded plan, create an isolated branch/worktree, edit only scoped files, run allowlisted tests, diagnose failures with bounded retries, and produce a diff/evidence report.

It cannot merge, deploy, alter live security policy, change billing, access secrets, or grant itself permissions.

## Tool contracts

Every tool declares stable ID/version, input/output schema, scope, risk, data classification, allowed workspace, timeout, retry budget, idempotency, cancellation, audit event and verification method. The model proposes; deterministic policy authorizes. No arbitrary shell or generic code-execution tool is exposed.

## Self-development workflow

Owner command → understand objective and constraints → inspect repository/development memory → create plan → create isolated workspace from known base → edit scoped files and generate diff → run targeted tests and required checks → diagnose failures with bounded retries → prepare candidate and rollback instructions → owner reviews.

The stable branch is never the agent's scratchpad. A failed run is recorded and discarded/revised, not silently promoted.

## Multi-agent design (later phase)

Initial roles: Architect, Researcher, Developer, Tester, Security Reviewer and Release Reviewer. These are role profiles sharing Awwab's own model at first—not separate neural models. Each run has a task ID, bounded context, isolated workspace, explicit tools and budget. Agents communicate through typed handoff artifacts, not unrestricted shared memory.

Start sequentially. Add parallelism only for independent tasks after proving isolation, conflict detection, cancellation, deterministic integration and measurable throughput/quality gains. An agent cannot approve another agent's privileged action or treat its output as trusted policy.

## Approval and autonomy levels

0 answer; 1 recommend; 2 prepare/draft; 3 reversible low-risk execution; 4 exact-action owner-approved high-impact execution; 5 scheduled bounded autonomy. Default to the lowest useful level. Approval binds to exact action, target, payload digest, scope and expiry and is rechecked immediately before execution.

## Failure and verification

Classify invalid input, missing context, model unavailable, policy rejection, authorization failure, tool unavailable, timeout, transient/permanent error, partial failure and verification failure. Retry only safe/idempotent transient work. Absence of an exception is not proof of success. Verify repository state after Git actions and test output after commands.

## Security boundary

Retrieved content, memory, code comments, repository instructions, model output, browser pages, terminal output and other agents' messages are untrusted data. They cannot override policy, reveal secrets or expand scope.
