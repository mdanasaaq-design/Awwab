# Phase 1D — Mobile Account Controls and Sign-Out Errors

**Status:** Merged into main in PR #6; CI passed; browser/manual review pending  
**Phase:** 1 — Web command-center UX  
**Branch:** `feat/phase-1-mobile-account-controls`

## Problem

The mobile CSS hides the entire sidebar footer, including the only visible sign-out control. In addition, a failed sign-out is not presented as a user-visible error.

## Intended change

- Keep a compact account/device-status footer and sign-out action visible at narrow widths.
- Preserve the horizontal section navigation and avoid clipping or unnecessary horizontal overflow.
- Present a safe, actionable sign-out error if the existing Firebase sign-out operation fails.
- Keep the existing busy state and prevent duplicate sign-out attempts.
- Do not change authentication policy, device trust, backend behavior, or deployment configuration.

## Acceptance criteria

- [ ] Sign-out remains reachable by keyboard and touch at 320px, 375px, tablet, and desktop widths.
- [ ] Device status remains legible on mobile without overwhelming the section navigation.
- [ ] Mobile footer does not clip the sign-out control or create page-level horizontal overflow.
- [ ] Sign-out disables during the request and displays the existing busy label.
- [ ] A failed sign-out shows a concise, non-technical alert with a retry path; no unhandled rejection is left to the UI.
- [ ] Successful sign-out returns to the sign-in screen with no stale error message.
- [ ] No authentication policy or backend behavior changes.
- [ ] Web typecheck/build CI passes.
- [ ] Manual responsive and sign-out failure checks are recorded; no browser interaction is claimed unless observed.

## Implementation and validation record

- Code: `apps/web/src/App.tsx` and `apps/web/src/styles.css`.
- Pull request: [#6](https://github.com/mdanasaaq-design/Awwab/pull/6), merged as `e5dd42d8175fbd6157b9ee9574f91dc3d5b99955`.
- CI: run [39116508500](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116508500) passed (web typecheck/build, Functions/shared typecheck, Firestore Rules tests).
- Browser/manual responsive and sign-out failure checks have not been observed in this environment.

## Manual verification checklist

- [ ] At 320px and 375px, navigate sections and confirm the sign-out control is visible.
- [ ] At tablet and desktop widths, confirm the footer layout remains correct.
- [ ] Tab to Sign out; verify focus is visible and the control is operable.
- [ ] Confirm the busy label and disabled state during sign-out.
- [ ] Simulate a sign-out failure; verify a clear alert appears and retry is possible.
- [ ] Sign out successfully; verify the sign-in screen appears and the error is cleared.

## Non-goals

No new account management, password reset, sign-up flow, Firebase policy, or deployment.
