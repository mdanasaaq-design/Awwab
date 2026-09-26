# Daily Log

## 2026-09-26

### Foundation
- Verified the Awwab repository and established the initial documentation structure.
- Finalized React/TypeScript/Vite, Kotlin/Compose and Firebase architecture decisions.
- Added web and Android application shells.

### Firebase and security
- Added environment-safe Firebase Web initialization.
- Added Firebase Authentication state/sign-in/sign-out boundary.
- Added Web App Check initialization for reCAPTCHA Enterprise when configured.
- Tightened Firestore Rules so device, approval and audit/activity records are not client-writable.
- Added shared TypeScript contracts for core identity/security records.
- Added Firebase project setup documentation and environment templates.

### Device trust
- Added server-side device registration and first-device bootstrap.
- Connected the authenticated web session to device registration.
- Added trusted-device-only approval and revocation callables.
- Prevented revocation of the last trusted device.
- Prevented revoked devices from self-reactivating.
- Added backend-controlled audit events for device-management actions.
- Added backend user-profile initialization.
- Added web trusted-device management UI.
- Narrowed bootstrap fallback handling to the expected failed-precondition case.

### Validation boundary
- Added Firebase Emulator Suite configuration using isolated `demo-awwab` project mode.
- Added executable Firestore Security Rules tests covering ownership and backend-controlled collections.
- Added repository scripts for interactive emulators and rules-test execution.
- Current changes were made through GitHub.
- No local dependency installation, build, emulator test, real Firebase project test, Android device test or deployment has been performed by the assistant.
