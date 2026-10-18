# Phase 2G — Project and Task Field-Level Rules

**Status:** Implementation committed; CI validation pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-project-task-rules`  
**Risk:** AWW-014 (P1)

## Problem

Projects and tasks remain owner CRUD, but current Rules allow arbitrary fields, values, and client-controlled timestamps. Future assistant/tool code must not treat those records as trusted, and user data needs a documented schema boundary.

## Contract for this slice

### Projects

Allowed fields: `name`, `description`, `repositoryReferences`, `status`, `tags`, `createdAt`, `updatedAt`.

- Required: `name`, `status`, `createdAt`, `updatedAt`.
- `name`: non-empty string, maximum 160 characters.
- `description`: optional string, maximum 4,000 characters.
- `status`: `active` or `archived`.
- `tags`: optional list, maximum 20 entries.
- `repositoryReferences`: optional list, maximum 20 entries.
- `createdAt` and `updatedAt`: timestamps; client writes must use server timestamps. On update, `createdAt` is immutable and `updatedAt` must equal request time.

### Tasks

Allowed client fields: `title`, `description`, `status`, `priority`, `dueAt`, `projectId`, `createdAt`, `updatedAt`, `completedAt`, `source`.

- Required: `title`, `status`, `priority`, `createdAt`, `updatedAt`, `source`.
- `title`: non-empty string, maximum 200 characters.
- `description`: optional string, maximum 4,000 characters.
- `status`: `todo`, `in_progress`, `done`, `blocked`, or `cancelled`.
- `priority`: `low`, `medium`, `high`, or `urgent`.
- `dueAt`, `projectId`, and `completedAt`: optional timestamp/string values as appropriate, or null.
- `source`: client create must set `user`; updates cannot change the existing source, preserving provenance.
- `createdAt` and `updatedAt`: same server-timestamp rules as projects.
- `recurrence` remains non-client-writable until its schema and allowed transitions are specified.

The list fields are bounded and top-level types are checked here; their element schemas and cross-document project/task consistency remain explicit follow-ups. No backend executor may trust these fields until those validations exist.

## Acceptance criteria

- [ ] Owner can create, read, update, and delete a valid project.
- [ ] Project writes reject unexpected fields, empty/oversized names, invalid status, wrong optional-field types, and client-forged timestamps.
- [ ] Project updates cannot change `createdAt`; `updatedAt` must be a server timestamp.
- [ ] Owner can create, read, update, and delete a valid task.
- [ ] Task writes reject unexpected fields, empty/oversized titles, invalid status/priority, invalid optional-field types, client-forged timestamps, and unsupported `recurrence`.
- [ ] Task create requires `source: "user"`; updates cannot change source.
- [ ] Cross-user project/task reads and mutations remain denied.
- [ ] Existing owner CRUD behavior for valid project/task records remains available.
- [ ] Firestore Rules emulator tests and all CI jobs pass.
- [ ] Data model, current status, task list, and risk register document remaining nested-field and cross-document validation gaps.
- [ ] No deployment is performed.

## Implementation record

- Rules: `firestore.rules` now validates project/task allowed keys, required fields, size/type limits, enums, server timestamps, immutable creation timestamps, and task source provenance.
- Tests: `tests/firestore.rules.test.js` includes valid writes plus negative cases for malformed fields, unsupported recurrence, forged timestamps, and cross-user access.
- CI result: pending for the current branch.

## Test plan

Extend `tests/firestore.rules.test.js` with valid server-timestamp fixtures and positive/negative project/task writes. Use the emulator to test immutable creation timestamps, invalid enums, unexpected fields, unsupported recurrence, and cross-user isolation.

## Non-goals

No project/task UI, backend mutation callable, scheduler, assistant execution, or production deployment.
