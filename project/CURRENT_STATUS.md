# Current Status

**Date:** 2026-09-26  
**Phase:** Foundation — Authentication Boundary  
**Repository:** `mdanasaaq-design/Awwab`

## Completed
- Repository and foundation documentation
- Finalized technology baseline
- Web React + TypeScript + Vite shell
- Android Kotlin + Jetpack Compose shell
- Firebase client initialization structure
- Firebase Authentication web boundary
- Environment-safe Firebase configuration
- Firestore user-scoped data model and tightened client rules
- Shared TypeScript security/application contracts
- Trusted-device model
- Approval workflow model
- Backend-controlled audit/activity model
- Cloud Functions 2nd gen TypeScript health callable
- Web authentication state observer and sign-in/sign-out UI
- Web App Check initialization path for reCAPTCHA Enterprise
- Server-side device registration and first-device bootstrap
- Trusted-device approval and revocation callables
- Backend user-profile initialization callable
- Web trusted-device management UI
- Narrowed bootstrap fallback handling to only expected `failed-precondition`
- Authentication/device testing strategy
- Local Firebase Emulator Suite configuration
- Firestore Security Rules test harness and focused authorization coverage
- Root Functions typecheck command

## Security architecture
- Firebase Auth is the primary identity system.
- Awwab device authorization remains separate from the Firebase session.
- Firestore client writes are limited by collection purpose.
- Devices, approvals, and audit/activity records are backend-controlled.
- Privileged operations remain behind Cloud Functions.
- App Check is an additional app-authenticity signal, not a replacement for authorization.
- The last trusted device cannot be revoked through ordinary device management.
- Revoked devices cannot self-reactivate.

## Pending external setup
- Create the actual development Firebase project
- Register Web and Android apps in that project
- Enable the chosen Firebase Authentication provider(s)
- Create Firestore in the development project
- Register App Check providers and later enable enforcement after monitoring
- Configure FCM
- Add development environment values locally
- Generate Android `google-services.json`

## Not yet validated
- Local npm install/build/typecheck
- Firestore rules test suite execution
- Backend callable/device lifecycle emulator execution
- Real Firebase sign-in
- Firestore reads/writes against a project
- App Check attestation
- Android Firebase integration/build
- Android device testing
- CI
- Deployment

## Device trust milestone
- Web installations register through callable backend functions.
- First-device bootstrap is a narrow one-time trust path.
- Later installations begin as pending.
- Trusted devices can approve or revoke devices through server-side authorization.
- Device-management events are written to backend-controlled activity records.

## Next milestone
Install dependencies locally and execute the rules suite plus web/Functions/shared typechecks and builds. Then create/connect the dedicated development Firebase project and validate the authenticated device lifecycle before expanding into assistant requests.
