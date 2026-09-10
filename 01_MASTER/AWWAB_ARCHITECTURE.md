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
- **Data/Auth platform:** Firebase Authentication + Cloud Firestore as the primary authentication and database platform; Firebase Hosting for the web application deployment target.
- **Storage:** Firebase Storage may be introduced later when Awwab needs user-uploaded files or media and the selected Firebase plan supports the required usage.
- **AI:** Provider-agnostic internal AI service layer; the initial provider can be selected independently without coupling the core domain architecture to it.
- **Client strategy:** Responsive web application/PWA first.
- **Spark-phase runtime constraint:** While Awwab is intentionally kept on Firebase's no-cost Spark plan, the Next.js application will be implemented as a static/client-side application. Do not introduce SSR, Server Actions, Next.js API routes, server runtime dependencies, or other features that require Firebase Cloud Functions/App Hosting or paid Google Cloud infrastructure.
- **Background jobs:** Add a durable managed job/scheduling system when proactive reminders and automation require it; do not introduce one before the first batch needs it. Avoid paid Google Cloud infrastructure while the project is intended to remain on Firebase's no-cost Spark plan.
- **Validation/testing:** Use typed boundaries and automated unit/integration/end-to-end testing appropriate to each feature.

### Why this stack
This combination gives Awwab a practical foundation for structured personal data, authentication, AI/tool orchestration, calendar/task relationships, and future integrations while keeping the initial system manageable for a personal project. Cloud Firestore is intentionally chosen over introducing a separate PostgreSQL service at this stage because Awwab is initially a single-user personal assistant and Firebase provides authentication, database, hosting, and security tooling in one platform with a no-cost Spark plan. The initial web application deliberately avoids Next.js server-side runtime features so it can remain compatible with Firebase Hosting and the Spark plan.

This is a phase constraint, not a permanent limitation on Next.js. If a future Awwab capability genuinely requires server-side execution, backend secrets, AI API calls, webhooks, scheduled jobs, or other server infrastructure, that change must be handled as an explicit architectural decision before implementation. Options may include upgrading Firebase to Blaze, introducing another backend, or changing the deployment architecture.

The architecture remains modular: Firebase, the AI provider, and individual integrations are infrastructure components behind application-level interfaces rather than assumptions embedded throughout the product.
