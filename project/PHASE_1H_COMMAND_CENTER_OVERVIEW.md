# Phase 1H — Command Center Operational Overview

**Status:** Implemented directly on `main` in `apps/web/src/App.tsx` and `apps/web/src/styles.css`; the setup-error attribution fix was added on 2026-10-28. GitHub Actions run [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) passed all four jobs, including web typecheck/build and Firebase emulator suites. Browser/manual review remains pending.  
**Phase:** 1 — Web command-center UX  
**Scope:** Add a compact, truthful operational overview to the signed-in Assistant landing page, using existing application state only. No new data sources, dependencies, backend changes, or external side effects.

## Problem

The signed-in landing page has an assistant panel and navigation rows, but no compact at-a-glance summary of which capabilities are available. A command-center layout should make the current system state easy to scan without implying that planned workflows are already connected.

## Acceptance criteria

- [x] Source review confirms the Assistant landing page presents a three-part overview for Assistant Core, device trust, and workspace data availability.
- [x] Source review confirms Assistant Core and workspace-data statuses say they are not connected; no fabricated counts, activity, or success claims are introduced.
- [x] Source review confirms device-trust status derives from `deviceStatus`, with distinct trusted, attention, and pending styles.
- [ ] The overview uses existing design tokens, fits desktop and narrow mobile layouts without horizontal overflow, and keeps text readable.
- [x] Source review confirms the overview is additive and the assistant composer remains disabled; existing navigation, quick-switcher, sign-in, and device-management code paths are untouched by the overview markup/styles.
- [x] The reviewed Phase 1H overview implementation is confined to frontend markup/styles; no backend, Firebase Rules/configuration, dependency, secret, or deployment-setting change is part of this slice.
- [x] Automated CI evidence exists for the frontend baseline and keyboard-focus CSS (runs [40684572657](https://github.com/mdanasaaq-design/Awwab/actions/runs/40684572657) and [40685073409](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685073409)); browser/manual review remains explicitly pending.

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


## Follow-on bounded fix — keyboard focus visibility (2026-10-28)

Source review found the global visible-focus outline covered buttons, links, and inputs but omitted native select and textarea controls. The shared focus-visible selector now includes both controls in commit [4aea511](https://github.com/mdanasaaq-design/Awwab/commit/4aea511b03fd24b8dc57148d216a817530238384).

- [x] Include native select and textarea controls in the existing visible keyboard-focus treatment.
- [x] Keep the existing outline style and design token unchanged.
- [x] Limit the change to frontend CSS; no backend, Firebase, dependencies, or deployment settings changed.
- [ ] Confirm typecheck/build CI for this commit.
- [ ] Manually verify keyboard focus appearance in desktop and mobile browsers.


## Verification correction — 2026-10-28

GitHub Actions run [40685073409](https://github.com/mdanasaaq-design/Awwab/actions/runs/40685073409) passed all four jobs after the keyboard-focus CSS commit: web typecheck/build, Functions/shared typecheck, Firestore security rules tests, and backend callable emulator tests. The run was triggered by a subsequent documentation commit and includes the CSS change. This is automated evidence only; desktop/mobile browser acceptance and keyboard interaction checks remain pending.


## Source acceptance audit — 2026-10-28

Reviewed the current `main` source for the overview markup in `apps/web/src/App.tsx` and its dedicated styles in `apps/web/src/styles.css`. The three cards use truthful not-connected states for Assistant Core/workspace data and derive device-trust copy/classes from `deviceStatus`. The composer remains disabled. The stylesheet includes a single-column overview at the narrow-mobile breakpoint and uses distinct status styles. These are source-level findings only: rendered overflow, text readability, contrast, and real keyboard/screen-reader behavior have not been browser-tested. The visual acceptance criterion below therefore remains unchecked until desktop and narrow-mobile browser review is actually performed.
