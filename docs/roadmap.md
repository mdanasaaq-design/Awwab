# Awwab Roadmap

**Last reviewed:** 2026-10-18  
**Detailed plan:** [Project Phase Plan](../project/PHASE_PLAN.md)  
**Current status:** [Current Status](../project/CURRENT_STATUS.md)  
**Issue and risk register:** [Issues and Risks](../project/ISSUES_AND_RISKS.md)

## Strategy

Build the smallest trustworthy system that progressively becomes more capable. The product priority is to refine the web command center first, then harden the foundation before connecting real assistant execution or privileged integrations.

The current web shell is not the finished assistant. The assistant runtime is disconnected, and several workspace sections are placeholders. Do not mistake visual navigation or a successful build for end-to-end product readiness.

## Phase 0 — Planning and evidence baseline

Align current status, tasks, risk register, and acceptance criteria with the latest repository and observed validation. Distinguish local results from CI results and unverified behavior.

**Exit:** Status and backlog are accurate; each phase has acceptance criteria; no unexecuted validation is marked complete.

## Phase 1 — Web command-center UX (first product implementation phase)

Deliver an information-dense, calm, powerful, keyboard-friendly interface with clear hierarchy and honest capability states.

Focus:
- navigation, page hierarchy, visual hierarchy, typography, spacing, and status language
- responsive behavior and keyboard navigation
- accessible focus, semantic controls, contrast, scalable text, and reduced motion
- consistent loading, empty, unavailable, error, success, and confirmation states
- a purposeful design for Assistant, Projects, Tasks, Research, Automations, Activity, and Settings

Do not connect privileged actions or fake live data in this phase.

**Exit:** Owner accepts the UX direction and the interface meets written usability/accessibility criteria.

## Phase 2 — Foundation security and environment validation

Harden profile field ownership, device enrollment/revocation concurrency, shared request/response contracts, callable authorization, Firestore Rules, and development/production separation. Add backend callable tests and validate the real authentication/device lifecycle in a dedicated development environment.

**Exit:** Security-sensitive invariants are tested; emulator and development-environment results are recorded; unresolved critical risks are closed or explicitly accepted.

## Phase 3 — Assistant Core v0

Add an authenticated request pipeline, provider-neutral model interface, scoped context selection, structured plans, allowlisted tools, deterministic policy, approvals, bounded execution, verification, and audit traces.

**Exit:** A small set of safe tasks completes end-to-end with verifiable outcomes, tests, and no critical safety regressions.

## Phase 4 — Personal context and research

Add provenance-aware memory, user controls, permission-scoped retrieval, source-backed research, citations, uncertainty handling, and prompt-injection isolation.

**Exit:** Memory and research evaluation meets agreed privacy, factuality, citation, and safety thresholds.

## Phase 5 — Productivity and project intelligence

Connect tasks, Today, reminders, goals, projects, repository context, decisions, GitHub issues/PRs, and approved development workflows.

**Exit:** Each shipped workflow is backed by real state and can prove success, failure, and recovery.

## Phase 6 — Tool platform, automation, and proactivity

Add versioned tool contracts, scopes, risk classification, budgets, idempotency, durable jobs, cancellation, kill switch, bounded retries, explainable suggestions, and notification controls. Assess MCP only when it solves a concrete interoperability problem.

**Exit:** Automations are bounded, permissioned, auditable, cancellable, and verifiable.

## Phase 7 — Android and multimodal

Establish reproducible Android build/test validation; integrate Auth/device trust and the shared assistant pipeline; then add notifications, approvals, voice, files, and images where user value and safety justify them.

**Exit:** Each shipped mobile capability passes device-level tests and the same server-side security gates as web.

## Phase 8 — Release readiness and deployment

Complete production separation, least-privilege IAM, secrets, billing controls, monitoring, backups/recovery, rollback, privacy/retention, security review, and release regression.

**Exit:** All applicable checks have observed evidence and the owner explicitly authorizes the specific production deployment.

## Cross-phase release gate

A phase is complete only when:
- acceptance criteria are met
- relevant automated/manual tests have observed results
- security and failure paths are reviewed
- documentation and decision records are updated
- limitations and remaining risks are explicit

No unrestricted autonomous execution, financial actions, arbitrary code execution, or production deployment is allowed by roadmap status alone.
