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
- **Application:** Next.js + TypeScript.
- **UI:** Tailwind CSS + shadcn/ui.
- **Data/Auth platform:** Supabase, using PostgreSQL as the primary database and Supabase Auth for authentication.
- **AI:** Provider-agnostic internal AI service layer; the initial provider can be selected independently without coupling the core domain architecture to it.
- **Client strategy:** Responsive web application/PWA first; native mobile/desktop applications remain future options.
- **Background jobs:** Add a durable managed job/scheduling system when proactive reminders and automation require it; do not introduce one before the first batch needs it.
- **Validation/testing:** Use typed boundaries and automated unit/integration/end-to-end testing appropriate to each feature.

### Why this stack
This combination gives Awwab a strong foundation for structured personal data, authentication, AI/tool orchestration, calendar/task relationships, and future integrations while keeping the initial system manageable. PostgreSQL is preferred over a document-first database because Awwab will eventually need interconnected, queryable entities such as tasks, goals, schedules, memories, conversations, projects, and actions.

The architecture remains modular: Supabase, the AI provider, and individual integrations are infrastructure components behind application-level interfaces rather than assumptions embedded throughout the product.
