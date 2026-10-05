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

Production requires separate project IDs, secrets, OAuth clients, App Check configuration, notification configuration, deployment credentials and monitoring/billing controls.

## Web

Use `apps/web/.env.local` from `apps/web/.env.example`. Client Firebase configuration is not an authorization boundary.

## Android

Use development `google-services.json` locally at `apps/android/app/google-services.json`. Never commit signing credentials.

## App Check

Roll out progressively:
1. observe
2. identify legitimate clients
3. fix attestation issues
4. enable enforcement
5. monitor rejection rates

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
