# Phase 1H — Command Center Operational Overview

**Status:** Acceptance criteria recorded before implementation.  
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
