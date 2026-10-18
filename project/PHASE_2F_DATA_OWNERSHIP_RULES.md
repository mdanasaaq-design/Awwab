# Phase 2F — Firestore Collection Ownership and Narrow Client Mutations

**Status:** Acceptance criteria recorded before implementation  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-data-ownership-matrix`  
**Risk:** AWW-007 and AWW-014

## Problem

Several collections allow broad owner CRUD even though their schemas and mutation paths are not yet defined. This is especially risky for conversations/messages, memories, automations, preferences, and notifications because future assistant behavior may treat their fields as authoritative. Jobs and connections are documented but intentionally have no client Rules matches.

## Ownership decision matrix

| Collection | Client read | Client create | Client update | Client delete | Reason |
|---|---|---|---|---|---|
| Root profile | Own only | No | No | No | Backend-owned profile and metadata |
| Devices | Own only | No | No | No | Backend-controlled trust state |
| Projects | Own only | Owner only | Owner only | Owner only | User-owned workspace data; schema validation remains a separate follow-up |
| Tasks | Own only | Owner only | Owner only | Owner only | User-owned work data; schema validation remains a separate follow-up |
| Conversations | Own only | No | No | No | Backend must own conversation metadata and assistant history |
| Messages | Own only | No | No | No | Prevent clients from forging assistant/tool messages; backend persists the conversation |
| Memories | Own only | No | No | Own only | Backend controls provenance/classification; owner retains deletion control |
| Automations | Own only | No | No | No | Definitions may cause side effects; require validated backend mutation path |
| Approvals | Own only | No | No | No | Backend-controlled approval state |
| Activity | Own only | No | No | No | Backend-controlled audit trail |
| Preferences | Own only | No | No | No | Keep read-only until preference schema and mutation contract exist |
| Notifications | Own only | No | Only `read` boolean | No | Backend controls content and delivery metadata |
| Jobs, connections, system guard | No client access | No | No | No | Backend-only; default deny |

The root profile, device, approval, activity, and bootstrap-guard decisions are already implemented in prior phases. This slice changes only the collection policies called out below and adds regression tests.

## Intended change

- Make conversations and messages client-read-only.
- Make memories owner-readable and owner-deletable, but backend-created/updated.
- Make automations and preferences client-read-only.
- Restrict notification updates to changing only the boolean `read` field; clients cannot alter title/content/targets or create/delete notifications.
- Keep projects/tasks owner CRUD for now, but explicitly mark their field/schema validation as outstanding before any backend executor trusts their contents.
- Add Rules tests for allowed owner reads/deletes and denied client mutations, plus notification read-flag-only updates.
- Document that default deny for jobs/connections/system is intentional.

## Acceptance criteria

- [ ] Owner can read their own conversations/messages, memories, automations, preferences, and notifications.
- [ ] Client create/update/delete of conversations/messages is denied.
- [ ] Client create/update of memories is denied; owner delete succeeds.
- [ ] Client create/update/delete of automations and preferences is denied.
- [ ] Notification owner can change `read` from false to true/false.
- [ ] Notification update attempts that change title, content, target, or any field other than `read` fail.
- [ ] Client cannot create/delete notifications.
- [ ] Cross-user reads and writes remain denied.
- [ ] Projects/tasks owner CRUD remains unchanged in this slice; their field-level schema risk stays open and is documented.
- [ ] Firestore Rules emulator tests and all CI jobs pass.
- [ ] Data model, security model, current status, tasks, and risk register reflect the ownership matrix.
- [ ] No deployment is performed.

## Test plan

Use the existing Firestore Rules emulator suite. Seed backend-owned records with Rules disabled, then test owner reads and forbidden mutations. Test allowed owner memory deletion and notification `read` updates. Explicitly test that updating a notification's `title` while changing `read` fails.

## Non-goals

No project/task schema restrictions, new mutation callables, assistant runtime, or production deployment.
