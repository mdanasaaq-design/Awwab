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
