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
- **Decision:** Use Next.js + TypeScript for the application, Tailwind CSS + shadcn/ui for the UI, Supabase/PostgreSQL for primary data and authentication, and an internal provider-agnostic AI service layer. Start as a responsive web application/PWA.
- **Reason:** Awwab needs a strong foundation for structured personal data, authentication, AI/tool orchestration, tasks, schedules, memories, conversations, and future integrations. PostgreSQL is better suited than a document-first database for these interconnected entities.
- **Alternatives considered:** Firebase/Firestore; a custom separate backend from the start; provider-specific AI architecture.
- **Consequences:** The first implementation can stay relatively simple while preserving a path to more advanced agent, automation, voice, and integration capabilities. Supabase and the initial AI provider must remain behind application-level interfaces where practical to reduce unnecessary vendor lock-in.
