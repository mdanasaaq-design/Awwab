# Device-key proof model review

**Status:** source review and local-model regression updates only. This is not a production security approval.

## Scope

Reviewed `project/prototypes/device-key-proof-mock.mjs` and its Node.js tests. The model is isolated from the live web app and Firebase Functions. The review adds regression coverage for deadline-boundary expiry, unsafe expiry arithmetic, retry after an invalid signature, and revocation while a challenge is outstanding.

## Findings addressed in the local model

1. **Exact expiry boundary:** challenge authorization previously rejected only when `now > expiresAt`, which accepted a proof at the exact expiry timestamp. Expiry is now exclusive: `now >= expiresAt` fails closed.
2. **Unsafe expiry arithmetic:** the issue path checked that `now` and `ttlMs` were safe integers independently but did not check their sum. It now rejects a non-safe `now + ttlMs`.
3. **Failed proof retry:** a bad signature is rejected before the model marks a challenge consumed. A regression test now confirms the legitimate key can still use that challenge afterward. This is a deliberate denial-of-service tradeoff in the model; production rate limiting and abuse controls still need design.
4. **Revocation during challenge lifetime:** authorization rechecks current device status, so a challenge issued before revocation is rejected after the device becomes revoked. A regression test covers this.

## Remaining limitations and production blockers

- **No atomicity across requests/processes:** the in-memory challenge map and boolean consume are not a concurrency-safe, durable one-time-use mechanism. A production implementation must atomically consume the challenge and perform the protected state change, including approval/revocation and audit writes, in one server-side transaction or equivalent compare-and-swap boundary.
- **No Firebase identity verification:** the model trusts the `uid` argument. A real server must verify Firebase ID tokens, derive UID only from the verified token, and apply revocation/session policy as required.
- **Trusted enrollment policy is only modeled:** first-device bootstrap needs a documented recovery and account-takeover policy. A public-key signature alone cannot safely decide who gets to establish the first trusted key.
- **Not physical-device proof:** Ed25519 proves possession of a private key under the model's assumptions; it does not establish hardware identity or protect a browser key from XSS, malicious extensions, compromised endpoints, or account recovery abuse.
- **No production key lifecycle:** key rotation/recovery, lost-device recovery, challenge cleanup, rate limits, abuse detection, operational logging, and failure recovery require explicit designs and tests.
- **No verified $0 privileged Firestore path:** this work does not change the earlier architecture finding. No live backend or cloud resource is created, and no billing change or Firestore Rules relaxation is authorized.

## Acceptance criteria for this bounded step

- [x] Exact challenge expiry is exclusive.
- [x] Unsafe expiry arithmetic is rejected.
- [x] Invalid signatures do not consume the challenge in the sequential model.
- [x] A revoked device cannot use a previously issued challenge.
- [ ] Run the updated Node.js tests locally and record the exact result.
- [ ] Design and prove a secure, atomic server-side Firestore path within the strict $0 constraint before implementing live device binding.

## Verification command

From the repository root:

```sh
node --test project/prototypes/device-lifecycle-mock.test.mjs project/prototypes/device-key-proof-mock.test.mjs
```

Passing this command validates only the local model's tested behavior. It does not establish production readiness.
