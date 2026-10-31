# Awwab

Awwab is an independent personal AI operating assistant intended to help with planning, research, memory, projects, development tools, automation and follow-through under owner control.

## Current reality — 2026-10-31

Awwab has a web foundation, Firebase sign-in UI, user-controlled memory, bounded Wikipedia/Crossref research, project/task workspace code, an activity view, plan-output validation, and an independent Model Lab scaffold. The development branch's latest documented CI run passed all six jobs.

**Awwab is not yet a capable conversational assistant or self-developing agent.** Its own model is untrained and generation remains disabled. There is no integrated cognitive core, repository-aware developer, safe code-execution loop, version-evolution manager, multi-agent orchestration, or scheduled autonomy. Firebase Functions are not deployed on the current Spark plan; device trust has a confirmed P0 limitation.

## Product direction

Build Awwab's own persistent cognitive architecture—identity, memory, goals, reasoning, planning, perception, action, reflection and evaluation—independently of a specific Awwab model checkpoint. Then give it a safe development loop so it can inspect, modify, test and prepare new versions of its own code under the owner's direction.

“Own mind” means an engineered cognitive architecture, not a claim of consciousness.

## Non-negotiable principles

- Awwab remains a standalone product with its own policies, data boundaries and model.
- Its model starts from random initialization. No external AI APIs, third-party pretrained weights, hosted agent runtimes, teacher-model distillation or silent fallback.
- Reuse selected deterministic open-source engineering code only after exact-file licence, dependency, security, attribution and test review.
- Keep the $0 constraint. No paid APIs/compute, billing upgrade, new cloud resources, secrets, large downloads or deployment without explicit approval.
- Least privilege, owner control, isolated experiments, auditable changes and verified rollback.
- Never claim success without observed evidence.

## Planning source of truth

- [Self-Development Master Plan](project/SELF_DEVELOPMENT_MASTER_PLAN.md) — controlling architecture, roadmap and acceptance gates.
- [Pending Work Audit](project/PENDING_WORK_AUDIT.md) — completed work, open work, blockers and Markdown audit.
- [Current Status](project/CURRENT_STATUS.md) — implementation and validation snapshot.
- [Tasks](project/TASKS.md) — active work queue.
- [Issues and Risks](project/ISSUES_AND_RISKS.md) — unresolved risks and release gates.
- [New Chat Handoff](project/NEW_CHAT_HANDOFF.md) — continuation instructions.

## Development workflow

Inspect → plan → reuse reviewed code → implement in an isolated scope → test → security review → document → present evidence. Awwab may prepare changes independently, but merge, release, deployment, billing, secrets, live Rules and migrations require explicit owner approval.

See [architecture](docs/architecture.md), [agent system](docs/agent-system.md), [AI strategy](docs/ai-strategy.md), and [roadmap](docs/roadmap.md).
