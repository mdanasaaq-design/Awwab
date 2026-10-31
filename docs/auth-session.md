# Awwab Authentication and Session Model

## Goal

Awwab must know who is acting, which installation is acting, and what that installation is allowed to do.

Authentication, device trust and authorization are separate concepts.

## Identity

Firebase Authentication is the current identity foundation. Do not create a second long-lived authentication token merely for Awwab.

## Device trust

Each installation has an opaque `deviceId` under `/users/{uid}/devices/{deviceId}`.

States:
- pending
- trusted
- revoked

A device ID is an authorization reference, never a credential.

### Enrollment

- First-device bootstrap is a narrow one-time path.
- Later devices begin as pending.
- A trusted device can approve a pending device.
- A trusted device can revoke another device.
- The last trusted device cannot be revoked through ordinary device management.
- Revoked devices cannot self-reactivate.

## Sensitive actions

Evaluate:
1. authenticated UID
2. trusted device/session
3. action scope
4. recent authentication where required
5. approval state
6. exact payload
7. current policy/budget
8. auditability

### Risk tiers

- **Low:** read-only and reversible local organization.
- **Medium:** personal-data changes and routine non-destructive updates.
- **High:** external communication, publishing, destructive changes, production deployment and similar consequences.
- **Critical:** broad security/account compromise, destructive infrastructure or major financial/security consequences.

High and critical actions require explicit confirmation. Critical actions may require fresh authentication plus an additional confirmation.

## Recovery

Recovery must never depend only on possession of a device ID. Use a supported identity/recovery mechanism and record the trust transition.

## App Check

App Check is an additional app-authenticity signal, not authentication or authorization. Enable enforcement only after legitimate client attestation has been validated.

## Backend rule

Every callable/backend entry point independently enforces authorization. UI visibility is never a security control.

References:
- https://firebase.google.com/docs/auth
- https://firebase.google.com/docs/app-check
- https://firebase.google.com/docs/functions/callable


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.


## Imported-code boundary (2026-10-30)

Reused agent/browser/memory libraries never authenticate a user or establish device trust. They receive only the minimum already-authorized context from Awwab and cannot read tokens, mint identity claims, approve actions or alter device state. Awwab's Firebase Auth and device authorization contracts remain authoritative. See [the reuse catalogue](OPEN_SOURCE_REUSE_CATALOG.md).


## Device identity limitation — 2026-10-30

Firebase Authentication establishes the signed-in account. The current device management callable also accepts a client-supplied device ID and checks the corresponding user-scoped Firestore record's status. This is **not** proof that the caller possesses the enrolled browser/device key. A callable-emulator test confirms that a second authenticated session for the same UID can claim a trusted device ID and approve a pending device.

Do not use the current status check as high-assurance device-bound authorization. The local Ed25519 challenge prototype is not integrated into the app or deployed backend. Settings discloses this limitation. Device-key proof, recovery/rotation and atomic replay protection remain production blockers.

Cloud Functions are source-only on the current Spark project; no billing upgrade or deployment is authorized. Keep Firebase Auth as account identity and do not claim the current device list proves physical-device identity.


## Device-trust limitation and self-development boundary — 2026-10-31

The current callable protocol accepts a client-supplied callerDeviceId and does not prove possession of a device private key. A second authenticated session for the same UID can claim a trusted ID; this is a confirmed P0 limitation. Current device records must not authorize high-assurance self-development operations, secret access, approvals, or privileged external actions. A local owner-controlled development runner must enforce its own OS/user boundary and explicit local confirmation until a reviewed server-verifiable device-key protocol and an approved hard-$0 server path exist. Do not treat the local Ed25519 mock as production authentication.
