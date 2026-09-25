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
