# Backend Independence and Trusted Device Architecture

**Date:** 2026-10-30  
**Branch:** `opensource-reuse-strategy`  
**Outcome:** Source reliability work completed; production trusted-device security NO-GO.  
**Billing/deployment:** No billing change, cloud resource, migration, or deployment.

## 1. Objectives

- Reconcile the existing backend, authentication, Firestore, device-management and deployment architecture.
- Remove concrete backend retry/idempotency defects that can be safely fixed in source.
- Establish whether the trusted-device model actually proves device possession.
- Preserve the owner's strict $0 operating constraint.
- Avoid adding a second backend or database without a verified security/cost need.

## 2. Current architecture

- Firebase Authentication remains the account identity provider.
- Cloud Firestore remains the user-data store and owner-scoped authorization boundary.
- Firebase Functions v2 / Node.js 22 remains the intended privileged server boundary in source.
- The Functions package is not deployed on the current Spark project. Cloud Functions deployment requires Blaze; no billing upgrade is authorized.
- The existing local Ed25519 challenge model is a protocol prototype only. It is not connected to the web client or Functions.

No alternate provider, database, worker, service account, or cloud resource is approved. A nominally free tier is not enough: the actual architecture must guarantee token verification, secret isolation, atomic privileged Firestore operations, replay protection, abuse controls and a hard $0 ceiling.

## 3. Implementation completed

### Transactional device registration

`registerDevice` now performs the device read, create/update and corresponding `device_registered` / `device_seen` activity write in one Firestore transaction. Concurrent duplicate registrations for the same ID become idempotent refreshes. Device state and its success audit event cannot be committed separately by this code path.

### Transactional profile initialization

`ensureUserProfile` now reads and creates/updates the profile in one transaction. Concurrent first sign-ins no longer rely on a stale read followed by a separate create.

### Regression coverage

The callable emulator suite now covers:
- Five concurrent registrations for the same device ID all succeeding.
- Exactly one initial registration event and four subsequent seen events.
- Concurrent profile initialization succeeding for all requests.
- A second independent Auth session for the same UID claiming the first session's trusted device ID and successfully approving its own pending device. This is a **known-limitation characterization test**, not a security pass.

### UI transparency

Settings now states that the current device records verify the signed-in account, not cryptographic possession of the browser. This disclosure does not fix the backend trust weakness.

## 4. Critical finding: device ID spoofing

The backend accepts `callerDeviceId` from request data and checks whether that document has `status == trusted`. The ID is not a secret or proof of possession. The emulator test confirms that a second account session can submit the trusted ID and pass the approval check.

Therefore:
- Current device status is not high-assurance device-bound authorization.
- Approval/revocation cannot be described as proof that the existing trusted device approved the action.
- The local Ed25519 model is not a mitigation until key enrollment, server challenge issuance, signature verification, one-time challenge consumption, and atomic state/audit mutation are integrated.
- Browser key possession is not physical hardware attestation; Android requires its own platform-specific key lifecycle.

## 5. Architecture decision

**NO-GO for production trusted-device security.**

Keep Firebase Auth + Firestore. Keep Functions as the intended privileged boundary in source, but undeployed. Do not add another provider or database merely to bypass Spark. Do not enable Blaze, deploy Functions, create secrets/service accounts, or alter production Rules without explicit owner approval.

A future implementation must:
1. Bind an immutable public key to the device record at enrollment.
2. Keep the private key protected by platform facilities where available.
3. Issue short-lived one-time challenges bound to UID, device, action and target.
4. Verify signatures against the already-bound key.
5. Atomically consume the challenge with the approval/revocation mutation and audit event.
6. Cover expiry, replay, wrong key, wrong UID/action/target, revoked/pending states, key rotation, recovery and concurrency.
7. Prove the server runtime satisfies the actual account's hard-$0 requirement—or obtain explicit approval to change that constraint.

## 6. Commits and validation

- Backend reliability: `8441553f131118a71d21b567ffb0408e0752a528`
- Callable regression tests: `73cdbc1a7a50a85728b8d34d4e147bb5ead15b4d`
- Settings disclosure: `5592ff4fd9a42b21cfa28104c745096bcc1d27dc`
- Documentation: architecture, auth-session, data model, risk, status, tasks and handoff updates.
- Full CI on the final head is required before automated validation is marked complete. Emulator tests do not prove live Firebase deployment or billing behavior.

## 7. Explicit non-actions

- No merge.
- No Firebase Functions deployment.
- No Firestore Rules deployment.
- No Firebase Blaze upgrade or billing change.
- No new backend provider, database, service account, secret or cloud resource.
- No migration or production data change.
