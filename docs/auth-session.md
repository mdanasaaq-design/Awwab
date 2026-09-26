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

A newly authenticated installation starts as pending. The exact trusted-device enrollment UX will be finalized during implementation.

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
