# Phase 2I — Validate Project/Task List Elements and References

**Status:** Implementation committed; CI validation pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-nested-field-validation`  
**Risk:** AWW-014

## Problem

Phase 2G validates top-level project/task fields, enums, and timestamp integrity. It only checks that `tags` and `repositoryReferences` are lists, however, and a task's `projectId` is not verified against a project owned by the same user.

## Intended change

- Validate that project tags are strings of at most 64 characters, with at most 5 entries.
- Validate that repository references are strings of at most 500 characters, with at most 5 entries.
- Require any non-null task `projectId` to reference an existing project document under the same `/users/{uid}` hierarchy.
- Keep project references optional and allow tasks without a project.
- Add Rules emulator tests for malformed list elements, list bounds, invalid references, and valid references.
- Keep the existing owner CRUD policy and all other collection permissions unchanged.

## Acceptance criteria

- [ ] Tags must be a list of at most 5 strings, each at most 64 characters.
- [ ] Repository references must be a list of at most 5 strings, each at most 500 characters.
- [ ] Nested objects, numbers, or oversized strings in those lists are rejected.
- [ ] A task may omit `projectId` or set it to null.
- [ ] A non-null `projectId` must be a string naming an existing project under the same user's hierarchy.
- [ ] Missing or cross-user project references are rejected.
- [ ] Existing valid project/task CRUD and all previous Rules tests remain green.
- [ ] Current status, task list, data model, and risk register record the result.
- [ ] No deployment is performed.

## Implementation record

- Rules: `firestore.rules` validates project tag/reference list element types and maximum lengths, plus same-user existence for non-null task project references.
- Tests: `tests/firestore.rules.test.js` covers valid lists, nested non-string entries, oversized items, over-limit lists, valid/missing/cross-user project references, and project-less tasks.
- CI result: pending for the current branch.

## Test plan

The first emulator run exposed Firestore Rules' 1,000-expression evaluation limit when validating 20 list positions across two fields. The bounded list limit is therefore five entries per field in this version; the test suite verifies that the rule evaluation remains below the limit.


Use the Firestore Rules emulator. Test valid lists, invalid list element types, oversized list items, over-limit list counts, a task referencing an existing project, a task without a project, and tasks referencing missing/other-user project IDs.

## Remaining limits

This does not add deep URL validation, detailed task state-transition graphs, or server-side execution trust. Projects/tasks remain user-owned data; backend executors must still validate content and policy independently.
