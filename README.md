# Awwab

Awwab is a personal AI operating assistant: a secure, context-aware system designed to make the user's work easier by understanding goals, planning work, researching, remembering useful context, operating approved tools, and proactively helping with follow-through.

Awwab is not intended to be a thin chatbot wrapper. The long-term target is a reliable personal agent platform with strong memory, planning, tool use, automation, multimodal interaction, project intelligence, and human-controlled execution.

## Current reality

**Phase:** Foundation — Security and Agent Architecture  
**Documentation target:** 10/10 blueprint  
**Implementation maturity:** foundation only; assistant capabilities are not yet production-complete

Every document must distinguish:
- **Implemented** — present in the repository.
- **Validated** — exercised with observed evidence.
- **Planned** — designed but not implemented.
- **Proposed** — an option requiring a decision.
- **Blocked** — waiting on an external dependency or decision.

## Product promise

For a meaningful request, Awwab should progressively be able to:
1. Understand the desired outcome.
2. Recover relevant context.
3. Decide whether research, planning or tool use is useful.
4. Build an executable plan for multi-step work.
5. Use the minimum necessary tools with least privilege.
6. Ask clarification only when it materially changes the outcome.
7. Ask approval before sensitive actions.
8. Execute approved work with bounded retries.
9. Verify important results.
10. Explain results, failures and next steps.
11. Learn durable preferences only with appropriate provenance.
12. Proactively surface useful actions without becoming noisy.

## Target clients

- **Web/laptop:** primary command center for conversation, research, projects, tasks, approvals, automation and developer workflows.
- **Android:** first-class mobile assistant for quick actions, voice/text, notifications, Today view and approvals.
- **Future surfaces:** voice-first and desktop/system integrations only when they provide real value.

## Core capability pillars

1. Assistant core — conversation, intent, planning and reasoning.
2. Personal context — profile, preferences, goals and durable memory.
3. Knowledge/research — web, files, citations and synthesis.
4. Work execution — tasks, projects, documents, coding and controlled tools.
5. Automation — scheduled/event-driven workflows with permissions and recovery.
6. Proactivity — useful reminders, risk detection and follow-up.
7. Multimodal interaction — text, voice, files and images.
8. Trust and safety — identity, permissions, approvals, audit, privacy and cost controls.
9. Evaluation — quality, factuality, tool correctness, security, latency and cost.

## Architecture at a glance

```
Clients
  Web / Android / future voice
        |
        v
Identity + Device Trust + App Integrity
        |
        v
Awwab Assistant Runtime
        |
        +--> Context & Memory
        +--> Planner / Orchestrator
        +--> Model Router
        +--> Research / Retrieval
        +--> Tool Registry + Policy
        +--> Approval / Confirmation
        +--> Execution + Verification
        +--> Activity / Evaluation
        |
        v
Scoped integrations
  GitHub / Web / Files / Calendar / Notifications / Android / future tools
```

The current Firebase foundation remains the implementation baseline, while models and integrations remain replaceable.

## Non-negotiable principles

- Security before autonomy.
- User control over consequential actions.
- Least privilege everywhere.
- No secrets in clients or source control.
- Never claim success without evidence.
- Never treat model confidence as authorization.
- Never let untrusted retrieved content silently redefine policy.
- Prefer deterministic code for deterministic work.
- Use models where reasoning, language or perception adds value.
- Make important decisions observable and auditable.
- Build incrementally.
- Optimize for user value, reliability and maintainability.

## Source of truth

The Git repository is the source of truth. Inspect the latest code and docs before planning implementation. Claude is the primary implementation agent; GPT provides product, architecture, planning and review direction.

## Documentation map

- `docs/prd.md` — product requirements
- `docs/architecture.md` — system architecture
- `docs/agent-system.md` — agent runtime
- `docs/capabilities.md` — capabilities and permissions
- `docs/ai-strategy.md` — model/provider strategy
- `docs/security.md` — security model
- `docs/threat-model.md` — agent threat model
- `docs/data-model.md` — persistent data
- `docs/auth-session.md` — identity/device trust
- `docs/evaluation.md` — agent evaluation
- `docs/testing.md` — engineering validation
- `docs/design.md` — UX direction
- `docs/firebase-setup.md` — environments
- `docs/rules.md` — engineering rules
- `docs/roadmap.md` — phased delivery
- `project/CURRENT_STATUS.md` — verified state
- `project/tasks.md` — backlog
- `project/DECISIONS.md` — decisions
