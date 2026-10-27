# Phase 2B — Atomic First-Device Bootstrap and Callable Test Harness

**Status:** Implemented on branch; all CI checks passed; merge pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-bootstrap-concurrency`  
**Risk:** AWW-002 (P0)

## Problem

`bootstrapFirstDevice` checks whether a device exists and creates a trusted device in separate operations. Concurrent requests can both observe an empty collection. The repository currently has Firestore Rules emulator tests but no callable-level emulator test harness to exercise this security boundary.

## Intended change

1. Add a backend-only per-user bootstrap guard document at `/users/{uid}/system/firstDeviceBootstrap`.
2. Keep the legacy existing-device check, then use one Firestore transaction to read the guard and target device and atomically create the guard, trusted device, and bootstrap audit event.
3. Fail safely when the guard or target device already exists. A retry after successful bootstrap must not create a second trusted first device.
4. Add a Node built-in test using the Firebase Auth, Firestore, and Functions emulators. Create an emulator user, issue two concurrent bootstrap calls, and verify exactly one succeeds and the resulting device list has exactly one trusted device.
5. Add a dedicated CI job to build Functions and run the callable emulator test.
6. Document the guard as backend-only and record actual CI evidence.

## Acceptance criteria

- [ ] Two simultaneous bootstrap calls for different valid device IDs yield exactly one success and one safe failure.
- [ ] Listing devices from the successful trusted device returns exactly one trusted bootstrap device.
- [ ] A bootstrap request without Firebase Authentication fails as unauthenticated.
- [ ] A sequential second bootstrap after success fails safely.
- [ ] Existing device records prevent bootstrap, including legacy records without a guard document.
- [ ] The guard, trusted device, and bootstrap audit event are committed atomically.
- [ ] A failed transaction leaves neither a guard-only record nor a trusted device.
- [ ] The callable emulator test runs reproducibly from a documented npm script and in CI.
- [ ] Existing Firestore Rules, web, Functions, and shared-contract checks pass.
- [ ] The issue register and current status reflect observed results.
- [ ] No Firebase deployment is performed.

## Implementation and validation record

- Backend: `backend/functions/src/index.ts` now transactionally creates the per-user guard, trusted device, and audit event.
- Test: `tests/functions.callable.test.js` exercises unauthenticated access, competing bootstrap calls, repeat bootstrap, and legacy-device rejection through the emulators.
- CI: run [39117086761](https://github.com/mdanasaaq-design/Awwab/actions/runs/39117086761) passed all four jobs, including the new backend callable emulator test job.
- No local emulator run or production deployment is claimed.

## Test plan

Use the Firebase Auth, Firestore, and Functions emulators under the demo project ID. The test creates an Auth emulator user via the emulator REST API, invokes the callable Functions emulator with its ID token, runs competing bootstrap requests with `Promise.allSettled`, and uses `listDevices` as the trusted winner to verify server state. The test also verifies unauthenticated and repeated-bootstrap behavior.

## Non-goals

No new authentication policy, recovery flow, device UI, provider integration, or production deployment. The guard is not a client credential and remains inaccessible to direct client writes.


---

> **Planning sync — 2026-10-27:** This file records scope and acceptance criteria for a bounded phase slice. The presence of this checklist is not proof that manual browser validation or live integration has passed. See [Master Plan and Work Audit](MASTER_PLAN.md) for current blockers and sequence.
