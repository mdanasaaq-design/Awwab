# Current Sprint

## Sprint: Foundation
**Status:** Ready for Batch 1 implementation

### Objective
Establish a shared product and engineering source of truth, finalize the initial technical direction, and prepare the first approved implementation batch.

### Work Items
- [x] Create GitHub repository
- [x] Define master vision and development strategy
- [x] Define product capabilities
- [x] Define initial architecture and security principles
- [x] Review and approve foundation documents
- [x] Decide initial technical stack
- [x] Resolve Spark-compatible Next.js/Firebase deployment direction
- [x] Define first implementation batch
- [x] Send approved implementation batch to Claude

### Approved Technical Stack
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase Authentication + Cloud Firestore
- Firebase classic/static Hosting during the Spark phase
- Provider-agnostic internal AI service layer
- Responsive web/PWA first
- Keep the initial project on Firebase's no-cost Spark plan
- Next.js must remain static/client-side during the Spark phase; no SSR, Server Actions, API routes, or server-runtime dependencies

### Approved Batch
`02_WORK/BATCH_01_APPLICATION_FOUNDATION.md`

### Out of Scope
No AI assistant, memory, tasks, calendar, integrations, voice, or other advanced product features until their respective batches are approved.
