# Awwab — Architecture

## Architectural Direction
Awwab should be modular and layered so the assistant brain can evolve without coupling every feature to the UI.

## Logical Layers
1. **Presentation** — web/app UI, conversation interface, dashboards, settings, responsive interaction.
2. **Assistant Core** — intent/context handling, response orchestration, action planning, confirmations.
3. **Memory** — conversational history, structured profile/preferences, long-term memory, retrieval and relevance rules.
4. **Planner** — tasks, goals, schedules, priorities, constraints, conflict detection, daily planning.
5. **Domain Modules** — study, work, finance, fitness, Islamic routine, notes/documents, and future configurable modules.
6. **Tool/Integration Layer** — external APIs and services behind explicit permission boundaries.
7. **Persistence** — authenticated user data, structured records, audit/activity history, backups where appropriate.

## Security Model
- Authenticate every protected session.
- Authorize every data access by owner identity and resource ownership.
- Keep secrets server-side; never ship private API keys in client code.
- Validate inputs at trust boundaries.
- Use least-privilege integration permissions.
- Require confirmation for sensitive, external, financial, destructive, or irreversible actions as appropriate.
- Record important automated actions for auditability.

## Data Principles
- User-owned data must have a clear owner identifier.
- Structured records should be queryable independently of chat transcripts.
- Memory should distinguish durable facts from temporary conversation context.
- Deletions and retention behavior must be intentional and documented.
- Avoid storing unnecessary sensitive information.

## Agent/Tool Boundary
The reasoning layer decides what should happen; tools perform bounded operations. Tool calls must have explicit schemas, validation, permission checks, and useful error results. External side effects should be distinguishable from read-only operations.

## Reliability Principles
- Prefer deterministic application logic for critical state changes.
- AI should not silently invent completed actions or persisted facts.
- Every action should return a clear success/failure result.
- Network/API failures must degrade gracefully.
- Important workflows should be testable without relying on an LLM response being identical every time.

## Technology Decisions
Technology choices are intentionally not frozen here until the foundation requirements and constraints are reviewed. Proposed choices must be recorded in DECISIONS.md with rationale and alternatives considered.
