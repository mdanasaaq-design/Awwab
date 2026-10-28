# Free-tier Firestore backend feasibility — research gate

**Research date:** 2026-10-28  
**Status:** Desk research only. Candidate architecture is technically plausible but **not approved, not implemented, and not proven safe or $0 in this project**.  
**Authorization boundary:** No account/resource creation, secret creation, billing changes, live API calls, migration, Firestore Rules changes, or deployment.

## Executive result

The earlier conclusion should be stated precisely: a secure $0 server-side path has **not yet been demonstrated**. Research identifies a possible pattern—Cloudflare Workers Free as the HTTPS runtime, Firebase Auth ID-token verification in the Worker, and a server-only Google service identity for Firestore REST—but this is only a candidate. It has important credential, IAM blast-radius, token-revocation, atomicity, quota, and operational questions that must be resolved before it could be accepted.

The existing Firebase callable Functions remain unavailable under the strict Spark-only constraint. Firebase documents that Cloud Functions for Firebase requires Blaze, even though the pricing page lists no-cost invocation allowances. [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) · [Cloud Functions FAQ](https://firebase.google.com/docs/functions/faq-and-troubleshooting)

## Candidate architecture under evaluation

1. The browser signs in using the existing Firebase Authentication client and sends its Firebase ID token over HTTPS to the Worker.
2. The Worker validates the token's signature and claims against the Firebase project: allowed algorithm/key ID, signature, expiry, issued-at time, audience, issuer, and non-empty subject. The Worker derives the UID only from the verified token; never from request JSON.
3. The Worker applies endpoint-specific authorization, validates the device-key proof/challenge, applies strict input and rate limits, and refuses unknown routes/actions.
4. For protected Firestore operations, the Worker obtains a short-lived Google OAuth access token using a server-only service identity and calls Firestore REST. Firestore authorizes this path with IAM, not Firestore Security Rules. The credential must never be sent to the browser, logged, or committed.
5. A single Firestore transaction (or a carefully verified equivalent) must couple challenge consumption, device state transition, last-trusted-device invariant, and success audit write. If the transaction cannot safely express the required invariant, the request must fail closed.
6. The Worker uses only the documented free tier; no automatic paid fallback or billing upgrade is allowed. Reaching limits should produce a truthful unavailable response, not bypass authorization or mutate data through a fallback.

Relevant vendor documentation:
- [Verify Firebase ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens): token validation requirements and the distinction between signature/claims verification and revocation checking.
- [Firestore REST API authentication](https://firebase.google.com/docs/firestore/use-rest-api): Firebase ID tokens invoke Security Rules; Google OAuth tokens use IAM and bypass Rules.
- [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/): encrypted Worker secrets are available to server code and should be used instead of plaintext variables for sensitive values.
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/): current Free limits include 100,000 requests/day and 10 ms CPU per invocation; quotas can change and are hard stop conditions.
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/): the Paid plan has a minimum charge, so it is out of scope.

## Major unresolved risks

### 1. Google service identity and credential lifecycle

A service-account private key stored as a Worker secret is materially safer than putting it in browser code or Git, but it is still a long-lived high-value credential. A secret binding protects the value at rest in the platform; it does not make compromised Worker code harmless. Key creation, rotation, emergency revocation, least privilege, and incident response need a tested plan.

Workload Identity Federation is preferable to long-lived keys where supported, but Awwab's earlier research found Google's setup guidance asks users to verify billing is enabled. Do not enable billing to test this. The service-account-key alternative is not automatically approved merely because it may fit a free tier.

### 2. IAM blast radius

Google OAuth access to Firestore bypasses Firestore Security Rules. The service identity's IAM permissions therefore become the primary database boundary for this server path, and Worker authorization code becomes security-critical. Before approval, prove the narrowest practical IAM scope for the existing database and demonstrate that the Worker cannot read or mutate unrelated user collections or privileged records through an unintended route. Do not assume collection-level least privilege is available just because a service account can be assigned a Firestore role.

If the narrowest practical IAM grant exposes too much of the existing database, reject this candidate rather than relying on code review alone. A separate database/project could reduce blast radius but would add migration and operational scope and is not authorized here.

### 3. Token verification and revocation

A Worker implementation would need a maintained JWT verification library or reviewed verification logic, cached Google public keys with correct cache expiry, strict Firebase project claims, clock-skew handling, and fail-closed behavior on key-fetch failures. Standard ID-token signature/claim verification does not by itself detect refresh-token revocation. Determine whether Awwab needs per-request revocation checking, a bounded revocation window, or a different session policy. Never silently downgrade verification if the identity service is unavailable.

### 4. Transactions and replay protection

The Ed25519 prototype is in-memory only. A live implementation must use durable challenge state and atomically consume a challenge with the actual privileged mutation and audit record. Replaying a request, racing two approvals, racing two revocations, or concurrently revoking the last trusted device must not violate invariants. Do not claim this property from the local mock tests.

### 5. Cost and quota truth

Cloudflare Free documents 100,000 requests/day and 10 ms CPU per invocation at the time of this review. This is not a perpetual free guarantee and does not eliminate quotas or charges in other Google services. Confirm whether the existing Firebase project and proposed service identity can perform the necessary operations without enabling billing. If any required step prompts for billing, a paid plan, or a chargeable service, stop and reject the path under the current requirement.

## Alternatives and current decision

| Option | Assessment under the strict $0 constraint |
|---|---|
| Firebase Cloud Functions on current Spark plan | Rejected for live deployment: Functions requires Blaze. |
| Worker forwarding Firebase ID token directly to Firestore | Rejected for privileged device writes: the current Rules intentionally deny those writes. |
| Worker + service identity + Firestore REST | **Research candidate only.** Not approved until IAM blast radius, credential lifecycle, token verification/revocation, transactions, quotas, and zero-cost operation are proven. |
| Move device data/auth to another provider | Higher migration and account/data-ownership risk; not authorized. |
| Keep current Spark architecture and defer live device management | **Safe current choice** while the candidate remains unproven. |

## Acceptance gate before any implementation

- [ ] Produce a written IAM permission map for every collection/document path touched by the API and unrelated paths that must remain inaccessible.
- [ ] Demonstrate that the chosen service identity is unable to perform unintended operations outside the intended scope.
- [ ] Define key creation, secret injection, rotation, revocation, and incident-response steps without exposing a secret to the browser or repository.
- [ ] Define and test ID-token validation, key caching, audience/issuer checks, expiry, clock skew, and the revocation/session policy.
- [ ] Specify Firestore transaction boundaries for challenge consumption, bootstrap, approval, revocation, last-trusted-device protection, and audit.
- [ ] Add adversarial tests for missing/invalid/expired/revoked identity, cross-user requests, action/target tampering, replay, concurrent transitions, and malformed inputs.
- [ ] Verify exact service availability, quotas, and all associated costs from official documentation; define hard stop behavior.
- [ ] Obtain explicit owner approval for a non-production proof of concept before creating accounts, resources, or secrets.

## Current status

No option has passed the acceptance gate. Keep the live project on Spark, retain restrictive Firestore Rules, keep UI failures truthful, and continue local synthetic testing. This document does not authorize deployment, resource creation, billing changes, or production modifications.

## Research update: IAM scope and credential blocker — 2026-10-28

### Finding: database scope is not collection scope

Google documents IAM Conditions that can restrict Firestore access to a named database for REST/API clients. This is useful as a boundary, but it does not establish a collection-level or document-level boundary inside that database. The current Awwab design stores device/profile records alongside other user/workspace data in the same Firestore database. A service identity with broad entity read/write permissions at that database could potentially reach far more than device records if Worker authorization code is compromised or a route is implemented incorrectly. Firestore Security Rules do not provide a second guardrail for OAuth/IAM-authorized server requests.

Sources:
- [Firestore Native mode: database-level IAM conditions](https://cloud.google.com/firestore/docs/manage-databases#configure_per-database_access_permissions)
- [Firestore IAM roles and permissions](https://cloud.google.com/iam/docs/roles-permissions/firestore)
- [Firestore REST API authentication](https://firebase.google.com/docs/firestore/use-rest-api)

**Decision for this candidate:** do not grant a Worker service identity broad access to the existing shared database merely to make device management work. A database-level condition would only be a partial containment measure. Before reconsidering, either prove an actually enforceable least-privilege design for the required data boundary, or evaluate a separate database/project with its own explicit migration and operational cost assessment. The latter is not authorized or implemented.

### Credential finding: a secret store is not a complete identity strategy

Cloudflare Worker secrets keep secret values out of ordinary source/configuration, but they do not remove the impact of compromised Worker code. Google explicitly recommends avoiding user-managed service-account keys where possible because the key can be used to act as that service account; leaked keys can enable privilege escalation and obscure which actor performed an operation. [Google service-account key best practices](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)

Workload Identity Federation is the preferred general pattern for external workloads according to Google, but this research has not demonstrated a supported, configured, strictly $0 federation path for a Cloudflare Worker into this Firebase project. Do not create keys, configure federation, enable billing, or test credentials as part of this research.

### Updated assessment

The Worker + service identity approach remains **not approved** and is less promising for the existing shared database than a generic “free Worker” comparison suggests. No verified collection-level IAM boundary, acceptable credential lifecycle, or no-billing identity path has been demonstrated. The safe current choice remains to keep live device management deferred, preserve restrictive Firestore Rules, and continue synthetic local tests only.

## Alternative candidate: isolated Supabase device service — 2026-10-28

This research found a potentially cleaner boundary than giving a Worker Google IAM access to Awwab's shared Firestore database: use a separate Supabase Free project solely for device-trust records and its Edge Function as the trusted API. This is a candidate for a **local/non-production proof of concept only**, not an approved migration or deployment.

Official documentation confirms:
- Supabase supports Firebase Auth as a third-party identity provider. [Firebase Auth integration](https://supabase.com/docs/guides/auth/third-party/firebase-auth)
- Supabase Free currently lists 500,000 Edge Function invocations/month, a 500 MB database, and 50,000 monthly active users / third-party MAUs; the Free project can pause after a week of low activity. [Billing and usage limits](https://supabase.com/docs/guides/platform/billing-on-supabase) · [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- Supabase warns that Firebase ID tokens do not normally contain the `role: authenticated` claim required for its Data API. Its documentation describes adding that claim via Firebase Admin / an Auth blocking function; the latter requires Firebase Authentication with Identity Platform. [Firebase Auth integration requirements](https://supabase.com/docs/guides/auth/third-party/firebase-auth)

### Candidate architecture

1. Keep current Firebase Authentication as the account identity provider. Do not migrate user accounts.
2. Put only device lifecycle data in a dedicated Supabase Postgres project/schema, separate from Firestore's other user/workspace data.
3. Expose narrowly scoped Edge Function endpoints for enrollment, challenge issuance/verification, listing, approval, revocation, and audit. The browser never receives a service-role secret.
4. Since existing Firebase tokens may lack the Supabase `role` claim, do **not** assume the standard Supabase gateway will authenticate them successfully by default. One possible design is to disable gateway JWT verification for that specific function and perform strict Firebase JWT signature/claim validation inside the function with a maintained verifier, checking signature/JWKS, issuer, audience/project, expiry, issued-at time, and UID. This must be independently reviewed and tested; any verification or key-fetch uncertainty fails closed. Alternatively, investigate a supported way to provide the required claim without requiring Blaze/Identity Platform before choosing the integration.
5. Derive the UID exclusively from the verified token. Bind device keys and one-time challenges to that UID. Keep privileged mutations server-side and use a single Postgres transaction for challenge consumption, state transition, last-trusted-device invariant, and audit record.
6. Add restrictive Row-Level Security to all exposed tables and schemas even if the Edge Function uses a server-only privileged key. The privileged key is a high-value secret; the database is isolated to device metadata to limit blast radius. Never add that key to browser code or Git.
7. Treat every free quota as a hard stop. No plan upgrade, add-on, overage acceptance, or billing fallback. Confirm the actual account's free-tier eligibility and usage behavior before any resource creation.

### Advantages and unresolved issues

**Potential advantage:** unlike the proposed Worker with a Google service identity, this isolates the device-management database from Awwab's existing Firestore records, so a compromised backend credential would not automatically grant access to the whole Firestore database. Supabase also documents Firebase third-party authentication support.

**Unresolved blockers:**
- This adds a new vendor, project, secret, deployment pipeline, monitoring surface, and operational dependency.
- Supabase's gateway claim requirements mean a normal Firebase ID token cannot simply be assumed to work for every API path. Manually validating the token inside an Edge Function is security-critical and needs independent review, negative tests, and a maintained verification library.
- The service-role key bypasses RLS. Its use must be confined to the server function and isolated database; function authorization and SQL transaction design must be audited.
- The documented free quota is not an uptime guarantee. A project may pause after inactivity, and quotas/pricing can change. Confirm that no payment method, paid-plan prompt, or chargeable third-party MAU overage can trigger charges; if this cannot be guaranteed, reject the option.
- Device data would be split between Firestore and Postgres only for this feature. Data ownership, export/deletion, backup/recovery, and provider-outage behavior need explicit design.
- No Supabase project, database, secret, or integration has been created. This remains documentation-based research, not evidence of working authentication or transactions.

### Updated research decision

The Supabase isolated-device-service option is now the **preferred candidate to evaluate next**, ahead of the Worker + Google IAM route, because it may provide a narrower database blast radius while retaining Firebase Auth. It is not yet proven to satisfy the strict $0 requirement or the security gates. Do not create a project or deploy a function without explicit approval. First build a local-only design/test harness and review the exact token verification, transaction, RLS, and cost/limit plan. If the gate cannot be met, continue deferring live device management.

## Phase 3 decision — 2026-10-28

The architecture comparison is consolidated in [PHASE_3_BACKEND_DECISION.md](PHASE_3_BACKEND_DECISION.md). The current decision is to defer live device management. An isolated Supabase Edge Function plus a dedicated device-only database is the preferred **research candidate** because it avoids granting a Worker broad IAM access to Awwab's existing shared Firestore database. It is not approved for provisioning or deployment: the Firebase `role: "authenticated"` claim dependency, custom token verification risk, Free-plan inactivity pause, transaction/security design, and actual $0 eligibility remain unresolved.

No account, resource, secret, billing setting, Firestore Rule, migration, or deployment was changed. All earlier acceptance-gate checkboxes remain requirements, not completed evidence.
