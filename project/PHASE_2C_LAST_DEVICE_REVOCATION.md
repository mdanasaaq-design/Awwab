# Phase 2C — Preserve the Last Trusted Device Under Concurrent Revocation

**Status:** Implemented and verified in CI (2026-10-28)  
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

- [x] Two simultaneous attempts to revoke two trusted devices produce at most one successful state transition.
- [x] The losing operation fails safely with a precondition error when it would remove the final trusted device.
- [x] Exactly one trusted device remains after the concurrent test.
- [x] A sequential attempt to revoke the final trusted device is rejected.
- [x] Repeating a revoke for an already-revoked device remains idempotent.
- [x] Pending-device revocation remains supported and does not alter the trusted-device count.
- [x] The target state, trusted-device count, revocation update, and audit event are transactionally consistent.
- [x] Callable emulator tests and existing Rules/web/Functions/shared CI checks pass.
- [x] Risk register and current status record the observed result.
- [x] No deployment is performed.

## Implementation record

- Backend change: `backend/functions/src/index.ts` moves trusted-count validation, target revocation, and audit creation into one transaction.
- Callable test: `tests/functions.callable.test.js` now races two trusted-device revocations and verifies one trusted device remains, while checking final-device rejection, idempotent repeat, and pending-device revocation.
- CI passed on commit `317e742b368d3f37e0948270978c50096e858974`: [run 40685807443](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685807443). All four jobs passed, including callable emulator tests, Firestore Rules tests, web typecheck/build, and Functions/shared typecheck. The callable suite reports 4 passing test groups; the concurrency case verifies exactly one revocation succeeds and one trusted device remains.
- Verification is emulator/CI evidence only; no live Firebase device lifecycle was tested and no deployment was performed.

## Test plan

Use the existing callable emulator harness. Create an Auth emulator user, bootstrap trusted device A, register pending device B, approve B from A, then invoke two concurrent `revokeDevice` calls: A revokes A while B revokes B. Assert exactly one call succeeds, the other fails with `FAILED_PRECONDITION`, and `listDevices` reports exactly one trusted and one revoked device. Also test final-device rejection and idempotent repeat behavior.

## Non-goals

No client authorization bypass, new recovery flow, device UI change, or production deployment.


---

> **Planning sync — 2026-10-27:** This file records scope and acceptance criteria for a bounded phase slice. The presence of this checklist is not proof that manual browser validation or live integration has passed. See [Master Plan and Work Audit](MASTER_PLAN.md) for current blockers and sequence.
