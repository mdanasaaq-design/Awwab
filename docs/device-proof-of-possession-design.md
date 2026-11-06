# Device proof-of-possession design proposal

**Status:** Design proposal only — not implemented, approved for production, or deployed.  
**Date:** 2026-11-02  
**Related blocker:** AWW-022 — caller-supplied device ID is not proof of device possession.  
**Cost boundary:** Strict $0. No Blaze upgrade, new cloud provider, hosted worker, database, service account, or production deployment.

## 1. Problem

Current callable requests include a client-supplied `deviceId` or `callerDeviceId`. The backend looks up `users/{uid}/devices/{deviceId}` and checks `status == trusted`. This proves only that the authenticated Firebase account has a device record with that identifier. It does not prove that the request controls the enrolled device's private key.

The emulator characterization tests show that a second Firebase Auth session for the same UID can claim a known trusted ID. The same weakness affects device listing, approval, revocation, memory-context preview and the assistant callable's trust gate.

A device ID is a lookup key, not an authenticator.

## 2. Security goal and non-goals

### Goal

Bind sensitive callable requests to a cryptographic key enrolled for the device/session, so a second account session cannot impersonate an existing trusted device merely by copying its public identifier.

### Non-goals / claims we must not make

- A successful signature proves possession of the enrolled private key at request time; it does not prove a unique physical device.
- A browser-origin key is not hardware attestation. A non-extractable WebCrypto key is still exposed to same-origin script execution while the origin is compromised.
- Android hardware-backed storage is platform/device dependent and must be detected and reported accurately; do not claim every Android key is hardware-backed.
- Firebase Authentication remains the account identity layer. Device proof does not replace account recovery or MFA.
- This proposal does not make the assistant autonomous or enable tool execution.

## 3. Candidate cryptographic profile

Use a reviewed, cross-platform signature profile. Candidate baseline: ECDSA P-256 with SHA-256 because WebCrypto and Android Keystore commonly support P-256. The existing Ed25519 concept should remain a prototype until actual browser and Android compatibility is verified on supported versions. Do not silently fall back between algorithms.

The key record should include:
- `algorithm` and explicit protocol version;
- public key in a canonical, validated encoding;
- key fingerprint;
- monotonically increasing `keyVersion`;
- device status and enrollment/rotation/revocation timestamps;
- platform and key-storage assurance metadata, without overclaiming hardware protection.

Private keys must never be sent to Firebase, written to Firestore, included in logs, or exposed to the model. On web, use a non-extractable WebCrypto private key persisted as a CryptoKey where supported. On Android, use Android Keystore where supported and record the actual security level. Loss of browser storage or device key must use an explicit recovery flow, not a caller-ID bypass.

## 4. Protocol outline

### A. Enrollment

1. The client generates a key pair locally.
2. The authenticated owner requests an enrollment challenge. The server derives `uid` from verified Firebase Auth; it never accepts an owner ID from the client.
3. The server creates a random, one-time challenge bound to the account, proposed device ID, public-key fingerprint, algorithm, key version, operation, issue time and short expiry.
4. The client signs the canonical challenge payload with the private key.
5. The server verifies the signature and atomically consumes the challenge while creating the pending device record and audit event.
6. A new device remains pending until an already trusted key signs an approval challenge bound to the exact target device ID and public-key fingerprint.

First-device bootstrap is a separate trust decision: a new key signing its own enrollment challenge proves control of that key, not that the person is the rightful account owner. The bootstrap policy must explicitly address account takeover/racing enrollment (for example, a verified step-up/recovery requirement). Do not describe first-device self-enrollment as independent owner approval.

### B. Every protected callable

1. The client asks for a challenge for one exact operation and payload.
2. The server returns a random nonce, challenge ID, expiry and the exact canonical bytes/string to sign.
3. The client signs the challenge with the enrolled private key.
4. The callable receives the challenge ID, signature and requested operation payload.
5. The server verifies the signature using the public key stored for the authenticated UID/device.
6. In a Firestore transaction, the server re-reads the challenge and device record and checks:
   - challenge belongs to the authenticated UID and requested device;
   - challenge is unconsumed and unexpired;
   - operation, target and payload hash match exactly;
   - the device remains trusted and not revoked;
   - the public-key fingerprint and key version still match the verified key;
   - all required target ownership/state checks still pass.
7. The transaction consumes the challenge and commits the protected state change plus its audit event together. A replay or concurrent duplicate must fail; exactly one request may consume a challenge.

A trusted status check without this signed challenge is not sufficient authorization for protected operations.

## 5. Challenge format and replay protection

The signed message must use an unambiguous canonical encoding and domain separation, for example a protocol prefix `awwab-device-proof-v1` plus:
- challenge ID and 256-bit random nonce;
- authenticated UID (server-bound);
- device ID and key version;
- operation name;
- exact target identifier where applicable;
- hash of the exact canonical request payload;
- issue and expiry timestamps.

Do not sign arbitrary client JSON without canonicalization. Do not allow a challenge for `listDevices` to authorize `approveDevice`, or a challenge for one target/payload to authorize another.

Candidate initial challenge lifetime: 60–120 seconds, subject to usability and clock-skew tests. Enforce one-time consumption in a transaction; expiry cleanup/TTL is housekeeping only and is not replay protection. Add per-account/device challenge issuance and failed-verification limits before any production use.

## 6. Protected operation coverage

The same verifier must guard all operations that currently rely on caller-supplied device IDs:
- list devices (private account/device inventory);
- approve a pending device (trusted-key approval over exact target key fingerprint);
- revoke a device (trusted-key signature over exact target);
- preview/retrieve memory context;
- any future assistant request or privileged developer action.

Do not fix only `approveDevice` while leaving the memory preview or other callables on the old trust check.

## 7. Rotation, revocation and recovery

- Rotation is authorized by the currently trusted key and atomically binds the new public key/version before the old key is retired.
- Revocation increments or invalidates the key version and prevents outstanding challenges from authorizing later requests.
- Recovery after all trusted keys are lost requires a separately reviewed owner recovery/step-up process and auditable waiting/notification safeguards. Do not fall back to a client-supplied trusted ID.
- Recovery and first-device bootstrap must be tested against concurrent attempts and account-session takeover.
- A recovered device should not silently inherit old key identity or old outstanding challenges.

## 8. Required regression tests

The current passing spoof test is a vulnerability-characterization test. After implementation it must be inverted to require denial. Required tests include:
1. valid enrolled key can complete a challenge for the exact operation;
2. second account session with the same UID but without the private key is denied;
3. wrong key, wrong algorithm, malformed signature and malformed public key are denied;
4. expired, consumed, unknown and cross-user challenges are denied;
5. challenge cannot be reused for another operation, target, key version or payload hash;
6. concurrent replay attempts produce exactly one successful transaction;
7. revoked devices and rotated/stale keys cannot use old challenges;
8. approval binds to the pending device's exact public-key fingerprint;
9. revocation and audit event commit atomically;
10. recovery/bootstrap races do not create two trusted roots;
11. missing/invalid Firebase Auth remains denied;
12. memory preview cannot return private records without valid proof, including across sessions;
13. malformed, oversized and unexpected request fields are rejected without leaking key/challenge details.

## 9. Cost and deployment gate

The current Firebase Functions deployment path requires a billing-plan change beyond the owner's Spark/$0 constraint. No server execution path has been proven to provide verified Firebase identity, secret isolation, atomic Firestore transactions, abuse controls and a hard $0 ceiling for this project.

Therefore:
- design, source work and emulator tests may proceed locally/branch-only;
- do not deploy Functions, enable Blaze, create another backend or database, or change production Rules;
- do not call the issue fixed based only on a passing emulator test;
- any alternative runtime requires a separate cost, security, privacy and operational review and explicit owner approval.

## 10. Proposed implementation order

1. Confirm platform support matrix for browser WebCrypto and Android Keystore; select one protocol version and no silent fallback.
2. Implement pure canonical-message and signature-verification helpers with test vectors.
3. Implement challenge issuance/consumption against emulator-only Firestore fixtures.
4. Add the complete callable matrix and transaction/replay tests.
5. Wire web and Android key lifecycle with explicit recovery and user-visible status.
6. Invert the known-spoof characterization tests and prove all protected callables reject the second session.
7. Obtain independent security review and demonstrate a hard-$0 deployment/execution path before production approval.

**Current decision:** keep AWW-022 open and all high-assurance device operations blocked. The isolated helper is a prototype slice only; the end-to-end proof protocol remains a proposal and is not authorization to deploy.


## A9 implementation slice 1 — cross-platform profile and isolated verifier (2026-11-06)

### Platform evidence reviewed

- Browser Web Crypto supports ECDSA signing and verification in secure contexts. The API exports public keys in SubjectPublicKeyInfo (SPKI) format; non-extractable private CryptoKeys can be persisted through structured-clone-capable storage such as IndexedDB. References: [MDN SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), [MDN importKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey), [MDN sign](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign).
- Android Keystore documents EC key-pair generation for ECDSA with SHA-256 and identifies P-256 as a StrongBox-supported curve where hardware supports it. Android 10/API 29+ exposes `KeyInfo.getSecurityLevel()`; TEE/StrongBox must be detected per key/device rather than assumed. Reference: [Android Keystore system](https://developer.android.com/privacy-and-security/keystore).
- This source review supports a shared **candidate** profile of ECDSA P-256 with SHA-256. It is not device-matrix testing or independent cryptographic approval.

### Wire-format decision for the prototype

- Public key: DER-encoded SPKI, standard base64. Browser Web Crypto exports SPKI; Android exposes an X.509-encoded public key compatible with the SPKI container.
- Signature: fixed-width 64-byte IEEE-P1363 `r || s`, base64url on the wire. Browser Web Crypto uses this fixed-width signature representation. Android's `SHA256withECDSA` API returns an ASN.1 DER signature, so the Android client must explicitly normalize DER to P1363 and test boundary values before it can interoperate. No server-side dual-format fallback is allowed.
- Challenge message: protocol prefix `awwab-device-proof-v1` plus a fixed-position JSON array. The fixed-position representation prevents object-key ordering ambiguity and binds challenge ID, nonce, UID, device ID, key version, operation, target, payload hash, issue time and expiry.
- Challenge lifetime is capped at 120 seconds in the pure helper. The server must still enforce actual expiry using server time and atomically consume the challenge; helper validation is not replay protection.

### Code now present on the development branch

- `backend/functions/src/deviceProof.ts` contains isolated, dependency-free Node crypto helpers for strict challenge serialization, bounded canonical-payload SHA-256 hashing, P-256 SPKI key parsing and P1363 signature verification.
- `tests/device-proof-crypto.test.mjs` covers deterministic/domain-separated serialization, malformed challenge fields, lifetime and payload bounds, valid P-256 signatures, altered messages, malformed encodings and wrong curves. It also exercises Node Web Crypto's P-256 output and a test-only DER-to-P1363 normalization reference. These are runtime/reference tests, not a real browser compatibility matrix or Android Keystore device test.
- `npm run validate:local` now runs the focused crypto test after the Functions TypeScript build.

### Explicitly not implemented

- No callable imports or invokes this helper yet. No challenge issuance, Firestore challenge storage, transaction/one-time consumption, enrollment, key registration, fingerprint lifecycle, rotation, revocation binding, first-device recovery, web IndexedDB integration, Android Keystore client, DER-to-P1363 Android conversion, rate limiting or independent review has been implemented.
- Existing callable trust checks still rely on caller-supplied device IDs. The known spoofing characterization remains valid; AWW-022 is **open**, not fixed.
- No local execution of this A9 test slice has been observed yet. Pull the branch and run `npm run validate:local` before treating the new helper as validated.
- No production path is approved: preserve the strict $0 boundary; no Blaze upgrade, new service, cloud resource, secret, deployment or live Rules change.

**A9 acceptance gate:** first obtain a clean local typecheck/build and focused crypto test result; then add cross-platform fixed test vectors (browser Web Crypto and Android DER normalization); only after that design the emulator-only challenge store and atomic replay tests. Keep all high-assurance callables blocked until every protected operation uses the verified proof and the hard-$0 execution path is independently approved.
