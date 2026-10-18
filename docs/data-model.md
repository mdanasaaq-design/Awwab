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
- Tags are optional lists of at most 20 strings, each at most 64 characters; repository references are optional lists of at most 20 strings, each at most 500 characters.
- Create timestamps must use server timestamps; `createdAt` is immutable and `updatedAt` must be a server timestamp on update.

## Task

Client-writable fields: `title`, `description`, `status`, `priority`, `dueAt`, `projectId`, `createdAt`, `updatedAt`, `completedAt`, `source`.

- Required: `title`, `status`, `priority`, `createdAt`, `updatedAt`, `source`.
- Title is 1–200 characters; description is optional and at most 4,000 characters.
- Status is `todo`, `in_progress`, `done`, `blocked`, or `cancelled`; priority is `low`, `medium`, `high`, or `urgent`.
- Client-created tasks must use `source: "user"`; source cannot be changed later.
- Create timestamps must use server timestamps; `createdAt` is immutable and `updatedAt` must be a server timestamp on update.
- `recurrence` is not client-writable until its schema and allowed transitions are defined.

Tasks should preserve provenance between user commitments and AI suggestions. List element validation, project/task cross-document consistency, and detailed status-transition policy remain follow-ups; no backend executor may trust these fields until those contracts are enforced.

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
- **Owner-readable/deletable:** memories are owner-readable and owner-deletable; memory creation/updates are backend-controlled until provenance and classification validation is implemented.
- **Owner read plus narrow update:** notifications are owner-readable and the client may change only the boolean `read` field.
- **Owner CRUD for now:** projects and tasks remain owner CRUD, but their field-level schemas and allowed state transitions still require a separate hardening pass. Backend automation must not treat client-written fields as trusted until that contract is enforced.
- **No client access:** jobs, connections, and system guard paths rely on the default-deny Rules.

This matrix is enforced by `firestore.rules`; Rules tests are the executable source for each allowed and denied mutation.

## Data lifecycle

Every new personal-data class must define purpose, access, mutation, retention, deletion, export, sensitivity and whether it can influence autonomous actions.

Cloud Functions Admin SDK bypasses Firestore Rules, so privileged functions require their own authorization checks.

The `/users/{uid}/system/firstDeviceBootstrap` document is a backend-only concurrency guard. It records that the one-time first-device bootstrap has been claimed; clients cannot read or write it through Firestore Rules.
