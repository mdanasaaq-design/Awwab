# Awwab Architecture

## Goal
Keep Awwab modular so web and Android clients can evolve independently while sharing authenticated data and controlled backend capabilities.

## Layers
### 1. Client applications
- Web/laptop client
- Native Android client

Clients handle presentation, interaction and local UI state. They must not contain unrestricted privileged credentials.

### 2. Identity and authentication
Planned components:
- Firebase Authentication
- Authenticated user identity
- Trusted-device concept
- Session controls
- Permission checks

### 3. Application backend
Responsible for user configuration, tasks, notes, memory, automation state, activity history, secure server operations and access-controlled Firebase data.

### 4. AI orchestration
Responsible for intent interpretation, task planning, tool selection, approval requests, controlled execution, failure handling and result synthesis.

### 5. Tool integrations
Potential integrations include GitHub, web research, files, calendar, notifications, Android-supported actions and build/test workflows. Each should expose narrowly scoped operations.

### 6. Automation
Potential components include scheduled workflows, event triggers, recurring reports, monitoring, retry policies, approval queues and audit logs.

## Data boundary
Personal data should be isolated by authenticated user identity. Firestore rules should enforce owner-level access, with privileged server operations separated from ordinary client operations.

## Security boundary
Secrets, API keys and privileged credentials must remain outside client bundles. Sensitive actions should be mediated by backend authorization and explicit confirmation where required.

## Initial direction
Technology choices will be finalized after validating current Firebase capabilities/costs and the practical requirements of web and Android clients.
