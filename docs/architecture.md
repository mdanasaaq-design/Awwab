# Awwab Architecture

## Finalized technology direction
- Web: React + TypeScript + Vite
- Android: Kotlin + Jetpack Compose
- Backend: Firebase
- Authentication: Firebase Authentication
- Data: Cloud Firestore
- Notifications: Firebase Cloud Messaging
- App protection: Firebase App Check
- Privileged backend: Firebase Cloud Functions 2nd gen
- Backend runtime: Node.js 22 + TypeScript
- Initial web hosting: Firebase Hosting
- AI: provider-agnostic orchestration behind the backend

## Layers

### 1. Client applications
Web and native Android handle presentation, interaction and local UI state. They never contain unrestricted privileged credentials.

### 2. Identity
Firebase Authentication provides user identity. A separate trusted-device/session model will be designed before implementation.

### 3. Data
Cloud Firestore is the primary synchronized application database. Initial logical areas include users, devices, preferences, projects, tasks, conversations, memories, automations, approvals and activity/audit records.

### 4. Backend
Cloud Functions 2nd gen is the privileged server boundary for AI orchestration, tool execution, approval validation, scheduled/event-driven automation, notification dispatch, webhooks and audit logging.

### 5. AI orchestration
Client request → authenticate/App Check → authorization → intent/context → tool selection → approval when sensitive → server-side execution → result/audit → client response.

The model provider remains replaceable and its credentials remain server-side.

### 6. Tools
Potential scoped integrations include GitHub, web research, files, calendar, notifications, Android actions and build/test workflows.

### 7. Automation
Scheduled workflows, event triggers, recurring reports, monitoring, retries, approval queues and audit logs.

## Security
App Check will protect supported Firebase resources. Android can use Play Integrity and web can use reCAPTCHA Enterprise. Sensitive actions require explicit confirmation. Debug App Check tokens are development-only and must never be shipped in production.

## Cost boundary
Firestore has a qualifying free quota, but Cloud Functions for Firebase requires Blaze. Awwab must therefore use billing alerts/spend controls before production workloads.

## Architecture flow

```
Web (React/TS/Vite) ─┐
                     ├──> Firebase Auth + App Check
Android (Kotlin/Compose) ─┘
                           │
                           v
                    Cloud Functions 2nd gen
                           │
             ┌─────────────┼─────────────┐
             v             v             v
       AI Orchestrator  Firestore       FCM
             │
             v
     Permission / Approval
             │
             v
      Scoped Tool Adapters
             │
        ┌────┼─────┐
        v    v     v
      GitHub Research Future Tools
```
