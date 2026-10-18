# Phase 1E — Sign-In Error and Retry States

**Status:** Implemented on branch; CI passed; browser/manual review pending  
**Phase:** 1 — Web command-center UX  
**Branch:** `feat/phase-1-auth-error-states`

## Problem

The sign-in form currently displays the raw error message returned by Firebase Authentication. These messages can be technical, inconsistent, or reveal unnecessary implementation details. Users need a clear explanation and a safe retry path.

## Intended change

- Map known Firebase Authentication error codes to concise, actionable user-facing messages.
- Use a generic credential message for invalid email/password combinations to avoid account enumeration.
- Provide a distinct network retry message and a rate-limit cooldown message.
- Keep the existing loading/disabled state and accessible alert semantics.
- Never show raw stack traces, internal project identifiers, or unrecognized provider details.
- Do not change sign-in policy, account creation, password recovery, or backend behavior.

## Acceptance criteria

- [ ] Invalid credentials, unknown user, and wrong password produce the same generic credential message.
- [ ] Network failures explain that the connection failed and invite retry.
- [ ] Rate-limit errors tell the user to wait before retrying.
- [ ] Unexpected errors produce a safe generic message rather than raw provider text.
- [ ] Error text is announced with `role="alert"`.
- [ ] The sign-in button remains disabled while the request is pending and becomes available again after failure.
- [ ] Successful sign-in clears the password and does not leave a stale error.
- [ ] No account-enumeration behavior or authentication policy changes are introduced.
- [ ] Web typecheck/build CI passes.
- [ ] Manual error/retry states are recorded; no browser interaction is claimed unless observed.

## Implementation and validation record

- Code: `apps/web/src/App.tsx`.
- Pull request: [#7](https://github.com/mdanasaaq-design/Awwab/pull/7).
- CI: run [39116623190](https://github.com/mdanasaaq-design/Awwab/actions/runs/39116623190) passed on the branch (web typecheck/build, Functions/shared typecheck, Firestore Rules tests).
- Browser/manual error and retry behavior has not been observed in this environment.

## Manual verification checklist

- [ ] Invalid credentials show the generic credential message.
- [ ] Network failure shows the connection/retry message.
- [ ] Rate limiting shows a wait/retry-later message.
- [ ] Unknown error does not expose raw Firebase details.
- [ ] Error is announced and the user can correct details and retry.
- [ ] Loading state prevents duplicate sign-in submissions.
- [ ] Successful sign-in clears the password and old error.

## Non-goals

No sign-up, password-reset, MFA, provider, or backend authentication policy changes.
