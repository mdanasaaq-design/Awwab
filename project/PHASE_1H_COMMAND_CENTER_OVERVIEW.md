# Phase 1H — Command Center Operational Overview

**Status:** Implemented directly on `main` in `apps/web/src/App.tsx` and `apps/web/src/styles.css`; the setup-error attribution fix was added on 2026-10-28. GitHub Actions run [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) passed all four jobs, including web typecheck/build and Firebase emulator suites. Browser/manual review remains pending.  
**Phase:** 1 — Web command-center UX  
**Scope:** Add a compact, truthful operational overview to the signed-in Assistant landing page, using existing application state only. No new data sources, dependencies, backend changes, or external side effects.

## Problem

The signed-in landing page has an assistant panel and navigation rows, but no compact at-a-glance summary of which capabilities are available. A command-center layout should make the current system state easy to scan without implying that planned workflows are already connected.

## Acceptance criteria

- [ ] The Assistant landing page presents a compact three-part overview for Assistant Core, device trust, and workspace data availability.
- [ ] Assistant Core and workspace-data statuses clearly say they are not connected; no fabricated counts, activity, or success claims are introduced.
- [ ] Device-trust status is derived from the existing `deviceStatus` state, with attention visually distinguishable from a trusted state.
- [ ] The overview uses existing design tokens, fits desktop and narrow mobile layouts without horizontal overflow, and keeps text readable.
- [ ] Existing navigation, quick-switcher keyboard behavior, sign-in, device-management flows, and disabled assistant composer remain unchanged.
- [ ] No backend, Firebase Rules/configuration, dependencies, secrets, or deployment settings change.
- [ ] Relevant automated checks are run when practical; any unperformed browser/manual review remains explicitly pending.

## Verification

1. Inspect the diff for scope and truthful state labels.
2. Run the web typecheck/build if an efficient check is available.
3. Follow up with desktop/mobile browser review; do not claim that review before it is performed.

## Rollback

Remove the overview markup and its dedicated styles, then remove this phase from active status if it causes responsive, accessibility, or state-accuracy regressions.


---

> **Planning sync — 2026-10-27:** This file records scope and acceptance criteria for a bounded phase slice. The presence of this checklist is not proof that manual browser validation or live integration has passed. See [Master Plan and Work Audit](MASTER_PLAN.md) for current blockers and sequence.


## Follow-on bounded fix — setup error attribution

Source review found that the signed-in initialization chain groups `registerWebDevice()` and `ensureUserProfile()` in one `Promise.all` and one catch. A profile-initialization failure can therefore incorrectly set device status to `registration failed`, even when the registration result may have succeeded.

**Acceptance criteria before implementation:**
- [ ] Registration failures set `registration failed` and show an error.
- [ ] Profile-initialization failures do not overwrite an already returned device-registration status; the error remains visible.
- [ ] Module/setup failures remain visible without a false trusted/success state.
- [ ] Device loading exits its loading state on failure.
- [x] Web typecheck/build CI passes in run [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657); browser/manual verification remains pending unless observed.
- [ ] No backend, Firebase Rules/configuration, dependency, or deployment changes.

This is a bounded Phase 1 state-accuracy fix, not evidence that the current browser flow has been manually validated.
