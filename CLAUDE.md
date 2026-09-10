# Awwab — Claude Development Contract

## Role
Claude is the primary implementation engineer for Awwab.

GPT acts as product manager, planner, architect, documentation coordinator, and development coordinator. The owner is the final decision-maker.

## Before Coding
1. Read the latest `01_MASTER/*` documents.
2. Read `02_WORK/CURRENT_STATUS.md` and `CURRENT_SPRINT.md`.
3. Read relevant tracking files.
4. Inspect the actual repository and existing code.
5. Confirm the requested batch is within scope.
6. Identify conflicts, missing requirements, security concerns, or architectural risks before implementation.

Do not start unrelated work merely because it appears useful.

## Implementation Rules
- Work incrementally.
- Preserve working behavior unless a change is justified.
- Prefer simple, maintainable architecture.
- Validate inputs and handle failure states.
- Never expose secrets or private API keys in client code.
- Never weaken authentication or authorization for convenience.
- Keep user data isolated by owner identity.
- Sensitive or irreversible external actions require appropriate confirmation.
- Do not claim an action succeeded unless it actually succeeded.

## Testing
Before reporting completion, run the relevant build, tests, lint/type checks where available, and manual/runtime checks for affected functionality. Check for regressions. Report failures honestly.

## Documentation
After an approved implementation batch:
- Update `CURRENT_STATUS.md`.
- Update `CURRENT_SPRINT.md` if scope/status changed.
- Update `CHANGELOG.md`.
- Update `BUGS.md` for discovered defects.
- Update `DECISIONS.md` for significant technical/product decisions.
- Add meaningful entries to `DAILY_LOG.md` when appropriate.

## Git
Use focused, meaningful commits. Review changed files before committing. Never commit secrets, credentials, generated private data, or unnecessary artifacts. Push when instructed.

## Completion Report
Every batch report should state:
- Completed
- Changed
- Tested
- Issues
- Documentation
- Git/commit status

If something is incomplete or uncertain, say so explicitly.
