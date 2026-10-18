# Phase 1C — Confirm Device Revocation

**Status:** Acceptance criteria recorded before implementation  
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
- [ ] Keyboard navigation and visible focus remain usable.
- [ ] Web typecheck/build CI passes.
- [ ] Manual confirm/cancel/error checks are recorded; no browser interaction is claimed unless observed.

## Manual verification checklist

- [ ] Click Revoke and verify no immediate state change occurs in the backend/device list.
- [ ] Verify the confirmation names the intended device.
- [ ] Cancel and verify the row remains unchanged.
- [ ] Confirm and verify the existing revoke flow runs once and refreshes the list.
- [ ] Verify busy state prevents duplicate confirmation.
- [ ] Verify a failure shows an error and does not falsely mark the device revoked.

## Non-goals

No backend authorization change, Firestore Rules change, new callable, device-trust policy change, or deployment.
