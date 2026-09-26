# Architecture Decisions

## ADR-001 — Firebase as planned backend
**Status:** Proposed

Firebase is the planned backend platform because the product requires authentication, synchronized personal data, notifications and secure server-side operations.

This is not yet a final technology commitment. Current capabilities, pricing, limits and security requirements must be validated before implementation.

## ADR-002 — Native Android client
**Status:** Proposed

Awwab should have a first-class Android application rather than relying exclusively on a responsive website. The exact Android stack will be finalized during foundation validation.

## ADR-003 — Backend-mediated privileged tools
**Status:** Accepted

Sensitive credentials and privileged tool execution should remain behind secure backend boundaries rather than being exposed to web or Android clients.

## ADR-004 — Explicit approval for sensitive actions
**Status:** Accepted

Actions such as sending communications, destructive operations and production deployment require explicit confirmation unless a future documented policy provides a narrower safe authorization mechanism.


## ADR-005 — Technology baseline
**Status:** Accepted

- Web: React + TypeScript + Vite
- Android: Kotlin + Jetpack Compose
- Backend: Firebase
- Auth: Firebase Authentication
- Database: Cloud Firestore
- Notifications: Firebase Cloud Messaging
- App protection: Firebase App Check
- Server runtime: Firebase Cloud Functions 2nd gen with Node.js 22 + TypeScript
- Initial web hosting: Firebase Hosting
- AI: provider-agnostic backend orchestration

Cloud Functions requires the Blaze billing plan, so production backend use must include budget alerts and spend controls.


## ADR-006 — User-scoped Firestore hierarchy
**Status:** Accepted

Personal application data will be primarily organized under `/users/{uid}/...`. Firestore Rules will enforce ownership using authenticated UID rather than granting broad access to authenticated users. citeturn0search6turn0search13

## ADR-007 — Firebase Auth plus Awwab device authorization
**Status:** Accepted

Firebase Authentication remains the primary identity/session mechanism. Awwab adds a separate device authorization layer with pending, trusted and revoked states. Firebase's short-lived ID tokens and refresh-token lifecycle remain the underlying authentication mechanism. citeturn0search2

## ADR-008 — Privileged actions through callable backend functions
**Status:** Accepted

Client-initiated privileged operations will use Cloud Functions callable endpoints where appropriate. Auth and App Check signals are validated server-side, followed by operation-specific authorization. citeturn0search3

## ADR-009 — Approval as a server-validated security boundary
**Status:** Accepted

Sensitive actions require explicit approval. Approval records are not themselves authorization; the backend validates user, device, expiry, action type and exact payload before execution.

## ADR-010 — Audit records are append-oriented
**Status:** Accepted

Activity/audit records are written by trusted backend operations for sensitive actions. Clients may read permitted history but do not receive unrestricted ability to rewrite audit history.
