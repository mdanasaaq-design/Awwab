# Supabase isolated device-service — local-only design and test gate

**Date:** 2026-10-28  
**Status:** Design/test specification only. Not production code, not a selected architecture, and not permission to create a Supabase project.  
**Constraint:** Strict $0; no billing activation, paid fallback, live resource, secrets, or production change.

## 1. What official documentation establishes

- Supabase documents Firebase Auth as a third-party identity provider, but expects Firebase JWTs to carry `role: "authenticated"` for normal Data API authorization. Existing Firebase ID tokens do not contain this claim by default. The documented approaches to add it rely on Firebase Admin custom claims and an Auth blocking function available with Identity Platform, or Cloud Functions for ongoing claims—both are not presently demonstrated as compatible with Awwab's Spark-only constraint. [Supabase Firebase Auth guide](https://supabase.com/docs/guides/auth/third-party/firebase-auth)
- Supabase Edge Functions default to platform JWT verification. Disabling that check means the function itself must correctly authenticate every request; it is not a safe way to make 401s disappear. [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth) · [401 troubleshooting](https://supabase.com/kb/troubleshooting/edge-function-401-error-response)
- Firebase provides third-party JWT verification requirements for non-Admin-SDK backends: RS256 signature and matching key ID, expiry and issued-at checks, project audience, issuer, non-empty subject, and appropriate key caching. [Firebase ID token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- Supabase Free currently lists 500,000 Edge Function invocations/month, a 500 MB database, 50,000 third-party MAUs, and project pausing after one week of inactivity. The documented quotas do not establish a perpetual uptime or no-cost guarantee for every configuration. [Pricing](https://supabase.com/pricing) · [Billing and usage](https://supabase.com/docs/guides/platform/billing-on-supabase)

## 2. Candidate boundary

If this candidate ever passes the approval gate, use a dedicated Supabase project/database containing only device-management records. Do not give it access to Awwab's Firestore. Do not expose a service-role/secret key to the browser.

Preferred first evaluation: use the Supabase gateway's documented Firebase third-party auth integration only if the required role claim can be added and maintained without Blaze or Identity Platform. Do **not** assume this works until that dependency is proven.

Alternative to evaluate, not automatically accept: disable platform JWT verification for a single Edge Function and manually verify the Firebase ID token in maintained, reviewed code. It must verify the signature against Google's published keys and check RS256, kid, exp, iat, aud, iss, non-empty sub, and time bounds. Cache keys according to official cache headers; fail closed on unknown keys or verification/network failures. Derive UID only from the verified sub. This function must never trust a UID in JSON, a client-supplied device status, or a caller-supplied device ID as proof of key possession.

The Edge Function's privileged database key would bypass RLS. Isolate the database to device data, use explicit schema/table grants, enable RLS on exposed tables, and keep all privileged mutation paths server-side. RLS is defense in depth, not a substitute for the function's authorization checks when using a bypass key.

## 3. Transaction model required

The live service would need durable database constraints and Postgres transactions. Every sensitive request must couple the one-time challenge consumption, signature verification result, device state transition, last-trusted-device invariant, and audit event in one transaction where applicable.

- First bootstrap must not allow two competing first devices to both become trusted.
- A device must prove possession of its already-bound public key for trusted operations; a device ID string is not proof.
- Approval must be authorized by a different currently trusted device and reject self-approval.
- Revocation must invalidate the device immediately and prevent replay of outstanding challenges.
- Last trusted device protection must survive concurrent revoke requests.
- Audit rows must be committed atomically with successful state changes; failed attempts must not mutate trusted state.
- Unique constraints and foreign keys must prevent cross-user device/target references.
- Transaction retries must be idempotent and must not duplicate transitions or consume a challenge on a failed signature.

The local prototype can model expected outcomes but cannot prove PostgreSQL transaction isolation, Edge runtime behavior, or provider authentication.

## 4. Local-only acceptance tests

Use synthetic UIDs, synthetic device IDs, ephemeral Ed25519 keys, and an in-memory model. No Supabase SDK, Firebase SDK, network, secrets, persistent data, or real user identifiers. Suggested test categories:

### Identity and request validation
- Missing, malformed, expired, not-yet-valid, wrong-audience, wrong-issuer, wrong-project, wrong-signature, unknown-kid, and wrong-algorithm token all fail closed.
- UID from request JSON is ignored; UID is always derived from a verified token.
- Invalid token or public-key lookup failure produces no database mutation.
- Wrong origin, unsupported method, oversized body, malformed JSON, unknown action, and rate-limit rejection produce no state change.
- CORS is not treated as authentication.

### Device proof and lifecycle
- Valid key proof succeeds only for the public key bound to the authenticated UID/device.
- Wrong key, UID, action, target, key version, expired challenge, replay, pending device, and revoked device all fail closed.
- Invalid signature does not consume a challenge if retry policy intends a retry; successful operation consumes it exactly once.
- Silent public-key replacement is rejected.
- Cross-user target IDs never disclose or mutate another user's records.
- First bootstrap race yields exactly one trusted device.
- Concurrent revocations cannot remove the last trusted device.
- Self-approval, pending-device approval, revoked-device reactivation, and replayed approval/revocation fail.
- Successful state transition and audit row are atomic; injected failures leave neither partial state nor a consumed challenge unless the design explicitly documents a safe terminal outcome.

### Isolation, secrets, and cost
- Browser bundle and client config contain no service-role key.
- Repository, logs, errors, and responses contain no secrets or full tokens.
- All tables/schemas have explicit grants and RLS; unauthorized direct Data API access fails.
- Function has no path to the existing Firestore or other Awwab services.
- Quota/paused/unavailable behavior fails closed with a truthful error; there is no paid fallback.
- Before any cloud creation, verify that the plan requires no payment method, cannot automatically upgrade, and hard-stops rather than billing for excess usage. If this cannot be established for the actual account/configuration, reject the option.

## 5. Go/no-go decision

**Current decision: NO-GO for creating or deploying resources.** The local-only tests can validate business rules but cannot prove JWT verification, provider configuration, secret safety, database transactions, free-tier billing behavior, or uptime.

The most important blocker is the Firebase `role` claim dependency. If no supported, strictly free way to satisfy it exists, the manual-verification Edge Function design requires an independent security review before any use. The second blocker is confirming that the selected Free plan and usage limits meet the owner's literal $0 rule without an automatic paid path.

Only after all local design questions are answered should a separate, explicit owner approval be requested for a non-production proof of concept. No deployment or production migration is authorized by this document.


## Research update: Firebase token authentication without the `role` claim — 2026-10-28

### Finding

The missing `role: "authenticated"` claim is a blocker for the **normal Supabase Data API / third-party-auth path**, but it does not necessarily block a narrowly scoped Edge Function that does not rely on Supabase's gateway to authenticate the Firebase token and does not pass that token to the Data API as an authenticated Supabase JWT.

A possible design is:

1. Set platform JWT verification off **for this one function only**, because its incoming bearer token is a Firebase ID token rather than a Supabase-issued JWT.
2. Inside the function, use a maintained JWT/JWKS verification library and Google's published Firebase public keys to validate the token. Check allowed algorithm, `kid`, signature, issuer `https://securetoken.google.com/<firebase-project-id>`, audience equal to the Firebase project ID, expiration, issued-at/time bounds, and non-empty subject. Handle key rotation and caching correctly; fail closed on unknown keys or verifier/network uncertainty.
3. Derive the user ID exclusively from the verified `sub`. Never trust a UID in request JSON.
4. Only after successful verification, use the function's server-only database credential to call a narrowly scoped set of device-service operations in the **separate device-only database**. Do not expose the privileged key to the browser or repository. Use parameterized SQL/RPC or a reviewed server-side data layer; do not concatenate untrusted values into SQL.
5. Keep the database project isolated from Awwab's Firestore. The privileged credential bypasses RLS, so RLS is defense in depth, not the authorization boundary for requests made with that credential. The function must enforce per-user ownership and allowed transitions, and Postgres must enforce transaction/uniqueness constraints.

Sources: [Supabase Edge Function authentication modes](https://supabase.com/docs/guides/functions/auth) · [Supabase authorization headers and gateway verification](https://supabase.com/docs/guides/functions/auth-headers) · [Supabase Firebase Auth integration and role claim](https://supabase.com/docs/guides/auth/third-party/firebase-auth) · [Firebase ID-token verification requirements](https://firebase.google.com/docs/auth/admin/verify-id-tokens).

### What this resolves—and what it does not

- **Resolves at the design level:** a Firebase `role: "authenticated"` custom claim is not necessarily required if the Edge Function itself verifies Firebase ID tokens and does not depend on Supabase's Data API role mapping for the caller.
- **Does not prove implementation safety:** turning off gateway JWT verification removes that gateway check. Every request must be verified by the function before any data access. This needs an independently reviewed implementation and adversarial tests.
- **Does not establish $0 operation:** project eligibility, usage, inactivity pausing, payment-method requirements, and the possibility of paid prompts/overages must still be checked before any resource is created.
- **Does not authorize cloud work:** no project, integration, secret, or function has been created or deployed. This remains a desk-research conclusion.

### Updated decision and next bounded step

Keep the candidate **NO-GO for cloud creation/deployment**. The next useful step is a local-only, dependency-backed token-verification test harness using synthetic test keys/tokens—not live Firebase tokens or credentials—plus an explicit threat model for gateway bypass, key rotation, claim validation, cross-user isolation, and failure behavior. The mock must not be described as proving the deployed Edge runtime or provider configuration. Separately, the strict $0 gate remains mandatory; if it cannot be established for the actual configuration, reject this candidate.
