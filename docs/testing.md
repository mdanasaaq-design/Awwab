# Awwab Testing Strategy

## Local validation

Before any Firebase deployment:

1. Install workspace dependencies.
2. Run web typecheck.
3. Run web production build.
4. Run Functions typecheck and build.
5. Run shared contract typecheck.

The assistant must not claim these checks passed unless their output is actually observed.

## Firebase Emulator Suite

The first backend validation should use the Firebase Emulator Suite where practical.

Required scenarios:

### Authentication boundary
- unauthenticated callable request is rejected
- authenticated request resolves to the expected UID

### Device lifecycle
- first device can bootstrap as trusted
- second device registers as pending
- trusted device can list devices
- trusted device can approve pending device
- pending device cannot approve another device
- trusted device can revoke another trusted device
- last trusted device cannot be revoked
- revoked device cannot self-reactivate
- unknown target device is rejected

### Profile
- first authenticated profile is created
- subsequent profile initialization is idempotent
- profile fields are normalized by the backend

### Firestore rules
Test owner/non-owner access for each user-scoped collection, with special attention to:
- devices
- approvals
- activity
- notifications
- conversation messages

## Real development project

After emulator validation, repeat the critical smoke tests against the dedicated development Firebase project.

Do not test development credentials or data against production.

## Android

After Firebase integration is configured:
- build the Android app
- verify Auth state
- verify device registration
- verify FCM registration
- verify App Check behavior
- test on a physical/emulated Android device

These are separate validation steps and must not be represented as complete until actually run.

## CI

CI should eventually run:
- dependency installation
- TypeScript typechecks
- web build
- Functions build
- automated unit/rules tests

Deployment should remain a separate explicitly authorized workflow.
