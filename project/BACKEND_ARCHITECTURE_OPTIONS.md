# Backend architecture options — no-Blaze decision gate

**Status:** Research snapshot, 2026-10-28. No option selected. This document authorizes no account creation, resource provisioning, migration, secret creation, deployment, or production change.

## Current constraints and invariant

Awwab currently uses Firebase Authentication, Firestore in `asia-south1`, and seven callable Functions in repository source. Those callables are not deployed because the Firebase project is on the Spark plan. Firebase's official documentation states that Cloud Functions for Firebase requires Blaze; the existence of a no-cost invocation allowance does not remove the billing-plan requirement. See [Firebase Cloud Functions FAQ](https://firebase.google.com/docs/functions/faq-and-troubleshooting?authuser=19&hl=en) and [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans?rd=1&visit_id=639223599763414237-3876483969).

The architecture must preserve all of these properties:
- Verify identity server-side and derive the user ID from verified token claims; never trust a client-supplied UID.
- Keep profile/device records server-owned; do not loosen Firestore Rules to make the UI appear functional.
- Preserve atomic first-device bootstrap, trusted-caller authorization, user scoping, audit events, fail-closed errors, and protection against revoking the last trusted device.
- Keep deployment and recurring/overage billing risk explicit. No paid-plan upgrade without owner approval.

## Options compared

| Option | Cost and operational fit | Security and migration implications | Assessment |
|---|---|---|---|
| **A. Stay on Firebase Spark; defer live device-management backend** | No new provider or resource. Hosting/Auth and existing project remain as-is; device callables stay unavailable in production. | Safest immediate option and no migration risk, but device trust and profile initialization cannot be proven end-to-end against deployed callables. Keep UI errors truthful and avoid fake success. | **Safe interim fallback**, not a functional completion path. |
| **B. Cloudflare Worker API + existing Firebase Auth and Firestore** | Workers Free currently documents 100,000 requests/day and 10 ms CPU per request; limits and terms can change. See [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) and [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/). | Worker must validate Firebase ID tokens correctly, derive UID from claims, handle key rotation/expiry and decide how token revocation is checked. Firestore access requires a deliberately designed secure authorization path; privileged Google credentials must not be placed in the browser or committed. Server-side transaction semantics and audit behavior need parity tests. Adds a second provider and secret/monitoring surface, but avoids migrating the existing Auth and database. | **Plausible candidate, not yet approved.** Feasibility, credentials, revocation, Firestore REST/OAuth, quotas, and operational costs need a concrete prototype and review before selection. |
| **C. Supabase Edge Functions + Supabase Postgres/Auth** | Supabase Free currently lists 500,000 Edge Function invocations/month, 500 MB database per project, and 50,000 monthly active users; free projects may pause after a week of inactivity. See [Supabase pricing](https://supabase.com/pricing/) and [Edge Function limits](https://supabase.com/docs/guides/functions/limits). | Supabase supports a documented Firebase Auth integration path, but database access, policy design, audit storage, and transactional device rules must be redesigned for Postgres/RLS. Retaining Firebase Auth while replacing Firestore introduces two-provider dependencies; moving Auth as well increases migration and account-linking risk. Quotas are not an assurance of perpetual free production operation. | **Possible, but higher migration scope** than option B. Only evaluate further if the owner is willing to change data architecture. |

## Recommendation for the next decision

1. **Do not change the live architecture yet.** Keep option A as the current safe state.
2. If the owner still requires live device management without Blaze, build a non-production proof of concept for option B only after approval. First demonstrate Firebase ID-token verification, safe Firestore authorization, and transactional last-trusted-device protection; do not start with a deployment to the existing project.
3. Compare the prototype's full security and cost profile against option C before choosing. Do not infer “free forever” from published quotas.
4. Keep the callable API contract stable: `health`, `registerDevice`, `bootstrapFirstDevice`, `listDevices`, `approveDevice`, `revokeDevice`, and `ensureUserProfile`.
5. Before any live change, require explicit approval for provider/account choice, secret handling, deployment target, data ownership, rollback, and expected cost.

## Evidence limits

This is a desk-research comparison based on current public vendor documentation. It is not a security audit, a live quota check, a pricing guarantee, or evidence that any alternate backend has been implemented or tested. No vendor account was connected and no resource was created.
## Free-only feasibility result — 2026-10-28

**Owner constraint:** Awwab must incur **$0 in recurring and usage-based charges**. Do not link a billing account, upgrade Firebase to Blaze, create paid resources, or accept a design that weakens security. Published free quotas are limits, not a guarantee that a feature can run indefinitely at any traffic level.

### Findings from official documentation

- Firebase Spark does not require payment information for no-cost products and quotas. Firebase Cloud Functions access requires Blaze, so the existing callable Functions cannot be the live device-management solution while Spark is a hard constraint. [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
- Firestore REST calls made with a Firebase Auth ID token are authorized by Firestore Security Rules. Awwab's current rules deliberately deny client writes to profile and device records. A Worker forwarding the user's Firebase ID token therefore cannot safely perform the privileged device lifecycle under the current rules. [Firestore REST authentication](https://firebase.google.com/docs/firestore/use-rest-api)
- Google OAuth/service-account credentials instead use IAM and bypass Firestore Security Rules. That can support trusted server-side writes, but it requires a separately secured Google Cloud workload identity with narrow IAM permissions. Do not place credentials in browser code or commit them.
- Google documents Workload Identity Federation as an alternative to long-lived service-account keys, but its setup guide explicitly says to verify that billing is enabled in the Google Cloud project before configuring it. That fails our strict no-billing gate unless independently verified otherwise; we must not enable billing to test it. [WIF setup requirements](https://cloud.google.com/iam/docs/workload-identity-federation-with-other-providers)
- Cloudflare Workers Free has a documented allowance of 100,000 requests/day and 10 ms CPU time per invocation. Requests exceeding free limits can fail; do not configure an upgrade or payment fallback. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

### Decision

**No secure, live, $0-cost path for the current privileged Firestore device-management API has been demonstrated. Do not deploy a Cloudflare Worker or change Firestore Rules.** The Worker idea remains blocked pending a verifiable no-billing identity path with server-side Firestore permissions. A long-lived service-account key is not accepted as a shortcut in this phase.

The safe free-only path is to:
1. Keep Firebase Spark, Hosting, Auth, Firestore, and existing restrictive Rules as they are.
2. Keep device-management errors truthful; do not show success without a real trusted backend.
3. Continue local-only/mock development and tests for the device lifecycle, Assistant Core planning, UI, and contracts without calling live Google APIs or storing real user data.
4. Treat all free-tier limits as hard stop conditions. No automatic upgrade, billing activation, paid fallback, or surprise-cost service.
5. Revisit live device management only if a genuinely free and secure authorization design is verified. If none exists, defer the feature rather than weakening rules or incurring charges.

### Prototype scope and acceptance criteria

The permitted next prototype is **local/mock only**. It must use synthetic users/devices and an in-memory or emulator-backed test store; it must not require Firebase/Cloudflare credentials or network access to a live project.

- Validate opaque device IDs and platform values.
- Model `pending`, `trusted`, and `revoked` states.
- Allow first-device bootstrap only when no device exists, and test concurrent attempts.
- Require a trusted caller for listing, approving, and revoking devices.
- Reject self-approval and revoked-device self-reactivation.
- Ensure the last trusted device cannot be revoked, including competing requests.
- Record synthetic audit events for successful state transitions.
- Test unauthorized, malformed, duplicate, race, and failure cases.
- Clearly label the mock as **not connected to production**; it must never be wired into the live UI as a fake success path.

No account, cloud resource, secret, billing setting, production code, Firestore Rules, or deployment was changed by this research update.

## Follow-up feasibility refinement — 2026-10-28

The previous “no secure live $0 path demonstrated” finding remains correct, but should not be read as proof that no possible path exists. A more concrete candidate is documented in [Free/Zero Firestore Backend Feasibility](FREE_ZERO_FIRESTORE_BACKEND_FEASIBILITY.md): a Cloudflare Worker, strict Firebase ID-token verification, and a server-only Google service identity calling Firestore REST.

This remains a **research candidate only**. Google OAuth access bypasses Firestore Security Rules and therefore makes IAM scope, Worker code, and credential lifecycle critical. No implementation is approved until IAM blast radius, key handling/rotation, token revocation policy, transactional challenge consumption and device invariants, quotas, and true zero-cost operation are demonstrated. Do not create a Worker, service identity, secret, or other cloud resource without explicit owner approval. The safe current state remains Spark plus restrictive Rules and deferred live device management.


## Open-source code reuse does not decide backend hosting (2026-10-30)

The owner has approved a reuse-first engineering strategy: selected source code can be copied/adapted into Awwab. This does not select a backend provider, create resources or change the existing Firebase billing decision. LangGraph/Playwright/Readability/Mem0-style modules can be developed and tested locally without provisioning a new cloud service. Any server-side runtime or hosting change still requires the separate architecture decision and explicit owner approval.
