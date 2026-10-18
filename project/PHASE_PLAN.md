# Awwab Phase Plan

**Status:** Planning baseline  
**Last reviewed:** 2026-10-18  
**Repository baseline:** `main` at `cffb22b829e76a859dd3029e482abd10e8314af5`  
**Scope of this change:** Documentation only. No application code, build, test run, Firebase change, or deployment is part of this plan.

## Mission

Build Awwab into a dependable personal AI operating assistant. The product should help the user understand, remember, plan, research, organize, and execute work while keeping consequential actions under explicit user control.

## Planning rules

1. **Redesign the command center first; harden the foundation next.** This honors the product priority while keeping new privileged behavior disconnected until its safety gates pass.
2. Never represent a placeholder, planned capability, or mock result as working functionality.
3. Separate implemented, validated, planned, proposed, and blocked work.
4. Keep the GitHub repository as the source of truth. Preserve the separate local extracted copy until its differences have been reviewed; local folder cleanup is not a product milestone.
5. Prefer one bounded change per implementation pull request, with acceptance criteria written before editing application code.
6. No production deployment until a separate release checklist is complete and the owner explicitly authorizes deployment.
7. Do not begin autonomous execution, broad computer control, or scheduled agent actions while foundation security and verification gates remain open.

## Current baseline

- Web command-center shell exists, with sign-in and device-management UI.
- Assistant input is deliberately disabled; the assistant runtime is not connected.
- Projects, tasks, research, automations, and activity views are placeholders without live data.
- Firebase Authentication client initialization, optional App Check initialization, Firestore rules, and device-management callables exist.
- Android currently has a minimal native shell; feature parity and build validation are not established.
- A local web production build passed on 2026-10-18. CI checks for web, functions/shared types, and Firestore rules passed on PR #3 before it was merged on 2026-10-16.
- Real Firebase end-to-end validation, backend callable tests, Android validation, and production readiness are not established by those results.

See [Current Status](CURRENT_STATUS.md), [Tasks](tasks.md), and [Issues and Risks](ISSUES_AND_RISKS.md) for the evidence and tracked work.

## Phase sequence

### Phase 0 — Planning and evidence baseline (documentation)

**Goal:** Make project status, risks, priorities, and acceptance criteria consistent before implementation.

**Scope**
- Maintain this phase plan and a single issue/risk register.
- Update current status and tasks from observed evidence.
- Keep the top-level README documentation map accurate.
- Preserve the distinction between CI evidence, local evidence, and unverified behavior.

**Acceptance criteria**
- [ ] Every documented current capability is labelled as implemented and/or validated with evidence.
- [ ] Unverified runtime, emulator, Android, and production behavior is explicitly called out.
- [ ] Tasks have clear priorities and do not mark unexecuted checks complete.
- [ ] Each implementation phase has observable exit criteria.
- [ ] The plan does not imply that code, builds, tests, or deployment were performed as part of this documentation change.

### Phase 1 — Web command-center UX (first product implementation phase)

**Goal:** Deliver the intended interface: information-dense, calm, powerful, keyboard-friendly, and clearly honest about capability state.

**Scope**
- Review the existing visual hierarchy, navigation, spacing, typography, density, status language, and responsive behavior.
- Establish a small design-token/component baseline rather than adding decorative complexity.
- Define consistent loading, empty, unavailable, error, success, and confirmation states.
- Improve keyboard navigation, visible focus, semantic controls, contrast, scalable text, and reduced-motion behavior.
- Keep Assistant, Projects, Tasks, Research, Automations, Activity, Settings, and device trust easy to understand.
- Keep non-connected views visibly non-functional until their workflows exist; do not add fake metrics or pretend live data.
- Consider a command/search palette and keyboard shortcuts only after the core navigation is coherent.

**Out of scope**
- Connecting an LLM, enabling tool execution, changing Firestore rules, enabling production services, or deploying.
- Large design-system dependencies without a clear need.

**Acceptance criteria**
- [ ] The command center communicates what works, what is unavailable, and what is planned without misleading labels.
- [ ] Primary navigation and important actions are usable by keyboard with visible focus and sensible focus order.
- [ ] Layout is reviewed at narrow mobile, tablet, and desktop widths; no core content or controls are clipped.
- [ ] Empty, loading, error, disabled, and device-status states are consistently designed.
- [ ] Text contrast, semantic labels, scalable text, and reduced-motion preferences are reviewed.
- [ ] The visual direction avoids generic chatbot patterns, fake terminal aesthetics, noisy dashboards, and gratuitous animation.
- [ ] A bounded UI change has explicit screenshots/manual review criteria before implementation.
- [ ] No new privileged or external side effects are enabled in this phase.

**Implementation slice:** [Phase 1 keyboard navigation acceptance criteria and test checklist](PHASE_1_IMPLEMENTATION.md).

**Exit gate:** Owner accepts the UX direction and the interface's behavior/state specification. Any automated visual/accessibility checks that are added must be reported with observed results.

### Phase 2 — Foundation security and environment validation

**Goal:** Prove that identity, device trust, data boundaries, and backend state transitions behave safely before real assistant execution is introduced.

**Scope**
- Restrict client-writable profile fields and protect backend-owned metadata.
- Make first-device bootstrap safe under concurrent requests.
- Make last-trusted-device revocation safe under concurrent requests.
- Align shared TypeScript contracts with actual callable request/response DTOs.
- Add backend callable tests for authentication, malformed inputs, device registration, bootstrap, approval, revocation, profile initialization, and audit events.
- Expand Firestore Rules tests for protected profile fields, cross-user access, and intended client/backend ownership of collections.
- Run the full documented validation suite against the emulator and record exact outcomes.
- Establish and validate a dedicated development Firebase environment; keep development and production separate.
- Review App Check configuration and staged enforcement, Auth provider configuration, billing alerts, and secrets handling.
- Confirm the local Node version matches the repository's Node 22 baseline for reproducible validation.

**Acceptance criteria**
- [ ] Client users cannot modify protected profile fields or backend-owned security state.
- [ ] Concurrent bootstrap attempts cannot create multiple first trusted devices.
- [ ] Concurrent revocations cannot remove every trusted device.
- [ ] Every privileged callable independently authenticates and checks device/action authorization as appropriate.
- [ ] Shared contracts match backend DTOs and are covered by tests.
- [ ] Emulator rules and callable tests pass, including negative and concurrency cases where applicable.
- [ ] Development Firebase works end-to-end without production data or secrets.
- [ ] App Check rollout and enforcement decisions are documented with observed client behavior.
- [ ] Test results and unresolved risks are recorded; no claim relies only on a successful web bundle.

**Exit gate:** Security review accepts the data-write boundary and device lifecycle; local/emulator evidence is recorded; critical foundation risks are closed or explicitly accepted by the owner.

### Phase 3 — Assistant Core v0 (bounded and observable)

**Goal:** Connect the assistant through a narrow, testable request pipeline without unrestricted tool execution.

**Scope**
- Define versioned request/response contracts and structured error states.
- Add an authenticated backend assistant endpoint.
- Add a provider-neutral model interface and basic routing policy.
- Persist conversations/messages with clear role, source, and provenance boundaries.
- Select only relevant context.
- Represent multi-step plans structurally.
- Add a versioned allowlisted tool registry, policy decision, approval gate, bounded execution, verification, and activity trace/correlation IDs.
- Connect the web composer only when the endpoint and failure states are real.

**Acceptance criteria**
- [ ] Unauthenticated and unauthorized requests are rejected server-side.
- [ ] Inputs/outputs are schema-validated and errors are safe and actionable.
- [ ] The model cannot grant itself permissions or bypass the policy layer.
- [ ] Tool calls are allowlisted, scoped, bounded, auditable, and verified.
- [ ] Sensitive actions require approval bound to the exact action and payload.
- [ ] A small benchmark of safe tasks passes with evidence; fabricated completion is a hard failure.
- [ ] The UI distinguishes planning, approval, execution, verification, success, failure, and cancellation.
- [ ] No unrestricted shell, computer-use, financial, or security-account actions are exposed.

**Exit gate:** A small set of safe assistant tasks completes end-to-end with reproducible tests, traceable evidence, and no critical safety regression.

### Phase 4 — Personal context and research

**Goal:** Add useful continuity and evidence-based research without uncontrolled memory growth or untrusted-content privilege escalation.

**Scope**
- Memory write policy, provenance, confidence, sensitivity, expiry, confirmation, and user controls.
- Permission-scoped retrieval and context budgets.
- Research retrieval, source extraction/ranking, citations, claim-to-evidence mapping, and uncertainty.
- Prompt-injection isolation for web pages, documents, repository content, and tool outputs.

**Acceptance criteria**
- [ ] Users can inspect, correct, and delete durable memories.
- [ ] Inferences are not silently promoted to sensitive facts.
- [ ] Retrieval is scoped to the current user and task.
- [ ] Research claims can be traced to sources; unsupported claims are labelled uncertain.
- [ ] Memory poisoning and indirect prompt-injection regression tests exist.

**Exit gate:** Memory and research benchmarks meet agreed correctness, privacy, citation, and safety thresholds.

### Phase 5 — Productivity and project intelligence

**Goal:** Make the command center useful for real work rather than placeholder navigation.

**Scope**
- Tasks, Today, due dates, reminders, goals, and follow-up.
- Project context, repository references, decisions, issues/PRs, and development plans.
- User-controlled suggestions with clear source and dismissal controls.
- Real data states, error recovery, and permission-scoped integrations.

**Acceptance criteria**
- [ ] Task/project data is user-scoped and its mutation rules are tested.
- [ ] Suggestions distinguish user commitments from AI recommendations.
- [ ] GitHub changes are proposed as bounded diffs/PRs with acceptance criteria and verification.
- [ ] No task, project status, or repository result is invented when the integration is unavailable.
- [ ] Each view has loading, empty, error, and successful-data states.

**Exit gate:** At least one complete user workflow per shipped capability passes integration tests and can be verified from stored state or external evidence.

### Phase 6 — Tool platform, automation, and proactivity

**Goal:** Add controlled integrations and repeatable workflows only after core execution is reliable.

**Scope**
- Tool scopes, schemas, risk tiers, idempotency, timeout/retry policy, budgets, health, and revocation.
- Durable jobs, scheduler/event triggers, cancellation, bounded retries, kill switch, and execution history.
- Explainable proactive suggestions, relevance thresholds, quiet hours, notification budget, dismiss/snooze/feedback.
- Assess MCP only where interoperability creates concrete value; Awwab policy remains authoritative.

**Acceptance criteria**
- [ ] Each tool has explicit scope, risk, data classification, timeout, retry, idempotency, audit, and verification metadata.
- [ ] Automations have an allowlist, duration/attempt/cost limits, cancellation, and a kill switch.
- [ ] Retries cannot duplicate non-idempotent side effects.
- [ ] High-impact actions require current explicit approval.
- [ ] Proactivity is user-controlled, rate-limited, explainable, and dismissible.
- [ ] Failure, partial completion, and recovery paths are tested.

**Exit gate:** A bounded automation can be cancelled, audited, verified, and safely recovered from failure.

### Phase 7 — Android parity and multimodal interaction

**Goal:** Turn the native Android shell into a first-class client using the same trust and assistant contracts.

**Scope**
- Reproducible Android build/test setup and app lifecycle.
- Firebase Auth, device enrollment/trust, assistant requests, Today, notifications, approvals, and quick actions.
- Voice/STT/TTS, files, and image understanding only when the UX, privacy, permissions, and failure paths are defined.

**Acceptance criteria**
- [ ] Android builds and tests reproducibly in documented tooling.
- [ ] Android uses the shared request/response and authorization model.
- [ ] Device trust, App Check/Play Integrity, notification permissions, and lifecycle cases are tested.
- [ ] Sensitive actions are never authorized by voice alone.
- [ ] Voice/multimodal failures, cancellation, permissions, and data retention are clear to users.

**Exit gate:** Each shipped mobile capability passes device-level tests and the same server-side security gates as web.

### Phase 8 — Release readiness and deployment

**Goal:** Decide whether a tested release is safe to expose to real users and production data.

**Scope**
- Production project separation, backups/recovery, least-privilege IAM, secrets, billing alerts, monitoring, incident response, privacy/retention, and rollback.
- Full release regression, accessibility review, security review, and documented known limitations.
- Deployment only after explicit owner authorization.

**Acceptance criteria**
- [ ] No open critical security defects or unexplained failing release checks.
- [ ] Web, backend, shared contracts, Firestore Rules, and Android (if included) have recorded passing evidence.
- [ ] Production config and secrets are separate from development.
- [ ] Backup/restore, rollback, monitoring, cost limits, and incident response are exercised or explicitly signed off.
- [ ] Privacy, data export/deletion, retention, and support expectations are documented.
- [ ] Owner explicitly approves the specific production deployment.

**Exit gate:** Release review is complete and the owner authorizes deployment. Documentation work alone never authorizes deployment.

## Cross-phase definition of done

Every shipped change must have:
- a bounded scope and acceptance criteria before editing
- implementation and tests appropriate to risk
- security and failure-path review
- accessible and truthful UI states where relevant
- updated documentation and decision records
- observed verification evidence
- a clear rollback/recovery story for consequential changes

## Explicit non-goals until justified

- unrestricted shell or computer control
- autonomous financial transactions
- self-modifying production code
- autonomous account/security changes
- unbounded background loops
- premature microservices or multi-agent orchestration
