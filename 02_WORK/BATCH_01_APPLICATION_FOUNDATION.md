# Awwab — Development Batch 1: Application Foundation

**Date:** 2026-09-10
**Status:** Approved for implementation
**Priority:** P0

## Objective
Build the secure, maintainable application foundation for Awwab without implementing the AI assistant or advanced life-management features yet.

## Technical Stack
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase + PostgreSQL + Supabase Auth
- Provider-agnostic internal AI service boundary; no AI provider integration in this batch
- Responsive web application/PWA-first approach

## In Scope
1. Create the initial Next.js + TypeScript application structure.
2. Establish a clean, modular project structure suitable for the documented Awwab architecture.
3. Build the initial Awwab application shell:
   - responsive layout
   - navigation/sidebar
   - main home screen
   - clean Awwab visual foundation
   - current date/time presentation
   - placeholder assistant area for future conversation functionality
   - profile/settings entry points
4. Add light/dark theme support.
5. Integrate Supabase safely on the server/client boundaries appropriate to each use.
6. Implement authentication with protected application routes.
7. Establish the initial user/profile data model and database migration/schema needed by this batch.
8. Enforce user data ownership and authorization at the database/application boundary.
9. Configure environment variables and secrets safely. No secrets or private keys may be committed.
10. Implement appropriate loading, empty, error, and authentication states.
11. Add baseline automated tests appropriate to the implemented functionality.
12. Run production build and relevant tests/checks before declaring completion.

## Out of Scope
- AI/LLM integration
- Chat/conversation implementation
- Long-term memory
- Tasks and task management
- Calendar/reminders
- Habits or analytics
- Study/college/UPSC/work/finance/fitness/Islamic domain modules
- Voice/wake word
- External integrations
- Proactive automation/background jobs
- Native mobile or desktop applications
- Production-scale observability beyond what is required for this foundation

## Requirements
- Follow the latest `CLAUDE.md`, master plan, product specification, and architecture documentation.
- Inspect the repository before changing anything.
- Do not introduce unnecessary dependencies or architecture complexity.
- Keep business/domain logic separate from UI where practical.
- Never expose private credentials/API keys to the client.
- Authentication alone is not authorization; verify ownership for protected data.
- Use secure database policies/RLS where supported and appropriate.
- Validate trust-boundary inputs.
- Do not fabricate user profile information or successful actions.
- The application must remain usable on desktop and mobile-sized screens.
- Do not implement features outside this batch without explicit approval.

## Acceptance Criteria
- A fresh checkout can be installed and run using documented setup steps.
- The application loads the Awwab shell without runtime errors.
- Unauthenticated users cannot access protected application content.
- Authenticated users can access their own profile foundation and cannot access another user's protected data.
- Database schema/migrations are reproducible.
- No secrets are committed to Git.
- Light/dark themes work correctly.
- Responsive layout works at common desktop and mobile widths.
- Loading/error/empty states exist where needed.
- Automated tests relevant to the batch pass.
- Production build passes.
- Claude updates relevant status/changelog/decision documentation and reports exactly what was tested.

## Implementation Rule
Claude must first inspect the repository and latest documentation, then implement this batch incrementally. If an architectural conflict or important ambiguity is discovered, stop and report it rather than silently expanding or changing scope.

## Suggested Commit
`feat: build Awwab application foundation`
