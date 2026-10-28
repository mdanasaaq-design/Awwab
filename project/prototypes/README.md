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
- Covers basic input checks, first-device bootstrap, pending/trusted/revoked transitions, trusted-caller checks, audit event shape, user isolation, and a deterministic competing-bootstrap scenario.
- This in-memory model does **not** prove Firestore transaction correctness, cross-process race safety, ID-token verification, IAM setup, or production readiness.
- Never wire it to the production UI or show mock results as real device registration.
- No deployment or billing configuration is needed.