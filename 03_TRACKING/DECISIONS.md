# Decisions

Record important product and technical decisions here.

## Decision Format
- Date
- Decision
- Reason
- Alternatives considered
- Consequences

## Initial Decisions

### 2026-09-10 — GitHub as shared source of truth
- **Decision:** Use the Awwab GitHub repository as the shared source of truth for product and development documentation and, later, application code.
- **Reason:** GPT and Claude need a stable shared project state.
- **Alternatives:** Separate local/project documents; chat-only coordination.
- **Consequences:** Documentation must stay current and commits should remain understandable.

### 2026-09-10 — Incremental development
- **Decision:** Build Awwab in small, testable batches rather than attempting the full JARVIS vision at once.
- **Reason:** Reduces risk and makes failures easier to isolate.
- **Consequences:** Long-term features remain planned but are implemented only when their dependencies are ready.

### 2026-09-10 — Core technology stack
- **Decision:** Use Next.js + TypeScript for the application, Tailwind CSS + shadcn/ui for the UI, Firebase Authentication + Cloud Firestore for authentication and primary data, Firebase Hosting for deployment, and an internal provider-agnostic AI service layer. Start as a responsive web application/PWA.
- **Reason:** Awwab is currently a personal single-user project and should minimize infrastructure complexity and cost. Firebase provides authentication, Firestore database, hosting, and security tooling within one ecosystem, with a no-cost Spark plan suitable for the initial workload.
- **Alternatives considered:** Supabase/PostgreSQL; a custom separate backend from the start; provider-specific AI architecture.
- **Consequences:** Batch 1 will use Firebase rather than Supabase. Domain logic should remain reasonably decoupled from Firebase-specific APIs so a future migration remains possible if Awwab's scale or data-model requirements justify it. Avoid paid Google Cloud infrastructure unless explicitly approved later.
