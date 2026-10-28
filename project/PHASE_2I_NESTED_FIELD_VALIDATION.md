# Phase 2I — Validate Project/Task List Elements and References

**Status:** Implementation, create/update regression tests, and full CI verified on isolated branch; awaiting owner/reviewer decision  
**Phase:** 2 — Foundation security and environment validation  
**Risk:** AWW-014  
**Scope:** Firestore Rules and emulator tests only

## Problem

Phase 2G validates top-level project/task fields, enums, and timestamp integrity, but list fields are only checked to be lists. Project tags and repository references can therefore contain malformed elements, and a task's optional `projectId` is not verified against a project owned by the same user.

## Acceptance criteria

- [x] `tags` is a list of at most 5 strings; each string is at most 64 characters.
- [x] `repositoryReferences` is a list of at most 5 strings; each string is at most 500 characters.
- [x] Nested objects, numbers, and oversized strings in either list are rejected.
- [x] A task may omit `projectId` or set it to null.
- [x] A non-null `projectId` must be a string naming an existing project under the same user's `/users/{uid}/projects` hierarchy.
- [x] Missing and cross-user project references are rejected.
- [x] Non-string project references (number/object) are rejected on task creation; numeric project-reference updates are also rejected.
- [x] Valid owner project/task CRUD and previous Rules tests remain green.
- [x] The complete CI suite passes on the implementation commit.
- [x] Current status, task list, data model, and risk register record evidence and remaining limits.
- [ ] No live Rules deployment or other production change occurs.

## Implementation constraints

- Use bounded, explicit list-element checks that stay within Firestore Rules expression limits. A prior branch experiment exceeded the 1,000-expression evaluation budget when checking too many list positions; the initial safe cap is five entries per field.
- Preserve owner scoping, default deny, existing field allowlists, immutable creation timestamps, and task source-provenance constraints.
- This change does not define deep URL validation or a complete task status-transition graph. Any backend executor must validate project/task content and policy independently.

## Investigation and verification — 2026-10-28

- A direct port of the stale PR #16 implementation was attempted on `main`, with tests for malformed list elements, list bounds, and same-user project references.
- The Firestore Rules emulator rejected valid project writes with evaluation errors in the new validation helper. A second attempt using static list indexes did not resolve the failure.
- The unverified Rules/test edits were reverted to the previously verified baseline in commits [ee12ffd](https://github.com/mdanasaaq-design/Awwab/commit/ee12ffdece44765e0a7e85c57e65e139dd37a0a7) and [4c88064](https://github.com/mdanasaaq-design/Awwab/commit/4c88064260251b6fbea2c1d9eeefa65effa6afbc). No live Rules deployment occurred.
- The isolated branch now uses a bounded explicit-index helper with short-circuit guards. The first task-reference run exposed a missing `uid` argument on the update path; this was corrected in commit [e8a2d1c](https://github.com/mdanasaaq-design/Awwab/commit/e8a2d1c3d3d5fcc6862dc164485c0039835fc619). CI run [40694648586](https://github.com/mdanasaaq-design/Awwab/actions/runs/40694648586) passed all four jobs, including Firestore Rules emulator tests. This evidence applies to the isolated branch only; it is not merged or deployed. Subsequent regression tests now exercise task project-reference changes on update (valid same-owner project accepted; missing and cross-user references rejected). The follow-up task-update tests were verified in full CI run [40695884479](https://github.com/mdanasaaq-design/Awwab/actions/runs/40695884479), which passed all four jobs. Additional malformed-type tests for numeric/object project references have now been added and verified in full CI run [40696376085](https://github.com/mdanasaaq-design/Awwab/actions/runs/40696376085).

## Verification plan

Run the existing Firestore Rules emulator suite and the full CI workflow. Tests must include valid list values, malformed element types, overlong entries, excessive item counts, valid same-user project references, missing references, cross-user references, non-string references, and tasks without a project. The task-reference cases must be exercised on both create and update paths.

## Non-goals

No UI changes, callable API changes, assistant execution, live data writes, Rules deployment, billing changes, or backend provisioning.


## Verified implementation details

- `validStringList` checks list type, maximum size, and each of up to five entries as a string within the field-specific length limit.
- Task `projectId` validation checks existence under the authenticated owner's project collection; it does not accept another user's same-named project.
- Empty lists and lists at the five-item cap are accepted. Malformed element types, overlong entries, and six-item lists are rejected by emulator tests.
- The core emulator test suite and all four CI jobs passed on implementation commit `e8a2d1c3d3d5fcc6862dc164485c0039835fc619`. Follow-up task project-reference update tests passed all four jobs in [full CI run 40695884479](https://github.com/mdanasaaq-design/Awwab/actions/runs/40695884479). Additional numeric/object malformed-reference tests were added in [commit adb295b](https://github.com/mdanasaaq-design/Awwab/commit/adb295b7ff966b714e0eb729c42c19ea5cb21e14) and verified in [full CI run 40696376085](https://github.com/mdanasaaq-design/Awwab/actions/runs/40696376085), which passed all four jobs. Live Rules remain unchanged.
- Review the isolated branch and PR #21 before deciding whether to merge. Keep the branch unmerged until the owner/reviewer approves this security-policy change.
