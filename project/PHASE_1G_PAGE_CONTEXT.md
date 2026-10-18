# Phase 1G — Page Context and Browser Title

**State:** Implemented and merged in [PR #20](https://github.com/mdanasaaq-design/Awwab/pull/20). CI passed; manual browser review remains pending.  
**Scope:** Web presentation/accessibility only.

## Problem

The command-center shell updates its visible breadcrumb and page heading when the user switches sections, but the browser tab title may remain generic. That weakens orientation when several tabs are open and can make the current workspace harder to identify in browser history and assistive-technology context.

## Acceptance criteria

- [ ] The browser document title identifies the current section and Awwab (for example, `Assistant · Awwab`, `Settings · Awwab`).
- [ ] The title updates whenever the active section changes through sidebar navigation, the quick switcher, dashboard links, and the Awwab home link.
- [ ] The title is set from the existing trusted section metadata; no user-provided content is inserted into the title.
- [ ] Existing visible breadcrumbs, page headings, keyboard shortcuts, focus restoration, and navigation behavior remain unchanged.
- [ ] The sign-in view has a clear Awwab-branded document title before and after authentication state changes.
- [ ] No new dependency, backend/API, Firebase, auth-flow, assistant-runtime, or deployment changes.
- [x] Web typecheck and production build pass in CI; the full four-job workflow passed in [run 39126859097](https://github.com/mdanasaaq-design/Awwab/actions/runs/39126859097).
- [x] Manual review is explicitly left pending; no authenticated browser session was exercised by this workflow.

## Validation plan

1. Inspect the existing HTML document title and the section metadata in `apps/web/src/App.tsx`.
2. Use a small React effect to keep the title in sync with the current auth/navigation state, restoring a useful sign-in title when signed out.
3. Run the repository CI checks and report their observed result.
4. Manually check Assistant, Projects, Tasks, Research, Automations, Activity, and Settings titles in a browser when an authenticated test session is available.

## Out of scope

- URL routing or browser-history changes.
- New keyboard shortcuts or quick-switcher behavior.
- Changes to authentication, trusted-device lifecycle, backend services, or assistant capabilities.
- Production deployment.
