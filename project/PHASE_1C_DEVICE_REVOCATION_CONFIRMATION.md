# Phase 1C — Confirm Device Revocation

**Status:** Implemented on the branch; CI passed; browser/manual review pending  
**Phase:** 1 — Web command-center UX  
**Branch:** `feat/phase-1-keyboard-navigation`  
**Scope:** Add an explicit in-UI confirmation step before invoking the existing revoke callable.

## Problem

The Settings device list currently calls the revoke operation immediately when a user presses “Revoke”. Revoking access is consequential and should provide a clear chance to confirm the target and cancel without making a backend request.

## Intended change

- Make the first click on “Revoke” enter a per-device confirmation state only.
- Show a clear prompt that identifies the selected device and explains that its access will be revoked.
- Provide explicit “Confirm revoke” and “Cancel” controls.
- Invoke the existing revoke handler only after confirmation.
- Keep the existing busy, success-refresh, and error behavior.
- Never treat confirmation UI as authorization; the backend remains responsible for permission checks.

## Acceptance criteria

- [ ] Clicking “Revoke” does not call the backend and shows confirmation for that specific device.
- [ ] The prompt identifies the device name and communicates the access consequence.
- [ ] “Cancel” exits confirmation without a backend call.
- [ ] “Confirm revoke” invokes the existing revoke flow for the selected device only.
- [ ] Confirm/cancel controls are disabled or stable while the revoke request is in progress; duplicate submissions are prevented.
- [ ] Already-revoked devices never offer the confirmation action.
- [ ] Errors remain visible and the device list refreshes only according to the existing handler behavior.
- [ ] Opening confirmation moves focus to Confirm revoke; Cancel returns focus to that device's Revoke trigger; after successful revocation focus moves to the trusted-device list.
- [ ] Keyboard navigation and visible focus remain usable.
- [ ] Web typecheck/build CI passes.
- [ ] Manual confirm/cancel/error checks are recorded; no browser interaction is claimed unless observed.

## Implementation and validation record

- Code: `apps/web/src/App.tsx` and `apps/web/src/styles.css`.
- Pull request: [#5](https://github.com/mdanasaaq-design/Awwab/pull/5).
- CI: run [39116279874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116279874) passed on code commit `7923b0a535b92ac2d2b6d972cea533f80815f174` (web typecheck/build, Functions/shared typecheck, Firestore Rules tests).
- Browser/manual verification has not been observed in this environment.

## Manual verification checklist

- [ ] Click Revoke and verify no immediate state change occurs in the backend/device list.
- [ ] Verify the confirmation names the intended device.
- [ ] Cancel and verify the row remains unchanged.
- [ ] Confirm and verify the existing revoke flow runs once and refreshes the list.
- [ ] Verify focus moves to Confirm revoke, Cancel returns focus to Revoke, and successful revocation leaves focus on the device list.
- [ ] Verify busy state prevents duplicate confirmation.
- [ ] Verify a failure shows an error and does not falsely mark the device revoked.

## Non-goals

No backend authorization change, Firestore Rules change, new callable, device-trust policy change, or deployment.
