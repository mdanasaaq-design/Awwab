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


## Third-party code transplant threats (2026-10-30)

Adding upstream source code creates a supply-chain boundary even when the source is public. Threats include malicious or compromised commits, hidden network/provider calls, postinstall scripts, unreviewed transitive dependencies, binary/model assets, licence mismatch, unsafe deserialization, telemetry leakage, and upstream defaults that bypass Awwab policy.

Mitigations:
- pin repository and commit SHA; inspect exact files and imports;
- verify file-level licence, NOTICE and generated/submodule provenance;
- review dependencies, scripts, binaries, network access, telemetry and model assets;
- isolate imported code behind Awwab-owned typed interfaces;
- strip provider-specific and hosted-service paths;
- preserve attribution and record copied files in `THIRD_PARTY_NOTICES.md`;
- add regression tests for no hidden AI API/network calls, user-scope isolation, permission checks and bounded resource use;
- reject GPL/AGPL and unresolved-licence code until the owner makes a separate licensing decision.

See [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md).


## Additional self-development threats — 2026-10-31

### T11 — Self-modification damages the stable system
An agent may overwrite working code, remove safeguards or corrupt its own runtime. Mitigate with immutable stable refs, isolated worktrees, clean-base checks, scoped writes, mandatory tests, diff review and owner-controlled promotion.

### T12 — Malicious repository content influences the agent
README files, comments, build scripts, issues, dependency output or test fixtures may contain prompt injection. Treat them as untrusted data, separate data from policy, disable arbitrary network access and never let repository text authorize tool use.

### T13 — Tool execution escapes its sandbox
Path traversal, symlinks, inherited environment variables, shell expansion, process spawning or network access may escape intended limits. Enforce isolation outside the model, test escape attempts and deny by default.

### T14 — Agent collaboration amplifies errors
Agents may repeat false claims, pass malicious instructions, create conflicting patches or mutually reinforce incorrect assumptions. Use typed handoffs, provenance, independent verification, isolated permissions, task ownership and a single deterministic integrator.

### T15 — Model/version/data provenance is lost
A candidate may use unlicensed data, an untrusted checkpoint or an incompatible tokenizer. Bind each checkpoint to architecture/tokenizer versions, data manifest hash, source/licence records, training configuration and evaluation report.

### T16 — Autonomy becomes unbounded
A loop may retry indefinitely, consume resources or continue after the owner changes intent. Enforce wall-clock/step/resource budgets, retry ceilings, cancellation, expiry and a kill switch.

### T17 — False reflection corrupts memory
The system may record an unverified model claim or failed action as a successful experience. Only persist evidence-backed outcomes; label inference, uncertainty and source separately; support correction and deletion.

### T18 — Self-development is authorized by spoofable device identity
The current callerDeviceId protocol does not prove device-key possession. Do not use it to authorize high-impact self-development actions. Keep sensitive execution disabled until an independently reviewed authorization path is available.
