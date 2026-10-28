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
