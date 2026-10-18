# Awwab Design Direction

Awwab should feel like a calm personal command center, not a generic chatbot.

## Experience goal

Reduce cognitive load. Users should be able to ask naturally, see what Awwab understood, approve consequential actions, inspect results/evidence and recover from failures.

## Web

Primary areas:
- Assistant
- Today
- Tasks
- Projects
- Research
- Automations
- Approvals
- Activity
- Settings

The assistant remains the primary surface.

## Response design

- Simple request: direct answer.
- Research: answer + sources + uncertainty.
- Multi-step work: concise plan + progress + result.
- Action: proposed action + target + scope + risk + approval.
- Failure: what failed + what was preserved + retry/decision needed.

## Proactivity

Suggestions must be relevant, explainable, dismissible, rate-limited and preference-aware. Prefer one high-value suggestion over many notifications.

## Today

Combine commitments, deadlines, reminders, pending approvals and selected proactive suggestions without becoming an overwhelming dashboard.

## Android

Prioritize assistant, voice/text, Today, notifications, approvals and quick actions using native Android patterns.

## Trust UX

Expose clear states:
- planning
- waiting for approval
- executing
- verifying
- completed
- failed
- cancelled

## Accessibility

Target keyboard navigation, semantic labels, readable contrast, scalable text, screen-reader compatibility and reduced motion.

### Navigation behavior

- The signed-in shell provides a skip link to main content.
- The quick switcher is available from the top bar and with Ctrl+K / Cmd+K.
- Search filters existing sections; arrow keys change the active result, Enter navigates, and Escape closes.
- The switcher must announce its dialog/search semantics, move focus into the dialog, keep keyboard focus within it while open, and restore focus on close.
- Keyboard shortcuts must not interrupt normal typing in editable fields.
- The top-bar status label describes sign-in state; it must not imply a deployment environment unless environment configuration actually establishes that state.
- Device management must distinguish loading, successful empty results, and request errors. A failed refresh must not be presented as a successful empty list.

## Visual direction

Prefer restrained hierarchy, low noise, fast interactions, consistent status language and clear error states.

Avoid fake terminal aesthetics, excessive animation and dashboards that expose internal complexity without user value.
