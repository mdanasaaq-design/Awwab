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

A local emulator configuration is committed in `firebase.json`. The rules test suite uses the Firebase demo project ID `demo-awwab`, which is isolated from live Firebase resources.

Install dependencies, then run:

```bash
npm run firebase:rules:test
```

For interactive emulator work:

```bash
npm run firebase:emulators
```

The Emulator Suite is the preferred local path for Security Rules validation; Firebase documents `@firebase/rules-unit-testing` for mocked authentication contexts and rules assertions. citeturn2search0turn2search2

Current automated rules coverage includes:
- unauthenticated access rejection
- owner profile read/write
- cross-user profile isolation
- project ownership isolation
- client denial for device writes
- client denial for approval/audit writes
- owner-only approval/audit reads
- conversation-message append/read restrictions
- notification read/update versus client-create/delete restrictions

Required backend callable scenarios remain separate and are not considered validated until the Functions emulator or a development Firebase project has actually been exercised.

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

The repository now has an executable local rules-test command. CI should eventually run:
- dependency installation
- TypeScript typechecks
- web build
- Functions build
- automated unit/rules tests

Deployment should remain a separate explicitly authorized workflow.
