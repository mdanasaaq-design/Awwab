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
