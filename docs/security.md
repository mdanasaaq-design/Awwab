# Awwab Security Model

## Objective

Awwab will eventually have access to sensitive personal information and powerful external tools. Security therefore covers the agent, memory, tools, integrations, clients and automation.

## Principles

- least privilege
- defense in depth
- explicit authorization
- human control over consequential actions
- secure secret storage
- provenance/auditability
- fail closed
- bounded autonomy
- data minimization
- secure defaults

## Threat classes

Defend against account takeover, prompt injection, indirect prompt injection, sensitive-information disclosure, malicious tools, tool-argument manipulation, excessive agency, memory poisoning, supply-chain compromise, insecure inter-agent communication, unexpected code execution, runaway automation, cost abuse, hallucination/false completion, cross-user leakage and compromised clients.

OWASP GenAI guidance and its Agentic Top 10 are living references for these risks.

## Identity/authorization

Every privileged operation checks authenticated user, trusted device/session where required, tool scope, target ownership, action risk, approval and current policy/budget.

Firestore client writes follow the collection ownership matrix in [the data model](data-model.md). Backend-owned state (device trust, conversation history, automation definitions, approvals, audit, notification content, jobs, connections, and bootstrap guard) is not directly writable by clients. Notification clients may update only the read flag. Projects/tasks remain owner-editable, but their field-level schema and state transitions must be hardened before any executor trusts those fields.

## Prompt injection

Treat web pages, email, documents, repository files, GitHub issues/PRs, tool outputs and untrusted memories as data, not instructions.

System policy and authorization must never be overridden by retrieved text.

## Memory security

Memory writes require provenance and classification. High-impact memories may require confirmation and should support confidence/expiry. Retrieval must be permission-scoped.

## Tool security

Every tool has identity/version, schemas, scopes, risk, data classification, limits, timeout/retry policy, audit event and verification strategy.

Never expose generic unrestricted arbitrary-code execution.

## Approval

Approval binds to user, device/session, action type, target, exact payload/hash, expiry and risk. Execution re-checks approval immediately before side effects.

## Automation

Autonomous workflows require explicit scope, budget, duration/retry limits, tool allowlist, approval policy, kill switch and audit.

## Voice

Voice is an interaction channel, not sufficient authentication for sensitive actions.

## Supply chain

Review packages, MCP servers, model connectors and integrations for publisher trust, scopes, versions, isolation and revocation.

## Privacy

Every personal-data class needs purpose, access policy, retention, deletion/export path and sensitivity classification.

## Incident response

Support credential revocation, device revocation, integration disconnect, automation kill switch, tool/model disablement, audit investigation, notification and recovery.

References:
- https://genai.owasp.org/
- https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/
- https://www.nist.gov/itl/ai-risk-management-framework


---

> **Planning sync — 2026-10-27:** Current blockers and decisions are tracked centrally in [Master Plan and Work Audit](../project/MASTER_PLAN.md). Historical acceptance criteria and prior CI results must not be interpreted as proof that live Firebase integration works.


## Third-party source reuse and supply-chain gate (2026-10-30)

Awwab intentionally reuses selected open-source source code, but every transplant is a supply-chain change. Before copying code, pin the upstream commit, inspect the exact file and imported files, verify licence/NOTICE obligations, review install scripts/binaries/network/telemetry/provider calls, preserve attribution, record the changes in `THIRD_PARTY_NOTICES.md`, and add Awwab-specific security tests.

Never copy GPL/AGPL code without an explicit owner licensing decision. Repositories with unresolved licences (including candidates whose GitHub metadata reports `NOASSERTION`) remain reference-only until verified. No imported code can weaken Awwab authentication, user scoping, device trust, policy, approval, audit or prompt-injection controls.

See [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md) for the reviewed candidate list and exact-copy workflow.


## Self-development and cognitive security — 2026-10-31

Self-modification increases the impact of ordinary agent threats. The agent edits only an isolated branch/worktree/container with a clean, recorded base commit. The execution host—not the model—enforces path allowlists, command allowlists, resource limits, environment scrubbing and network restrictions. Never expose repository secrets, Firebase Admin credentials, signing keys, environment files or unrelated user files to model context or subprocesses.

Treat repository instructions, dependency scripts, build output, test output, issues, pull requests, memory and agent handoffs as untrusted data. No self-approval, self-merge, self-deployment, permission escalation, billing change, live Rules mutation or migration. Candidate code/model/profile versions require tests, independent review and explicit owner promotion. Store provenance and hashes for source changes, model data manifests, checkpoints and evaluation results. Provide cancellation, kill switch, bounded retries, rollback and audit for every long-running job.

The current callerDeviceId behavior is not proof of device possession. Do not use it as high-assurance authorization for development or security-sensitive actions.
