# Awwab Data Model

## Design goals
- Keep every personal record scoped to one authenticated user.
- Keep high-risk state behind backend-controlled collections.
- Prefer predictable paths and small documents.
- Avoid storing secrets, provider API keys or raw credentials in Firestore.
- Keep audit records append-oriented and difficult for clients to modify.

## Top-level structure

```
/users/{uid}
/users/{uid}/devices/{deviceId}
/users/{uid}/projects/{projectId}
/users/{uid}/tasks/{taskId}
/users/{uid}/conversations/{conversationId}
/users/{uid}/memories/{memoryId}
/users/{uid}/automations/{automationId}
/users/{uid}/approvals/{approvalId}
/users/{uid}/activity/{activityId}
/users/{uid}/preferences/{preferenceId}
/users/{uid}/notifications/{notificationId}
```

## User document
`users/{uid}`
- displayName
- email
- photoUrl
- createdAt
- updatedAt
- status
- timezone
- locale

No passwords, refresh tokens or provider secrets are stored here.

## Device document
`users/{uid}/devices/{deviceId}`
- platform
- appVersion
- deviceName
- createdAt
- lastSeenAt
- trusted
- trustedAt
- revokedAt
- notificationTokenStatus

A device record represents authorization state, not a copy of authentication credentials.

## Project document
`users/{uid}/projects/{projectId}`
- name
- description
- repository references
- status
- tags
- createdAt
- updatedAt

## Task document
`users/{uid}/tasks/{taskId}`
- title
- description
- status
- priority
- dueAt
- projectId
- createdAt
- updatedAt
- completedAt

## Conversation document
`users/{uid}/conversations/{conversationId}`
- title
- createdAt
- updatedAt
- lastMessageAt
- archived

Messages should be stored separately if volume requires it, for example:
`/users/{uid}/conversations/{conversationId}/messages/{messageId}`.

## Memory document
`users/{uid}/memories/{memoryId}`
- type
- content
- source
- confidence
- importance
- createdAt
- updatedAt
- expiresAt
- userVisible

Memory is personal data. Client access must remain user-scoped.

## Automation document
`users/{uid}/automations/{automationId}`
- name
- enabled
- triggerType
- schedule
- actionDefinition
- timezone
- lastRunAt
- nextRunAt
- createdAt
- updatedAt

Actions are definitions, not credentials.

## Approval document
`users/{uid}/approvals/{approvalId}`
- actionType
- description
- riskLevel
- requestedAt
- expiresAt
- status
- requestedByDeviceId
- approvedAt
- approvedByDeviceId
- executionId
- resultSummary

Sensitive actions must not execute merely because an approval document exists; the backend validates ownership, expiry, status and the exact action payload before execution.

## Activity/audit document
`users/{uid}/activity/{activityId}`
- eventType
- actorType
- deviceId
- tool
- action
- targetType
- targetReference
- outcome
- createdAt
- correlationId

Clients may read appropriate activity records but must not freely rewrite audit history.

## Preferences
`users/{uid}/preferences/{preferenceId}`
Use small named documents for settings that may change independently. Sensitive security settings are backend-controlled.

## Notifications
`users/{uid}/notifications/{notificationId}`
- type
- title
- body
- deepLink
- createdAt
- readAt
- expiresAt

FCM registration tokens are treated as sensitive device data and should not be exposed through broad queries.

## Security model
Firestore Rules should use `request.auth.uid` to enforce user ownership. The client must never be granted a blanket "any authenticated user" rule.

Cloud Functions server SDK operations bypass Firestore Security Rules, so privileged functions must perform their own authorization checks and operate under the service account/IAM boundary. citeturn0search0turn0search9

## Query/index principle
Design queries around known user ownership and common UI views first. Add composite indexes only when an actual query requires them.

## Data retention
Retention periods for conversations, memories and activity logs remain configurable decisions. No automatic deletion policy is assumed yet.
