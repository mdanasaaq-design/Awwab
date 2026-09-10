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
- **Decision:** Use the private Awwab GitHub repository as the shared source of truth for product and development documentation and, later, application code.
- **Reason:** GPT and Claude need a stable shared project state.
- **Alternatives:** Separate local/project documents; chat-only coordination.
- **Consequences:** Documentation must stay current and commits should remain understandable.

### 2026-09-10 — Incremental development
- **Decision:** Build Awwab in small, testable batches rather than attempting the full JARVIS vision at once.
- **Reason:** Reduces risk and makes failures easier to isolate.
- **Consequences:** Long-term features remain planned but are implemented only when their dependencies are ready.
