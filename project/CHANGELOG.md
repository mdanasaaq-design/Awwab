# Changelog

## Unreleased

### Added
- Initial Awwab foundation documentation.
- React + TypeScript + Vite web shell.
- Kotlin + Jetpack Compose Android shell.
- Firebase client initialization structure.
- Web Firebase Authentication boundary.
- Web App Check initialization path.
- Shared identity/security contracts.
- Firebase setup and environment documentation.
- Server-side device registration and first-device bootstrap.
- Trusted-device approval and revocation.
- Backend user-profile initialization.
- Web trusted-device management UI.
- Firebase Local Emulator Suite configuration.
- Firestore Security Rules test harness with focused authorization coverage.

### Security
- Tightened Firestore client write boundaries for device, approval and audit/activity collections.
- Restricted privileged device-management operations to trusted caller devices.
- Prevented ordinary revocation of the last trusted device.
- Prevented revoked devices from silently reactivating.
- Added backend-controlled audit events for device-management actions.

### Not included
- No Firebase project credentials.
- No production secrets.
- No local build or deployment claim.
- No claim that the new emulator tests have been executed yet.
