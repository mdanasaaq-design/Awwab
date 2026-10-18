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
```

## User

displayName, email, photoUrl, createdAt, updatedAt, status, timezone, locale.

**Ownership contract:** the root profile document is backend-controlled. Authenticated clients may read their own profile, but direct client create/update/delete is denied by Firestore Rules. The current web client initializes profiles through the validated `ensureUserProfile` callable; no profile-edit UI or direct client write is supported. If editable fields are introduced later, add a validated callable or a narrowly allowlisted Rules policy and tests rather than restoring broad document writes.

## Device

deviceId, platform, appVersion, deviceName, createdAt, lastSeenAt, status, trustedAt, revokedAt, notificationTokenStatus.

## Project

name, description, repositoryReferences, status, tags, createdAt, updatedAt.

## Task

title, description, status, priority, dueAt, projectId, recurrence, createdAt, updatedAt, completedAt, source.

Tasks should preserve provenance between user commitments and AI suggestions.

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

## Data lifecycle

Every new personal-data class must define purpose, access, mutation, retention, deletion, export, sensitivity and whether it can influence autonomous actions.

Cloud Functions Admin SDK bypasses Firestore Rules, so privileged functions require their own authorization checks.
