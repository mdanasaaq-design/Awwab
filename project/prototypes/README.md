# Local-only device lifecycle prototype

These files are an isolated business-rule model for development and learning. They are not production backend code and are not imported by the web app or Firebase Functions.

## Run

From the repository root, with Node.js installed:

```sh
node --test project/prototypes/device-lifecycle-mock.test.mjs
```

## Boundaries

- Uses only synthetic users and device IDs.
- No Firebase SDK, Cloudflare SDK, network access, credentials, persistent storage, or live project calls.
- Covers input validation and metadata bounds, first-device bootstrap, pending/trusted/revoked transitions, trusted-caller checks, idempotent repeat revocation, cross-user target-ID attempts, audit event shape, user isolation, and a deterministic competing-bootstrap scenario.
- This in-memory model does **not** prove Firestore transaction correctness, cross-process race safety, ID-token verification, IAM setup, or production readiness.
- Never wire it to the production UI or show mock results as real device registration.
- No deployment or billing configuration is needed.

## Device-key proof-of-possession protocol model

Files `device-key-proof-mock.mjs` and `device-key-proof-mock.test.mjs` model a local Ed25519 public/private-key protocol. The test code generates synthetic key pairs at runtime. The model includes bound action/target challenges, exclusive expiry deadlines, safe expiry arithmetic, one-time consumption in the sequential mock, pending/trusted/revoked status, and rejection of silent key replacement. Regression cases also cover invalid-signature retry and revocation after challenge issuance.

Run both suites from the repository root:

```sh
node --test project/prototypes/device-lifecycle-mock.test.mjs project/prototypes/device-key-proof-mock.test.mjs
```

Review notes and remaining blockers: see [DEVICE_BINDING_REVIEW.md](../DEVICE_BINDING_REVIEW.md). **Important limits:** the in-memory challenge store is not atomic across processes or servers. The model does not verify Firebase ID tokens, persist challenge consumption, perform a real protected operation in the same transaction, protect against XSS/browser compromise, prove hardware-backed identity, or establish a secure $0 server path. It is protocol logic only, not production-ready device authorization.

## Supabase device-service research gate

See [SUPABASE_DEVICE_SERVICE_TEST_PLAN.md](../SUPABASE_DEVICE_SERVICE_TEST_PLAN.md) for the local-only design and acceptance test matrix. This is a specification, not a running Supabase integration. No Supabase project, credentials, network calls, or production imports are involved. The Firebase token role-claim dependency and strict $0 cost gate remain unresolved.


## Synthetic Firebase ID-token verification harness

Files `firebase-token-verifier-mock.mjs` and `firebase-token-verifier-mock.test.mjs` exercise token parsing, RS256 signatures, key IDs, issuer/audience/subject checks, time claims, clock skew, and fail-closed configuration using freshly generated synthetic RSA keys and synthetic tokens.

Run from the repository root:

```sh
node --test project/prototypes/firebase-token-verifier-mock.test.mjs
```

This is a **local test model only**. It accepts an explicitly supplied synthetic key set and does not fetch Google's JWKS, implement HTTP cache headers/key rotation, validate real Firebase tokens, check refresh-token revocation, or prove Supabase Edge Runtime behavior. Never use this mock as production authentication code. The Supabase candidate remains NO-GO for cloud creation/deployment pending independent review and the strict $0 gate.

## Phase 1 security review

See [PHASE_1_FIREBASE_TOKEN_VERIFIER_REVIEW.md](../PHASE_1_FIREBASE_TOKEN_VERIFIER_REVIEW.md) for the source-only review of this verifier, the official Firebase/Supabase requirements, and the production blockers. The review is complete; the verifier itself is still a synthetic model and is **not approved for production use**.
