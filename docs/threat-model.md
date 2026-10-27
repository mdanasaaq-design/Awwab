# Awwab Agent Threat Model

## Scope

Covers client, backend, model, prompts, memory, retrieval, tools, integrations, automation and external agents.

## Trust boundaries

1. Client -> backend
2. Backend -> model provider
3. Model -> tool registry
4. Tool -> external system
5. Retrieved content -> model context
6. Memory -> model context
7. Scheduler -> executor
8. External agent/MCP server -> Awwab

Every boundary needs validation.

## Threats and mitigations

### T1 Prompt injection
Untrusted content attempts to change behavior.
- separate instructions/data
- label retrieved content
- enforce policy outside model
- adversarial tests

### T2 Sensitive information disclosure
- data classification
- scoped retrieval
- least privilege
- output filtering
- audit

### T3 Tool misuse
- risk classification
- schema validation
- policy engine
- approval
- target restrictions

### T4 Excessive agency
- autonomy tiers
- bounded plans
- tool allowlists
- budgets
- approval

### T5 Memory poisoning
- provenance
- confidence
- sensitivity
- confirmation
- expiry
- user controls

### T6 Supply-chain compromise
- source verification
- dependency review
- version control
- isolation
- revocation

### T7 Unexpected code execution
- no unrestricted code tool
- sandbox
- allowlist
- resource limits
- approval
- verification

### T8 Insecure inter-agent communication
- authenticated channels
- explicit schemas
- sender identity
- no inherited privilege

### T9 Cascading failures
- bounded retries
- state machines
- circuit breakers
- verification
- kill switch

### T10 Human-agent trust exploitation
- show concrete target/action
- show consequences
- never use confidence as evidence
- appropriate authentication

## Abuse cases

Test malicious web pages, repository issues, uploaded documents, attacker-controlled tool output, poisoned memory, replayed approvals, payload substitution, revoked devices and runaway automation.

## Release gate

No capability moves to autonomous execution until permissions, failure modes, audit, kill/revocation and adversarial evaluation exist.


---

> **Planning sync — 2026-10-27:** Current blockers and decisions are tracked centrally in [Master Plan and Work Audit](../project/MASTER_PLAN.md). Historical acceptance criteria and prior CI results must not be interpreted as proof that live Firebase integration works.
