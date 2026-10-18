# Phase 2H — App Check and Environment Readiness Audit

**Status:** Acceptance criteria recorded before documentation changes  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `docs/phase-2-app-check-audit`

## Current configuration observed

- `apps/web/src/firebase.ts` initializes App Check only when `VITE_FIREBASE_APP_CHECK_SITE_KEY` is present, using `ReCaptchaEnterpriseProvider`.
- The reviewed Functions v2 callable declarations use `onCall(...)` without `enforceAppCheck: true`. Server-side App Check enforcement is therefore not enabled by these declarations.
- `firebase.json` specifies Functions runtime Node.js 22 and Auth/Firestore emulator ports. The Functions emulator uses its default port in CI.
- `.firebaserc.example` contains development/production placeholders; it is not a real project binding.
- CI uses the `demo-awwab` emulator project and does not prove a live Firebase project or App Check provider is configured.
- No Firebase deployment or live enforcement change is part of this audit.

## Intended change

- Update Firebase setup documentation to distinguish client token initialization from server-side enforcement.
- Add a staged development-first App Check checklist with observable validation steps and explicit stop conditions.
- Document how to verify the active Firebase project and keep development/production IDs, credentials, and providers separate.
- Keep enforcement disabled until a separate, tested implementation change is approved.

## Acceptance criteria

- [ ] Documentation states that optional web App Check initialization is not proof of server enforcement.
- [ ] Documentation explicitly records that callable enforcement is currently not enabled by the reviewed declarations.
- [ ] Development-first steps cover Web App registration, reCAPTCHA Enterprise provider/site key, valid token observation, callable behavior, and rejection monitoring.
- [ ] Android provider and Play Integrity/App Check validation remain separate and are not claimed complete.
- [ ] CI emulator behavior is distinguished from live Firebase validation.
- [ ] Development and production project IDs, OAuth clients, App Check configuration, secrets, and deployment credentials remain separate.
- [ ] No enforcement option is enabled, no Firebase configuration is changed, and no deployment is performed in this slice.
- [ ] Current status and task list record the audit and remaining live validation gate.

## Rollout decision

Do not turn on enforcement merely because the web client can initialize a token. First validate legitimate development clients, observe traffic and rejection metrics, fix integration issues, then propose a separate bounded change that enables enforcement for selected callables. Production enforcement requires explicit owner approval and a rollback plan.

## Non-goals

No live Firebase project access, App Check enforcement, secret provisioning, provider registration, or deployment.
