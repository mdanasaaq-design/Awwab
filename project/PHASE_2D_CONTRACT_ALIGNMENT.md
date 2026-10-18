# Phase 2D — Canonical Device Callable Contracts

**Status:** Implementation committed; CI validation pending  
**Phase:** 2 — Foundation security and environment validation  
**Branch:** `fix/phase-2-contract-alignment`  
**Risk:** AWW-004 (P1)

## Problem

The shared `DeviceRecord` omits `deviceId` and requires timestamp strings that the backend actually returns as nullable ISO strings. The web client declares a second local record type and uses incomplete callable response generics that omit fields such as `ok`, `deviceId`, and `callerDeviceId`. This lets client/server contracts drift silently.

## Intended change

- Make the shared device-list record match the serialized `listDevices` response exactly.
- Define shared request/response DTOs for bootstrap/register, list, approve, revoke, and profile initialization callables.
- Remove the duplicate local web `DeviceRecord` definition and use shared types in the web callable client.
- Keep runtime validation of untrusted backend request payloads; TypeScript contracts do not replace validation.
- Extend callable emulator assertions to verify the documented response envelopes and key fields.
- Document any remaining profile-domain type gap rather than pretending all domain contracts are complete.

## Acceptance criteria

- [ ] Shared `DeviceRecord` includes `deviceId` and nullable timestamp fields that match the actual callable output.
- [ ] Shared DTOs represent the success envelope and fields returned by each existing device/profile callable.
- [ ] Web callable generics use those shared DTOs; no duplicate local device-record interface remains.
- [ ] The client still handles bootstrap `failed-precondition` by falling back to `registerDevice`.
- [ ] Callable emulator tests assert `ok`, `deviceId`, `status`, `callerDeviceId`, and device record fields where applicable.
- [ ] Existing authentication, device-trust, and transaction behavior is unchanged.
- [ ] Web, Functions, shared contract typecheck, Firestore Rules, and callable emulator CI checks pass.
- [ ] Current status, task list, and risk register record the result and any remaining gaps.
- [ ] No deployment is performed.

## Implementation record

- Shared contracts: `packages/shared/src/contracts.ts` now defines the serialized device record and device/profile callable success DTOs.
- Web client: `apps/web/src/device.ts` consumes the shared response types instead of duplicate local device generics.
- Runtime tests: `tests/functions.callable.test.js` asserts response envelopes and fields.
- CI result: pending for the current branch.

## Test plan

Use the shared-contract typecheck and web/Functions builds for compile-time checks. Use the callable emulator suite to verify runtime response envelopes and device state transitions. Keep the existing negative authentication, bootstrap race, legacy-device, concurrent-revocation, and final-device tests passing.

## Remaining contract gap

The existing `UserProfile` interface remains a planned application-level shape and is not used as a DTO for the current root Firestore profile document. The current root document stores nullable `displayName`/`email` and backend timestamps. Do not use the planned interface as a persisted-profile contract until a separate schema/DTO decision and tests are made.

## Non-goals

No API behavior change, Firestore schema migration, profile-edit workflow, or production deployment.
