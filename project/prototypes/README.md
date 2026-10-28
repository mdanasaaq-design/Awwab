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

Files `device-key-proof-mock.mjs` and `device-key-proof-mock.test.mjs` model a local Ed25519 public/private-key protocol. The test code generates synthetic key pairs at runtime. The model includes bound action/target challenges, expiry, one-time consumption, pending/trusted/revoked status, and rejection of silent key replacement.

Run both suites from the repository root:

```sh
node --test project/prototypes/device-lifecycle-mock.test.mjs project/prototypes/device-key-proof-mock.test.mjs
```

**Important limits:** the in-memory challenge store is not atomic across processes or servers. The model does not verify Firebase ID tokens, persist challenge consumption, perform a real protected operation in the same transaction, protect against XSS/browser compromise, prove hardware-backed identity, or establish a secure $0 server path. It is protocol logic only, not production-ready device authorization.
