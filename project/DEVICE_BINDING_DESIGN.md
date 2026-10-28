# Device-binding design — proof of possession (local design only)

**Date:** 2026-10-28  
**Status:** Proposed protocol for threat-model review; not implemented and not approved for production.  
**Cost/deployment:** $0 research only. No resources, secrets, billing, Rules changes, or deployments.

## Problem

The web client currently stores `awwab.deviceId` in `localStorage` and sends that string to callable Functions. The backend checks whether the corresponding Firestore record has `status == "trusted"`. A string is an identifier, not proof that the caller possesses the device previously enrolled under that ID.

Firebase Authentication remains necessary to establish the account UID. Device authorization needs a separate proof if Awwab intends “trusted device” to mean more than “this signed-in account knows a trusted device ID.”

## Proposed direction: account identity + device-key proof

Use a public/private key pair generated on the client and keep the private key non-exportable where the platform supports it. Store the public key and key metadata with the server-owned device record. The backend must never accept a public key supplied afresh with each privileged request as a substitute for the already-bound key.

### Enrollment

1. Require a valid Firebase Auth session. The server derives the UID from verified token claims; the client never chooses the UID.
2. For first-device bootstrap, generate a key pair locally and submit the public key with the enrollment request. The first device becomes trusted only under an explicit bootstrap policy. This proves possession of the key created for that enrollment, but **does not** prove the person is the legitimate account owner beyond the strength of their account authentication. Consider requiring MFA or a deliberate account recovery ceremony before first bootstrap if account takeover is in scope.
3. For subsequent devices, create a pending record containing its public key. It stays pending until an already trusted device approves it using a verified, fresh proof from its own bound key.
4. Bind the key fingerprint, device ID, and UID together on the server. Never allow an existing trusted device ID to silently replace its bound public key.

### Privileged request protocol

1. The authenticated client requests a short-lived, unpredictable, one-time challenge for a specific action and target.
2. The server stores challenge state with expiry, user UID, device ID/key version, action, target ID, and a consumed flag or equivalent one-time-use mechanism.
3. The client signs a canonical payload that includes the challenge, action, target, and relevant request context with its bound private key.
4. The server verifies the Firebase Auth UID, challenge ownership/expiry, exact action and target, key version, signature, and current trusted/revoked status. Consume the challenge atomically with the state-changing operation.
5. Approval/revocation state changes, challenge consumption, and audit records should be committed atomically where the chosen database supports it. A failed verification must fail closed.
6. A revoked key must not regain trust merely by repeating enrollment with the same device ID. Recovery/re-enrollment needs a separate explicit flow.

## Threats this can and cannot address

**Can help with:** a caller who only knows or guesses another device's ID; replay of a captured signed request if challenges are truly one-time and action-bound; unauthorized key replacement if key binding is immutable without an approved rotation flow.

**Does not automatically address:** compromised account credentials used to bootstrap the first device; malware or XSS executing in the browser context; an attacker controlling an unlocked device; private-key deletion causing lockout; browser-profile cloning/backups; malicious browser extensions; or proof that a web browser runs on a unique physical machine.

A non-exportable Web Crypto key is not hardware attestation. Browser-origin code may still be able to invoke the key. Describe the feature as **device-key possession**, not guaranteed physical-device identity. Android hardware-backed attestation is a separate platform-specific problem and should not be implied by the web implementation.

## Zero-cost and architecture gate

This protocol is not a backend by itself. It requires a trusted server runtime to issue and consume challenges, verify signatures, and perform atomic database mutations. Current Firebase callable Functions are not deployed under the strict Spark/$0 constraint. A browser-only implementation cannot safely write trusted device records, and loosening Firestore Rules is not an acceptable substitute.

Before implementation, separately prove a secure, no-billing server path for the existing Firestore data and evaluate provider quotas, secret handling, token revocation behavior, and fail-closed operation. If no acceptable $0 path exists, keep live device management unavailable rather than presenting a mock as real.

## Prototype acceptance criteria

A local-only prototype may use synthetic identities and in-memory challenge storage to test protocol logic. It must demonstrate:

- Valid key proof succeeds only for the matching bound public key.
- Wrong-key, wrong-user, wrong-action, wrong-target, expired, and replayed challenges fail closed.
- Pending devices cannot perform trusted operations.
- Revoked devices cannot authorize later requests.
- Key replacement is rejected unless an explicit rotation flow is invoked.
- No network, Firebase/Cloudflare SDK, credentials, persistent storage, or production imports are used.
- Documentation clearly says this is a protocol model, not proof of production security or physical-device identity.

No code in this document is wired to Awwab's live app or backend.
