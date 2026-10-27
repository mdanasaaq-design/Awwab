# Phase 1B — Device List Loading and Empty States

**Status:** Implemented on the branch; CI passed; browser/manual review pending  
**Phase:** 1 — Web command-center UX  
**Branch:** `feat/phase-1-keyboard-navigation`  
**Scope:** Correctly distinguish loading, empty, and failed device-list states in Settings.

## Problem

The Settings view currently shows “No device records loaded” whenever the device array is empty and no error is present. During an in-flight request, this can look like an empty result even though the app is still loading.

## Intended change

- Track device-list loading state for initial loads and manual refresh.
- Show a visible, announced loading message while no devices have loaded.
- Do not show the empty state while a request is in progress.
- Disable the refresh control while loading and give it an accurate busy label.
- Preserve the existing error alert and truthful empty copy after a successful empty result.
- Keep existing approve/revoke behavior and backend calls unchanged.

## Acceptance criteria

- [ ] Initial device fetch shows “Loading trusted devices…” rather than an empty-state message.
- [ ] Refresh disables the refresh button and changes its label to “Refreshing…”.
- [ ] A successful response with zero devices shows an empty state only after loading ends.
- [ ] A failed request shows an alert and never presents failure as a successful empty result.
- [ ] Existing device rows remain visible if a refresh fails after previously loaded rows exist.
- [ ] Loading status is announced with an appropriate status role.
- [ ] No new backend call, permission, or side effect is introduced.
- [ ] Web typecheck/build CI passes.
- [ ] The manual state checklist is recorded; browser interaction is not claimed unless observed.

## Implementation and validation record

- Code: `apps/web/src/App.tsx` and `apps/web/src/styles.css`.
- Pull request: [#5](https://github.com/mdanasaaq-design/Awwab/pull/5).
- CI: run [39116279874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116279874) passed on code commit `7923b0a535b92ac2d2b6d972cea533f80815f174` (web typecheck/build, Functions/shared typecheck, Firestore Rules tests).
- Browser/manual verification has not been observed in this environment.

## Manual verification checklist

- [ ] Open Settings while the device list is initially loading; verify the loading message.
- [ ] Verify “No device records loaded” appears only after a successful empty response.
- [ ] Click Refresh list; verify the button disables and says “Refreshing…”.
- [ ] Simulate or observe a failed refresh; verify the error is announced and not replaced by the empty state.
- [ ] Verify already-loaded rows remain visible after a refresh error.

## Non-goals

No changes to backend device lifecycle, trust rules, approval, revocation, Firebase configuration, or deployment.


---

> **Planning sync — 2026-10-27:** This file records scope and acceptance criteria for a bounded phase slice. The presence of this checklist is not proof that manual browser validation or live integration has passed. See [Master Plan and Work Audit](MASTER_PLAN.md) for current blockers and sequence.
