# Phase 1 Implementation Slice — Keyboard-First Navigation

**Status:** Implementation committed; CI passed; manual browser verification pending  
**Phase:** 1 — Web command-center UX  
**Branch:** `feat/phase-1-keyboard-navigation`  
**Scope:** A small navigation/accessibility improvement. This is not the full Phase 1 exit review.

## Problem

The current web shell has working section buttons, but no global way to jump directly between sections from the keyboard, and no explicit skip link to bypass repeated navigation. The top bar's `PERSONAL` badge describes account/workspace context ambiguously rather than the runtime environment.

## Intended change

1. Add a keyboard-accessible quick switcher for the existing sections: Assistant, Projects, Tasks, Research, Automations, Activity, and Settings.
2. Open it from a visible top-bar control and `Ctrl+K` / `Cmd+K`.
3. Support search/filter, arrow-key movement, Enter to navigate, and Escape to close.
4. Keep focus inside the dialog while open, return focus to the opener when closed, and provide accessible dialog/label semantics.
5. Add a skip link that moves keyboard focus to the main content.
6. Replace the ambiguous top-bar `PERSONAL` label with clear account/workspace wording; do not claim an environment is production or development unless configured data actually establishes that.
7. Keep all placeholder pages and assistant availability truthful; do not add live data, assistant execution, new permissions, or external side effects.

## Acceptance criteria

- [ ] Quick switcher opens from the visible control and Ctrl/Cmd+K while signed in.
- [ ] Ctrl/Cmd+K does not fire while the user is typing in an input, textarea, or editable element, except when focus is already in the switcher.
- [ ] Search filters by section label; an empty result state is announced and no invalid selection occurs.
- [ ] Arrow Up/Down updates the active result; Enter navigates to that section; Escape closes.
- [ ] Dialog has an accessible name, modal semantics, labeled search input, and visible keyboard instructions.
- [ ] Focus moves into the dialog when opened, remains usable by keyboard, and returns to the opener when closed.
- [ ] Skip link is first in the signed-in document's keyboard sequence and targets the main content.
- [ ] Keyboard focus remains visibly apparent; existing reduced-motion behavior is preserved.
- [ ] Navigation works at desktop and mobile widths without adding horizontal overflow beyond the existing mobile navigation behavior.
- [ ] No assistant request, privileged action, or external side effect is enabled.
- [x] Web typecheck/build CI passes (run 39116279874); Functions/shared typecheck and Firestore Rules regression checks also passed.
- [ ] Manual interaction checklist is completed and recorded.
- [ ] Status/task/design documentation records exactly what changed and what was or was not tested.

## Implementation record

- Application changes: `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, and new `apps/web/src/navigation.css`.
- Pull request: [#5 — keyboard-first command navigation](https://github.com/mdanasaaq-design/Awwab/pull/5).
- Automated CI result: the latest expanded branch validation passed on code commit `7923b0a535b92ac2d2b6d972cea533f80815f174` in run [39116279874](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116279874): web typecheck/build, Functions/shared typecheck, and Firestore Rules tests all succeeded.
- Browser/manual result: not yet observed in this environment.

## Follow-on UX slice

The same branch also includes [Phase 1B device loading-state work](PHASE_1B_DEVICE_LOADING.md) and [Phase 1C device revocation confirmation](PHASE_1C_DEVICE_REVOCATION_CONFIRMATION.md), each with acceptance criteria recorded before implementation. The latest branch CI now passes; browser/manual verification remains outstanding.

## Contrast note

The shared quiet-text token was raised from `#69717d` to `#858e9b`. The calculated WCAG contrast ratio for this token against the main canvas `#101216` is approximately **5.66:1**. This is a targeted token check, not a complete page-wide contrast audit; remaining hard-coded color pairs still require review.

## Manual verification checklist

Record observed outcomes after implementation:
- [ ] Click quick-switcher button; dialog opens and search is focused.
- [ ] Press Ctrl+K on Windows/Linux and Cmd+K on macOS (where test environment allows).
- [ ] Search each of the seven existing section names and select with Enter.
- [ ] Navigate results with arrows; verify wrapping/edge behavior is consistent with documented implementation.
- [ ] Escape closes and focus returns to the opener.
- [ ] Verify keyboard shortcut is ignored while typing in sign-in and other editable fields.
- [ ] Tab from the start of the signed-in app; activate skip link and confirm focus reaches main content.
- [ ] Verify no-result, narrow viewport, and reduced-motion behavior.
- [ ] Confirm placeholders remain clearly not connected.

## Non-goals

- Full redesign of every screen.
- Adding a third-party command-palette dependency.
- Adding model/runtime connectivity, fake activity, mock metrics, or new backend behavior.
- Production deployment.

## Rollback

Revert this bounded PR if keyboard focus behavior, shortcut conflicts, or mobile navigation regressions are found. No data migration or Firebase change is involved.
