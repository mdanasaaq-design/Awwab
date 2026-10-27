# Firebase Project Setup

## Purpose

Firebase is the current foundation. Development and production must remain separate.

## Development project

1. Register Web app.
2. Register Android app as `com.awwab.app`.
3. Enable selected Authentication providers.
4. Create Firestore.
5. Configure Rules.
6. Configure Web App Check.
7. Configure Android App Check.
8. Enable FCM.
9. Configure Functions for Node.js 22.
10. Configure Hosting if needed.
11. Configure local CLI alias.
12. Configure billing alerts/spend controls before paid backend workloads.

## Environment separation

Use local/emulator, development Firebase and production Firebase. Never point local development at production data.

- `.firebaserc.example` is a template only; replace its placeholders in a local ignored `.firebaserc` with the actual development and production project IDs.
- Verify the active CLI project with `firebase use` before any command that can affect a live project.
- CI uses the `demo-awwab` emulator project; passing emulator tests does not prove that a live project, provider, OAuth client, or App Check configuration is correct.
- Production requires separate project IDs, secrets, OAuth clients, App Check configuration, notification configuration, deployment credentials and monitoring/billing controls. Never copy production secrets into local development.

## Web

Use `apps/web/.env.local` from `apps/web/.env.example`. Client Firebase configuration is not an authorization boundary.

## Android

Use development `google-services.json` locally at `apps/android/app/google-services.json`. Never commit signing credentials.

## App Check — current state and staged rollout

**Current state observed in the repository:** the web client initializes App Check only when `VITE_FIREBASE_APP_CHECK_SITE_KEY` is present, using `ReCaptchaEnterpriseProvider`. This is client-side token initialization, not proof of enforcement. The reviewed Functions v2 callable declarations do not set `enforceAppCheck: true`, so server-side callable enforcement is not currently enabled by those declarations. The Android provider path and live token behavior have not been validated here.

Do not enable enforcement in a documentation-only change. Use this staged rollout in a dedicated development project first:

1. Register the correct development Web App in App Check and configure its reCAPTCHA Enterprise provider/site key.
2. Set `VITE_FIREBASE_APP_CHECK_SITE_KEY` locally without committing secrets or project-specific local environment files.
3. Run the legitimate development web client and confirm App Check tokens are issued and accepted; test sign-in and each protected callable.
4. Observe App Check metrics and callable failures. Identify legitimate clients that are missing/invalid before enforcement.
5. Validate Android separately with its intended provider and Play Integrity/App Check configuration; do not infer Android readiness from web results.
6. Prepare a separate code change that enables enforcement for selected callables, with explicit acceptance criteria, emulator/regression checks, a live development smoke test, monitoring, and rollback instructions.
7. Enable production enforcement only after development validation and explicit owner approval; monitor rejection rates immediately after rollout.

The emulator suite does not validate live reCAPTCHA Enterprise tokens or production enforcement. Record project ID, client/provider, callable tested, observed result, and date for every live check.

## Functions and billing

Cloud Functions uses Blaze billing. Budget alerts and spend controls must exist before production autonomous workloads.

## AI secrets

Model/API credentials belong in a server-side secret mechanism, never in React bundles, APKs, Firestore documents or Git history.

## Production checklist

- backup/recovery
- billing alerts
- least-privilege IAM
- App Check enforcement
- Auth provider review
- Rules review
- Functions authorization review
- secret rotation
- monitoring
- incident response

References:
- https://firebase.google.com/docs
- https://firebase.google.com/docs/app-check
- https://firebase.google.com/docs/functions


## Live project finding — 2026-10-27

The Awwab project has a default Firestore Native database in asia-south1, but the Functions list is empty. A Functions deployment attempt was blocked because the project must be on Blaze. The owner chose to remain on the current plan. Do not repeat deployment attempts, upgrade billing, deploy Rules, or create alternative cloud resources until the architecture comparison and explicit approval are complete. Cloudflare Workers is a candidate to evaluate, not a selected backend. The local extracted-copy region edits have not been reconciled with GitHub main. See [Master Plan](../project/MASTER_PLAN.md).


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
