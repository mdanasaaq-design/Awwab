# Phase 2C — Preserve the Last Trusted Device Under Concurrent Revocation

**Status:** Implementation committed; CI validation pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-last-device-revocation`  
**Risk:** AWW-003 (P0)

## Problem

`revokeDevice` currently reads the trusted-device count and updates the target in separate operations. Two concurrent requests can both observe multiple trusted devices and revoke different devices, potentially leaving the account with no trusted device.

## Intended change

- Move target-state validation, trusted-device counting, target revocation, and the audit event into one Firestore transaction.
- For trusted targets, read the full trusted-device query inside the transaction before any writes.
- Reject revocation if the transaction sees one or fewer trusted devices.
- Preserve idempotent success for an already-revoked target and permit revoking pending devices without changing the trusted-device count.
- Add an emulator callable test that creates two trusted devices and revokes them concurrently.
- Keep the backend authoritative; UI confirmation is not a substitute for server-side enforcement.

## Acceptance criteria

- [ ] Two simultaneous attempts to revoke two trusted devices produce at most one successful state transition.
- [ ] The losing operation fails safely with a precondition error when it would remove the final trusted device.
- [ ] Exactly one trusted device remains after the concurrent test.
- [ ] A sequential attempt to revoke the final trusted device is rejected.
- [ ] Repeating a revoke for an already-revoked device remains idempotent.
- [ ] Pending-device revocation remains supported and does not alter the trusted-device count.
- [ ] The target state, trusted-device count, revocation update, and audit event are transactionally consistent.
- [ ] Callable emulator tests and existing Rules/web/Functions/shared CI checks pass.
- [ ] Risk register and current status record the observed result.
- [ ] No deployment is performed.

## Implementation record

- Backend change: `backend/functions/src/index.ts` moves trusted-count validation, target revocation, and audit creation into one transaction.
- Callable test: `tests/functions.callable.test.js` now races two trusted-device revocations and verifies one trusted device remains, while checking final-device rejection, idempotent repeat, and pending-device revocation.
- CI result: pending for the current branch.

## Test plan

Use the existing callable emulator harness. Create an Auth emulator user, bootstrap trusted device A, register pending device B, approve B from A, then invoke two concurrent `revokeDevice` calls: A revokes A while B revokes B. Assert exactly one call succeeds, the other fails with `FAILED_PRECONDITION`, and `listDevices` reports exactly one trusted and one revoked device. Also test final-device rejection and idempotent repeat behavior.

## Non-goals

No client authorization bypass, new recovery flow, device UI change, or production deployment.
