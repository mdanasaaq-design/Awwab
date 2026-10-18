# Awwab

Awwab is a personal AI operating assistant intended to help with planning, research, memory, projects, tools, automation, and follow-through under user control.

## Current reality

**Implementation maturity:** Early foundation; assistant capabilities are not production-complete.  
**Next product phase:** Refine the web command center first, then harden the foundation.  
**Deployment:** Not performed.

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
- [Roadmap](docs/roadmap.md)

### Project tracking
- [Current status](project/CURRENT_STATUS.md)
- [Detailed phase plan](project/PHASE_PLAN.md)
- [Tasks](project/tasks.md)
- [Issues and risks](project/ISSUES_AND_RISKS.md)
- [Architecture decisions](project/DECISIONS.md)

## Current next steps

1. Review the documentation and phase plan.
2. Begin a bounded web command-center UX change with acceptance criteria written before editing UI code.
3. Then harden profile Rules, device concurrency, DTO contracts, callable tests, and development-environment validation.
4. Connect the assistant only after the relevant security gates pass.
5. Treat production release as a separate phase requiring explicit owner authorization.
