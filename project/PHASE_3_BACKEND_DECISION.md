# Phase 3 — strict-$0 backend decision

**Review date:** 2026-10-28  
**Status:** Research and architecture decision complete; live implementation is **NO-GO** until the explicit gates below are satisfied.  
**Scope:** Compare backend candidates for Awwab's device-trust API under the non-negotiable $0 constraint.  
**Authorization boundary:** No accounts/projects/resources created, no credentials or secrets generated, no billing changes, no Firestore Rules changes, no data migration, no deployment, and no production code changed.

## Executive decision

**There is currently no backend path demonstrated to meet all of Awwab's security, operational, and strict-$0 requirements. Defer live device management.**

The next technical candidate to evaluate locally is an isolated Supabase Edge Function + dedicated device-only database, retaining Firebase Authentication. This is a candidate for further local design and test work only—not approval to create a Supabase project, deploy an Edge Function, or migrate data.

Why it is not approved yet:
- Supabase's documented Firebase third-party integration expects a `role: "authenticated"` claim for Data API authorization, while standard Firebase ID tokens do not normally contain that claim. The documented ways to add it may require Identity Platform or Firebase Admin/Cloud Functions, which conflicts with the present no-Blaze constraint.
- A manually verified Firebase token inside an Edge Function may avoid the gateway role-claim dependency, but that is security-critical custom authentication and has not been implemented, independently reviewed, or tested in the hosted Edge Runtime.
- Supabase Free projects can pause after a period of low activity, so Free is not a guaranteed always-on service. Quotas and eligibility have not been validated against the user's actual account.
- The Edge Function's service-role credential bypasses RLS. Isolation limits potential blast radius but does not remove the need for strict server-side authorization, secret management, transactional invariants, and recovery procedures.

## Candidate comparison

| Candidate | Assessment | Decision |
|---|---|---|
| Existing Firebase callable Cloud Functions on Spark | Firebase Cloud Functions deployment requires the Blaze plan; no billing upgrade is allowed. | **Reject for live deployment under current constraint.** |
| Cloudflare Worker + Google service identity + existing Firestore REST | Google OAuth/IAM access bypasses Firestore Security Rules. Current records share a database with other user/workspace data; no acceptable narrow collection-level IAM boundary or verified no-billing credential path has been demonstrated. A leaked long-lived service-account key would have a significant blast radius. | **Reject for current design.** Reconsider only if least privilege and identity can be proven without billing or broad database access. |
| Supabase Edge Function + isolated device-only Postgres database | Better potential data isolation, and Supabase documents Firebase Auth integration. But the role-claim mismatch, custom token-verification option, Free-plan pausing, and actual $0 eligibility remain unresolved. | **Preferred research candidate, not approved for provisioning or deployment.** |
| Browser directly writes privileged device records | Client-controlled state cannot securely enforce trusted-device approval, proof-of-possession, one-time challenge consumption, or audit invariants. | **Reject. Do not loosen Firestore Rules.** |
| Keep current Firebase Auth and defer live device trust | Preserves existing account authentication and restrictive Rules; device-management UI must truthfully show unavailable/failure rather than pretend registration succeeded. | **Recommended current operating state.** |

## Required architecture if the isolated Supabase candidate is later approved

1. Keep Firebase Authentication as the account identity provider; do not migrate user accounts.
2. Store only device lifecycle metadata in a dedicated database/project. Do not mirror general Awwab workspace data.
3. Expose a small, allowlisted server API for health, registration/bootstrap, list, approval, revocation, challenge issuance/verification, and profile initialization only if needed.
4. Derive the UID exclusively from a verified Firebase ID token. Never trust a UID from request JSON.
5. Use a maintained JWT verification library where compatible; validate RS256 signature and current Google signing keys, cache keys according to response cache headers, and verify issuer, audience, subject, expiry, issued-at time, and authentication time. Define revocation/session policy. Fail closed on key-fetch or identity-provider uncertainty. The synthetic verifier in this repository is not production authentication code.
6. Bind an Ed25519 public key to each enrolled device. Sign short-lived, unpredictable challenges that include UID, device/key version, action, target, and request context. Do not treat a browser key as proof of a unique physical machine or hardware-backed identity.
7. In one database transaction, consume the challenge, verify current device state, apply the protected state transition, enforce the last-trusted-device invariant, and write the success audit record. Enforce unique constraints and safe concurrency behavior. Failed verification must not mutate state.
8. Keep the service-role secret exclusively in the server environment; never send it to the browser, commit it, log it, or expose it through error messages. Treat RLS as defense-in-depth, not a boundary against a service-role key.
9. Establish strict per-user and per-IP rate limits, request/body bounds, sanitized errors, structured security logging, data deletion/export, backup/recovery, and provider-outage behavior.
10. Add a hard cost stop: no billing upgrades, paid add-ons, automatic paid fallback, or chargeable overages. If account eligibility, quotas, required features, or a provider prompt cannot be verified as $0, do not provision the service.

## Acceptance gate before provisioning or implementation

Every item must be satisfied and reviewed before any account/resource/secret creation or hosted proof of concept:

- [ ] Resolve the Firebase-token / Supabase-role claim mismatch with a documented supported approach that does not require Blaze/Identity Platform, or independently review and test the custom-verification alternative.
- [ ] Validate exact Free-plan limits, inactivity behavior, project eligibility, and billing safeguards against current official docs and account UI. Do not add a payment method or accept a paid-plan prompt.
- [ ] Complete a threat model for account takeover, first-device bootstrap, key loss/recovery, XSS, replay, cross-user access, key rotation, concurrent approvals/revocations, and last-trusted-device protection.
- [ ] Specify database schema, restrictive RLS, service-role isolation, unique constraints, and atomic transaction boundaries.
- [ ] Build local-only tests for token failures, cross-user attempts, wrong key/action/target, expired and replayed challenges, revoked/pending devices, concurrency, idempotency, and audit consistency.
- [ ] Independently review the production token-verification design and the deployed runtime's crypto/key-fetch behavior.
- [ ] Define rate limits, secret rotation/revocation, logging redaction, data deletion/export, backup/recovery, and provider-outage behavior.
- [ ] Obtain explicit owner approval for a specific non-production proof of concept after all preceding gates pass.

## Evidence and references

- Firebase ID token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase session/revocation behavior: https://firebase.google.com/docs/auth/admin/manage-sessions
- Supabase Firebase Auth integration and `role` claim: https://supabase.com/docs/guides/auth/third-party/firebase-auth
- Supabase Edge Function limits/secrets: https://supabase.com/docs/guides/functions/limits
- Supabase Free project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase billing and plans: https://supabase.com/docs/guides/platform/billing-on-supabase
- Firestore REST API authentication (Rules vs IAM): https://firebase.google.com/docs/firestore/use-rest-api
- Google service-account key best practices: https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys

## Completion record

Phase 3 is complete as an architecture research and decision phase: candidates compared, risks documented, preferred candidate named for further local-only work, and the current no-go decision recorded. This is **not** proof that a backend is operational, that hosted authentication works, or that the proposed service can be guaranteed to remain $0. No live changes were made.
