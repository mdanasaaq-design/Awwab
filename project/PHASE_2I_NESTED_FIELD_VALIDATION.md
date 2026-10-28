# Phase 2I — Validate Project/Task List Elements and References

**Status:** Blocked pending a reproducible Rules-emulator fix  
**Phase:** 2 — Foundation security and environment validation  
**Risk:** AWW-014  
**Scope:** Firestore Rules and emulator tests only

## Problem

Phase 2G validates top-level project/task fields, enums, and timestamp integrity, but list fields are only checked to be lists. Project tags and repository references can therefore contain malformed elements, and a task's optional `projectId` is not verified against a project owned by the same user.

## Acceptance criteria

- [ ] `tags` is a list of at most 5 strings; each string is at most 64 characters.
- [ ] `repositoryReferences` is a list of at most 5 strings; each string is at most 500 characters.
- [ ] Nested objects, numbers, and oversized strings in either list are rejected.
- [ ] A task may omit `projectId` or set it to null.
- [ ] A non-null `projectId` must be a string naming an existing project under the same user's `/users/{uid}/projects` hierarchy.
- [ ] Missing and cross-user project references are rejected.
- [ ] Valid owner project/task CRUD and previous Rules tests remain green.
- [ ] The complete CI suite passes on the implementation commit.
- [ ] Current status, task list, data model, and risk register record evidence and remaining limits.
- [ ] No live Rules deployment or other production change occurs.

## Implementation constraints

- Use bounded, explicit list-element checks that stay within Firestore Rules expression limits. A prior branch experiment exceeded the 1,000-expression evaluation budget when checking too many list positions; the initial safe cap is five entries per field.
- Preserve owner scoping, default deny, existing field allowlists, immutable creation timestamps, and task source-provenance constraints.
- This change does not define deep URL validation or a complete task status-transition graph. Any backend executor must validate project/task content and policy independently.

## Investigation note — 2026-10-28

- A direct port of the stale PR #16 implementation was attempted on `main`, with tests for malformed list elements, list bounds, and same-user project references.
- The Firestore Rules emulator rejected valid project writes with evaluation errors in the new validation helper. A second attempt using static list indexes did not resolve the failure.
- The unverified Rules/test edits were reverted to the previously verified baseline in commits [ee12ffd](https://github.com/mdanasaaq-design/Awwab/commit/ee12ffdece44765e0a7e85c57e65e139dd37a0a7) and [4c88064](https://github.com/mdanasaaq-design/Awwab/commit/4c88064260251b6fbea2c1d9eeefa65effa6afbc). No live Rules deployment occurred.
- Do not mark this phase complete. Reproduce the emulator failure in a controlled local branch, isolate which expression causes evaluation errors, and rerun the full Rules suite before retrying.

## Verification plan

Run the existing Firestore Rules emulator suite and the full CI workflow. Tests must include valid list values, malformed element types, overlong entries, excessive item counts, valid same-user project references, missing references, cross-user references, and tasks without a project.

## Non-goals

No UI changes, callable API changes, assistant execution, live data writes, Rules deployment, billing changes, or backend provisioning.
