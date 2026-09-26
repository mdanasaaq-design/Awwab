# Awwab Authentication and Session Model

## Authentication
Initial authentication uses Firebase Authentication.

The first implementation should support a small number of sign-in methods rather than adding every provider immediately. Provider expansion is a product decision.

Firebase ID tokens are short-lived (about one hour); Firebase refresh tokens are used to obtain new ID tokens and can be revoked by the Admin SDK. citeturn0search2

## Session model
Authentication establishes the user's Firebase identity. A separate Awwab session layer controls:
- active device
- trusted-device state
- recent sensitive-action authentication
- session/re-authentication requirements
- device revocation

Do not invent a second long-lived authentication token when Firebase Authentication already manages the primary session.

## Device model
Each installation gets an opaque `deviceId` stored locally and represented by `users/{uid}/devices/{deviceId}`.

Device states:
- `pending`
- `trusted`
- `revoked`

A newly authenticated installation starts as pending, except for the explicit first-device bootstrap path.

## Device enrollment and management
The backend owns the device state transitions.

- `bootstrapFirstDevice` may trust the first installation for an account. This is an intentional bootstrap assumption and must remain a narrow one-time path.
- `registerDevice` creates later installations as `pending`.
- A trusted device can approve a pending device.
- A trusted device can revoke another trusted or pending device.
- The last trusted device cannot be revoked, preventing an account from locking itself out through ordinary device management.
- A revoked device cannot self-reactivate through `registerDevice`.
- Privileged device-management calls require the caller's Firebase identity plus a caller `deviceId` whose server-side record is currently `trusted`.
- The client never writes device documents directly.

The device ID is an authorization reference, not an authentication credential. A future recovery mechanism must not rely on possession of a device ID alone.

## Sensitive actions
For high-risk actions, require:
1. authenticated Firebase user
2. valid device/session state
3. server-side permission check
4. explicit approval
5. fresh authentication/re-authentication where appropriate
6. exact action payload validation
7. audit record

## Revocation
A device can be revoked from Awwab. Account-level session revocation can use Firebase Admin SDK refresh-token revocation when required. citeturn0search2

## Cloud Function boundary
Use callable functions for client-initiated privileged operations where appropriate. Callable requests can automatically carry Firebase Auth and App Check tokens, and the backend receives the authenticated UID. citeturn0search3

Every callable function must still perform operation-specific authorization.

## App Check
App Check is an additional app-instance authenticity signal, not a replacement for Firebase Authentication or authorization. Enforcement should be enabled after observing metrics and validating client builds. citeturn0search7

## Rules principle
Firestore client rules should follow ownership, not merely authentication. Firebase explicitly documents owner-scoped access patterns and warns against granting every signed-in user broad access. citeturn0search6turn0search13

## Device registration implementation
The web and Android clients must generate an opaque installation-specific `deviceId` and send it to the backend through callable functions.

- `registerDevice` creates a new device as `pending`.
- Existing devices only update safe liveness metadata through the same backend boundary.
- `bootstrapFirstDevice` can create the first device as `trusted` only when the account has no existing device.
- `listDevices` returns sanitized device metadata only after validating the caller's trusted device state.
- `approveDevice` and `revokeDevice` are trusted-device-only mutations.
- Device-management actions write backend-controlled audit records.

