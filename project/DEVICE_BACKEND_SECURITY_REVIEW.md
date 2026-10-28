# Device backend security review — local/source-only

**Review date:** 2026-10-28  
**Scope:** Read-only review of `backend/functions/src/index.ts`, `firestore.rules`, and the local-only device lifecycle prototype.  
**Production changes:** None. **Cloud resources/billing:** None.  
**Status:** Findings require design decisions and tests; this is not a production security certification.

## What currently looks sound in source

- Callable operations require Firebase Authentication and derive the user scope from `request.auth.uid`.
- Device IDs and platform values have explicit validation; display metadata is length-limited.
- First-device bootstrap uses a Firestore transaction and a per-user guard document.
- Approval checks the caller and pending target inside the same transaction.
- Revocation checks caller state transactionally and protects the last trusted device using a trusted-device query.
- Firestore Rules deny direct client writes to user profile and device records, and default-deny outside explicitly listed paths.

These are source-level observations only; live behavior has not been validated under the user's strict $0 constraint.

## Findings and required follow-up

### High priority — caller device ID is supplied by the caller

The `listDevices`, `approveDevice`, and `revokeDevice` callables accept `deviceId` / `callerDeviceId` from request data. The backend verifies that a device document under the authenticated UID has status `trusted`, but the submitted identifier is not itself proof that the request originated from that physical device.

A different authenticated session for the same UID that learns or guesses a trusted device ID may be able to claim that ID in callable request data. Firebase Authentication proves the account identity, not the physical-device identity. Therefore the current status check should not be treated as strong device-bound authorization.

**Do not loosen Firestore Rules or ship the mock as a fix.** Before relying on device trust for sensitive operations, design a server-verifiable device/session binding (for example, a challenge-based key proof or another reviewed mechanism), including enrollment, key rotation/recovery, replay protection, revocation, and platform-specific constraints. Any candidate must be evaluated against the $0-only requirement before implementation.

### Medium priority — registration/profile initialization retries

- `registerDevice` reads a device document and then creates it if absent. Two simultaneous first registrations for the same ID can race; one may receive an already-exists error instead of an idempotent success. This appears primarily to be retry/availability behavior, not a way to grant trusted status.
- `ensureUserProfile` reads the profile and then creates it when absent. Simultaneous calls can race in the same way.
- Existing registration refreshes metadata and last-seen time for any existing non-revoked record. Review whether callers should be allowed to update metadata for a known trusted ID without device-bound proof.

These paths should receive explicit retry/idempotency tests and carefully scoped transactional or conflict-handling changes only after their API behavior is decided.

### Audit and validation notes

- Successful transitions write success audit records; idempotent repeat revocation intentionally returns without a second transition record in the current source.
- The prototype's synthetic audit data is not evidence that the real backend's audit write is durable or atomic with each state transition.
- The in-memory “simultaneous-style” bootstrap test is deterministic single-process JavaScript and does not prove multi-request Firestore transaction behavior.
- The existing test suite and CI history are not a substitute for a live development-project test. No such live test is authorized under the current no-billing/no-resource constraint.

## Safe next steps

1. Expand and run the local synthetic regression tests.
2. Decide the actual security meaning of “trusted device” and whether Firebase account authentication alone is sufficient for the intended operations.
3. Specify a verifiable device-binding protocol and threat model before changing callable authorization.
4. Add emulator tests for caller spoofing, cross-user access, registration/profile retry races, malformed payloads, and audit consistency.
5. Keep production, billing, Firestore Rules, and deployment unchanged until the owner explicitly authorizes a specific, zero-cost-compatible implementation.

## Cost and deployment guardrail

This review and prototype require no paid service or cloud resource. Do not enable Firebase Blaze, deploy Cloud Functions, create a Cloudflare Worker, or change production rules as part of this work.
