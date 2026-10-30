# Awwab Data Model

## Goals

- Strong per-user isolation.
- Backend control over security-sensitive state.
- Provenance for durable memory.
- No secrets or raw provider credentials in Firestore.
- Explicit retention and deletion behavior.
- Predictable query patterns.

## Core hierarchy

```
/users/{uid}
/users/{uid}/devices/{deviceId}
/users/{uid}/projects/{projectId}
/users/{uid}/tasks/{taskId}
/users/{uid}/conversations/{conversationId}
/users/{uid}/conversations/{conversationId}/messages/{messageId}
/users/{uid}/memories/{memoryId}
/users/{uid}/approvals/{approvalId}
/users/{uid}/automations/{automationId}
/users/{uid}/activity/{activityId}
/users/{uid}/preferences/{preferenceId}
/users/{uid}/notifications/{notificationId}
/users/{uid}/jobs/{jobId}
/users/{uid}/connections/{connectionId}
/users/{uid}/system/firstDeviceBootstrap
```

## User

displayName, email, photoUrl, createdAt, updatedAt, status, timezone, locale.

**Ownership contract:** the root profile document is backend-controlled. Authenticated clients may read their own profile, but direct client create/update/delete is denied by Firestore Rules. The current web client initializes profiles through the validated `ensureUserProfile` callable; no profile-edit UI or direct client write is supported. If editable fields are introduced later, add a validated callable or a narrowly allowlisted Rules policy and tests rather than restoring broad document writes.

## Device

deviceId, platform, appVersion, deviceName, createdAt, lastSeenAt, status, trustedAt, revokedAt, notificationTokenStatus.

## Project

Fields: `name`, `description`, `repositoryReferences`, `status`, `tags`, `createdAt`, `updatedAt`.

- Required client fields: `name`, `status`, `createdAt`, `updatedAt`.
- Name is 1–160 characters; description is optional and at most 4,000 characters.
- Status is `active` or `archived`.
- Tags and repository references are optional lists, each bounded to 20 entries. The current Rules do not validate each element's type or length; treat these lists as untrusted metadata and do not feed them into backend actions.
- Create timestamps must use server timestamps; `createdAt` is immutable and `updatedAt` must be a server timestamp on update.
- Projects are archived/restored rather than hard-deleted. Rules deny client project deletion so tasks cannot be left with dangling project references.

## Task

Client-writable fields: `title`, `description`, `status`, `priority`, `dueAt`, `projectId`, `createdAt`, `updatedAt`, `completedAt`, `source`.

- Required: `title`, `status`, `priority`, `createdAt`, `updatedAt`, `source`.
- Title is 1–200 characters; description is optional and at most 4,000 characters.
- Status is `todo`, `in_progress`, `done`, `blocked`, or `cancelled`; priority is `low`, `medium`, `high`, or `urgent`.
- Client-created tasks must use `source: "user"`; source cannot be changed later.
- Create timestamps must use server timestamps; `createdAt` is immutable and `updatedAt` must be a server timestamp on update.
- Client-created tasks start in `todo`; `completedAt` must be null or omitted until completion.
- A task in `done` state must have a timestamp `completedAt`. Transitioning into `done` sets it to `request.time`; edits to an already-done task preserve the original completion time. Leaving `done` clears it to null.
- A task may omit `projectId` or set it to null. A non-null value must be a string naming an existing project under the same user's `/users/{uid}/projects` collection; create and update are both checked by `exists()` in Rules. Client project deletion is denied; use archive/restore to preserve references.
- `recurrence` is not client-writable until its schema and allowed transitions are defined.

Tasks should preserve provenance between user commitments and AI suggestions. Same-user project-reference integrity, non-deletable project lifecycle, and completion timestamp consistency are implemented on the development branch and covered by emulator tests; the matching Rules are not deployed to Firebase. List element validation and a more granular status-transition policy remain follow-ups; no backend executor may trust unvalidated metadata until those contracts are enforced.

## Conversation/message

Conversation:
- title
- timestamps
- archived
- summaryReference

Message:
- role
- content
- createdAt
- model
- toolCallReference
- provenance
- attachments
- safetyMetadata

Assistant/tool messages must be distinguishable from user-authored messages.

## Memory

Fields:
- type
- content
- source/sourceReference
- confidence
- importance
- sensitivity
- createdAt/updatedAt
- expiresAt
- userVisible
- confirmedByUser

Classes:
- explicit preference
- stable profile fact
- goal/commitment
- project context
- learned preference
- temporary context
- derived inference

Derived inferences must not silently become high-confidence sensitive facts.

## Automation

name, enabled, trigger, conditions, actionDefinition, timezone, permissionScope, lastRunAt, nextRunAt, timestamps.

Definitions are not credentials.

## Approval

actionType, riskLevel, description, exactPayloadHash, requestedAt, expiresAt, status, requestedByDeviceId, approvedAt, approvedByDeviceId, executionId, resultSummary.

Approval binds to the exact action.

## Job

jobType, status, requestedAt, startedAt, completedAt, cancellationRequestedAt, progress, attemptCount, correlationId, resultReference, failureCode.

## Connection

provider, accountReference, scopes, status, createdAt, lastValidatedAt, revokedAt.

Do not store raw access tokens in ordinary application documents.

## Activity/audit

eventType, actorType, actorId, deviceId, tool, action, targetType, targetReference, outcome, createdAt, correlationId, policyDecision, approvalId.

Audit history is backend-controlled and append-oriented.

## Firestore client mutation matrix

- **Backend-write-only:** root profile, devices, conversations/messages, automations, preferences, approvals, activity, notifications content, jobs, connections, and the system bootstrap guard.
- **Owner read/delete plus constrained create/update:** memories are owner-readable and owner-deletable; create is limited to `user_explicit`, while update requires `user_corrected`, with strict schema, sensitivity and confirmation checks.
- **Owner read plus narrow update:** notifications are owner-readable and the client may change only the boolean `read` field.
- **Projects:** owner read/create/update; hard delete denied. Archive/restore is the supported lifecycle.
- **Tasks:** owner read/create/update/delete with field allowlists, immutable provenance, owner-scoped project references, and completion timestamp consistency. Fine-grained status-transition policy and unvalidated list metadata remain follow-ups. Backend automation must not treat client-written fields as trusted beyond the enforced contract.
- **No client access:** jobs, connections, and system guard paths rely on the default-deny Rules.

This matrix is enforced by `firestore.rules`; Rules tests are the executable source for each allowed and denied mutation.

## Data lifecycle

Every new personal-data class must define purpose, access, mutation, retention, deletion, export, sensitivity and whether it can influence autonomous actions.

Cloud Functions Admin SDK bypasses Firestore Rules, so privileged functions require their own authorization checks.

The `/users/{uid}/system/firstDeviceBootstrap` document is a backend-only concurrency guard. It records that the one-time first-device bootstrap has been claimed; clients cannot read or write it through Firestore Rules.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.


## Memory algorithm reuse (2026-10-30)

Awwab may adapt deterministic memory candidate merge, deduplication, conflict and temporal-provenance algorithms from Mem0/Graphiti. These algorithms must map onto the existing Awwab user-scoped Firestore hierarchy and preserve explicit confirmation, sensitivity, provenance, expiry, correction and deletion controls. Do not import provider adapters or vector stores as a side effect. See [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md).


## Task/project reference security update — 2026-10-30

- `validTask(data, uid)` now requires every non-null `projectId` to resolve under `/users/{uid}/projects/{projectId}`. Both task create and update paths pass the owning UID into the validator.
- Emulator regressions cover a valid same-owner project, null project, missing project, cross-user project, and create/update reference changes.
- This is a repository-branch change only. CI is pending for commit `6284409`; live Firestore Rules have not been deployed. Keep task-to-project linking disabled in the UI until review/merge and explicit live Rules deployment.


## Workspace lifecycle and state-integrity hardening — 2026-10-30

- Project hard deletion is denied in Rules and removed from the workspace UI; archive/restore preserves task references.
- Task completion state is internally consistent: new tasks start `todo`; `done` requires `completedAt`; entering `done` stamps server request time; edits preserve the timestamp; reopening clears it.
- Emulator tests cover denied project deletion, successful read after denied deletion, valid completion, edits to completed tasks, forged completion timestamps, reopening, and invalid completion state.
- This is branch-only until review, merge and explicit Rules deployment.


## Device registration and audit transaction contract — 2026-10-30

- Device registration now reads and creates/updates the user-scoped device document inside a Firestore transaction.
- The matching `device_registered` or `device_seen` activity event is created in the same transaction as the device mutation. Concurrent retries for one device ID should result in one initial registration event and subsequent seen events, not an `ALREADY_EXISTS` race.
- User profile initialization also reads and creates/updates the profile inside one transaction to avoid concurrent first-sign-in races.
- The device ID remains a caller-supplied identifier. It is not a proof of possession. A second authenticated session for the same UID can claim a trusted ID in the current callable protocol. See [the device backend security review](../project/DEVICE_BACKEND_SECURITY_REVIEW.md).
- The local Ed25519 challenge prototype is not connected to this data model. Do not use device status as a high-assurance authorization boundary until server-side proof-of-possession and atomic challenge consumption are implemented.
- These changes are branch-only source/emulator work. Firebase Functions remain undeployed on Spark; no billing change or deployment occurred.
