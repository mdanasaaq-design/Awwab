# Phase 1F — Honest Empty State for Trusted Devices

**Status:** Acceptance criteria recorded before application-code edits  
**Phase:** 1 — Web command-center UX  
**Branch:** `fix/phase-1-device-empty-state-copy`  
**Scope:** A narrowly bounded copy and accessibility correction in Settings. No backend, authorization, Firebase configuration, assistant runtime, or deployment changes.

## Problem

The trusted-device list's successful empty result currently says **"No device records loaded."** That wording suggests loading failed even when the request completed successfully with an empty list. The interface should distinguish a successful empty result from loading and error states.

## Intended change

1. Replace the misleading successful-empty message with clear wording that says no devices are registered.
2. Expose the successful empty result as a polite status for assistive technology.
3. Preserve existing loading, refreshing, and error messaging and the existing manual refresh action.
4. Do not fabricate a device, change device lifecycle behavior, or alter authorization/backend code.

## Acceptance criteria

- [ ] A successful response containing zero devices displays a clear successful-empty message, not "No device records loaded."
- [ ] The empty state is announced politely to assistive technology without stealing focus.
- [ ] Loading, refreshing, and request-error states remain distinct from a successful empty result.
- [ ] The Refresh list control remains available and continues to invoke the existing refresh function.
- [ ] Existing device rows and approve/revoke flows are unchanged.
- [ ] No backend, Firestore Rules, auth, dependency, or deployment changes are included.
- [ ] Web typecheck/build passes in CI; no local/browser result is claimed unless actually observed.
- [ ] Manual browser review remains explicitly pending if no browser session is available.

## Verification plan

- Review the diff to confirm only the successful-empty UI copy/semantics and this acceptance record change.
- Run the repository's existing web build through CI.
- Manual follow-up: inspect Settings after a successful empty response, during loading, and after a request failure; confirm the states remain distinguishable.

## Rollback

Revert this small UI/documentation change if the copy is inaccurate for a valid empty device state or if status announcements create accessibility problems.
