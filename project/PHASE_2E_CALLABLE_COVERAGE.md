# Phase 2E — Broader Callable Authorization and Failure Tests

**Status:** Implemented on branch; CI passed; merge pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `test/phase-2-callable-coverage`  
**Risk:** AWW-005 (P1)

## Problem

The callable emulator harness now covers first-device bootstrap and trusted-device revocation concurrency, but important authorization and invalid-input paths for the existing device/profile callables are still untested.

## Intended change

Extend the existing Node built-in emulator suite without adding a test framework dependency. Cover authentication, input validation, ownership/trust checks, state transitions, idempotency, and safe failure behavior for the current callable API. Keep the test fixtures isolated by using unique emulator users and device IDs.

## Acceptance criteria

- [ ] Unauthenticated calls to each protected callable fail with `UNAUTHENTICATED`.
- [ ] Invalid/missing device IDs and invalid platform values fail with `INVALID_ARGUMENT`.
- [ ] Registration creates a pending device, repeat registration does not create a duplicate, and revoked devices cannot self-reactivate.
- [ ] A pending device cannot list devices, approve a target, or revoke a trusted target.
- [ ] Listing devices requires a trusted caller; missing device records fail safely.
- [ ] Approval rejects self-approval, missing targets, and non-pending targets; a valid pending target becomes trusted.
- [ ] Revocation rejects missing targets, preserves the final-trusted-device invariant, supports pending-device revocation, and is idempotent for already-revoked targets.
- [ ] Profile initialization is authenticated and idempotent; the callable response matches the shared DTO.
- [ ] The health callable returns its documented success response without requiring user authentication.
- [ ] Existing bootstrap and concurrent-revocation race tests remain green.
- [ ] CI passes the web, Functions/shared, Rules, and callable emulator jobs.
- [ ] Current status, task list, and risk register record the expanded coverage and remaining gaps.
- [ ] No deployment is performed.

## Implementation record

- Test file: `tests/functions.callable.test.js`.
- Coverage added for unauthenticated protected callables, invalid device IDs/platforms, registration idempotency, pending-device authorization denial, self/missing/duplicate approval, missing-target revocation, revoked-device reactivation denial, profile initialization idempotency, and health.
- CI: run [39117914336](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117914336) passed all four jobs, including the expanded callable emulator suite.

## Test plan

Extend `tests/functions.callable.test.js` using the existing Auth, Firestore, and Functions emulators. Assert both successful payloads and normalized callable error status codes. Each test should use unique user/device IDs and verify state through a trusted caller's `listDevices` response wherever possible.

## Non-goals

No new callable endpoints, auth policy changes, activity feed API, or production deployment. Failed-attempt audit events are not introduced in this test-only slice; that policy remains a separate design decision.


---

> **Planning sync — 2026-10-27:** This file records scope and acceptance criteria for a bounded phase slice. The presence of this checklist is not proof that manual browser validation or live integration has passed. See [Master Plan and Work Audit](MASTER_PLAN.md) for current blockers and sequence.
