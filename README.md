# Awwab

Awwab is a personal AI operating assistant intended to help with planning, research, memory, projects, tools, automation, and follow-through under user control.

## Current reality

**Implementation maturity:** Early foundation; assistant capabilities are not production-complete.  
**Next product phase:** Refine the web command center first, then harden the foundation.  
**Hosting:** Live Hosting has an existing release (last listed release: 2026-10-16); temporary preview channel `awwab-check` was refreshed on 2026-10-27. No production deployment was performed as part of the repository-organization pass.

The web interface includes sign-in and device-management UI. The assistant runtime is not connected, and the composer remains disabled. Projects, tasks, research, automations, and activity are placeholders without live data.

Use these terms consistently:
- **Implemented** — present in the repository.
- **Validated** — exercised with observed evidence.
- **Planned** — designed but not implemented.
- **Proposed** — an option requiring a decision.
- **Blocked** — waiting on an external dependency or decision.

A successful build proves the checked code compiles and bundles; it does not prove production security or end-to-end behavior.

## Product promise

Awwab should understand outcomes, recover relevant context, plan multi-step work, use least-privilege tools, ask for approval before sensitive actions, verify important results, explain failures, and offer useful follow-through without becoming noisy.

## Target clients

- **Web/laptop:** primary command center for conversation, research, projects, tasks, approvals, automation, and developer workflows.
- **Android:** first-class mobile assistant for quick actions, voice/text, notifications, Today, and approvals.
- **Future surfaces:** voice-first and desktop/system integrations only when they provide real value.

## Non-negotiable principles

- Security before autonomy; user control over consequential actions.
- Least privilege; no secrets in clients or source control.
- Never claim success without evidence.
- Never treat model confidence as authorization.
- Treat retrieved content and tool output as untrusted data.
- Prefer deterministic code for permissions and state transitions.
- Make important decisions observable and auditable.
- Build incrementally and optimize for user value, reliability, and maintainability.

## Planning source of truth

- [Master Plan and Work Audit](project/MASTER_PLAN.md) — current audit of planned vs completed work, backend billing blocker, detailed phased sequence, acceptance gates, and explicit no-deploy constraints.

## Documentation map

### Product and architecture
- [Product requirements](docs/prd.md)
- [Architecture](docs/architecture.md)
- [Agent system](docs/agent-system.md)
- [Capabilities and permissions](docs/capabilities.md)
- [AI strategy](docs/ai-strategy.md)

### Security and data
- [Security model](docs/security.md)
- [Threat model](docs/threat-model.md)
- [Data model](docs/data-model.md)
- [Authentication and session model](docs/auth-session.md)
- [Engineering rules](docs/rules.md)

### Design, validation, and operations
- [Design direction](docs/design.md)
- [Testing strategy](docs/testing.md)
- [Evaluation framework](docs/evaluation.md)
- [Firebase setup](docs/firebase-setup.md)
- [Repository structure and naming conventions](docs/repository-structure.md)
- [Windows desktop cleanup and synchronization](docs/desktop-cleanup.md)
- [Roadmap](docs/roadmap.md)

### Agent runtime research and handoff
- [Open-source reuse catalogue and integration plan](docs/OPEN_SOURCE_REUSE_CATALOG.md)\n- [Agent runtime and reuse strategy](docs/agent-runtime-research.md)
- [New-chat handoff and next bounded task](project/NEW_CHAT_HANDOFF.md)

### Project tracking
- [Current status](project/CURRENT_STATUS.md)
- [Detailed phase plan](project/PHASE_PLAN.md)
- [Tasks](project/TASKS.md)
- [Issues and risks](project/ISSUES_AND_RISKS.md)
- [Architecture decisions](project/DECISIONS.md)

## Current next steps

1. Read the [Master Plan and Work Audit](project/MASTER_PLAN.md) before starting new implementation.
2. Reconcile the extracted ZIP and actual Git clone; do not assume local edits exist on GitHub.
3. Finish manual command-center UX acceptance checks and record evidence.
4. Keep Firebase on the current plan; Cloud Functions deployment is blocked by the Blaze requirement. Do not retry deployment or provision an alternative backend until the architecture comparison is approved.
5. Implement no new assistant execution until the backend, authentication, device trust, data ownership, and test gates pass.
6. Treat production release as a separate phase requiring explicit owner authorization.
\n\n## Open-source reuse strategy (2026-10-30)\n\nAwwab reuses, adapts and maintains selected open-source code inside its own codebase. It does not become a wrapper around another agent or AI provider. Awwab owns product identity, policies, data boundaries and its randomly initialized model. See [the detailed repository catalogue and phased integration plan](docs/OPEN_SOURCE_REUSE_CATALOG.md).\n