# Phase 1 — Firebase token verifier research and security review

**Review date:** 2026-10-28  
**Scope:** Read-only source review of `project/prototypes/firebase-token-verifier-mock.mjs`, its tests, and the documented backend constraints. Compared with official Firebase and Supabase documentation.  
**Status:** Phase 1 research/review complete. Phase 2 hardening is not complete.  
**Safety boundary:** Synthetic local prototype only. No live tokens, credentials, network integration, cloud resources, billing changes, Firestore Rules changes, or deployment.

## Executive result

The local harness is a useful test model and its current eight tests passed in the owner's Windows environment. It is **not a production Firebase token verifier** and must not be wired into Awwab or a Supabase Edge Function as-is.

The prototype checks an explicitly supplied key set, RS256, key ID, RSA key type/size, signature, project issuer/audience, subject bounds, and selected time claims. It deliberately does not fetch Google's public keys, implement HTTP cache/key rotation, check token revocation, or prove compatibility with the Supabase Edge Runtime. Passing its synthetic tests establishes only the behavior covered by those tests.

## Findings

### F1 — High: `auth_time` is not validated

Firebase's third-party verification guidance lists `auth_time` and requires it to be in the past. The current model checks `exp` and `iat`, but does not require or validate `auth_time`.

**Required before any production design:** Decide and implement the exact Firebase claim policy using an established, reviewed JWT implementation where feasible. Require a safe-integer `auth_time` and reject values beyond the allowed clock-skew boundary. Add missing, malformed, future, and valid boundary tests. Do not treat the local mock as an authority for Firebase's full token contract.

### F2 — High: signing keys are injected, not retrieved or rotated

The verifier accepts `keys` from its caller. It does not retrieve Google's official signing certificates, honor their `Cache-Control: max-age`, refresh keys, or define safe behavior when the key endpoint is unavailable or a new `kid` appears.

**Required before any production design:** Use the official Firebase certificate endpoint and a maintained JWT library where compatible; honor cache headers; define bounded refresh behavior for unknown `kid`; fail closed when a valid key cannot be established. Never accept a token merely because a key fetch failed. Test key rotation and stale-cache cases against a controlled fixture, not live credentials.

### F3 — High: token revocation/session policy is out of scope

Signature and standard-claim validation do not by themselves establish that a user's refresh tokens/session have not been revoked. The current prototype does not check revocation.

**Required decision:** Define whether the service accepts a valid, unexpired ID token until expiry, needs an additional revocation/session check, or uses another bounded session policy. Document the latency and availability implications. Do not imply revocation protection that is not implemented.

### F4 — Medium: time and parser hardening is incomplete

The model has a fixed token-size cap and validates selected numeric time claims, but it does not validate the caller-supplied `now` and `clockSkewSeconds` configuration as safe, bounded values. Node's base64url decoding is permissive; the model does not enforce a strict canonical encoding policy before parsing/signature verification. The model also does not explicitly validate the token's `typ` header, and malformed key-set entries may result in generic runtime exceptions instead of stable verifier errors.

**Required hardening:** Validate configuration types/ranges; add malformed-segment, invalid JSON/UTF-8, malformed signature encoding, duplicate/invalid key-record, and boundary-time tests; keep errors generic at the network boundary. Only adopt strict parser rules after confirming compatibility with real Firebase tokens. Do not log full tokens or sensitive claims.

### F5 — Medium: the test suite is a narrow synthetic suite

The eight tests cover useful baseline behavior, but not all requirements above. The current tests do not prove real certificate retrieval, HTTP cache behavior, key rotation, revocation policy, runtime compatibility, or abuse/rate limits.

**Required before a live candidate:** Expand regression coverage for the findings above and run tests on the intended runtime. Separately test the actual JWT library and deployment/runtime constraints without using real user tokens or exposing credentials.

### F6 — High: Supabase's standard Firebase integration has an unresolved role-claim dependency

Supabase's official Firebase integration guide says Firebase JWTs need `role: "authenticated"` for normal Data API authorization; default Firebase ID tokens do not include that claim. Its documented options use Firebase Authentication with Identity Platform blocking functions or an `onCreate` Cloud Function/Admin SDK workflow. Awwab's current strict $0 constraint excludes assuming those paths are available, because the existing Firebase Cloud Functions route requires a plan change and no such change is authorized.

**Decision:** The standard integration is not proven compatible with the current constraints. A manually verified Edge Function with platform JWT verification disabled is a separate security-sensitive design, not a shortcut: every request must be authenticated in the function, and privileged database credentials bypass RLS. Do not create a Supabase project or deploy either design until the role, authorization, isolation, transaction, and cost gates are independently satisfied.

## Current prototype assessment

| Area | Assessment |
|---|---|
| Synthetic RS256 signing and signature verification | Covered by current tests |
| Project issuer and audience checks | Covered by current tests |
| Subject bounds and UID derived from signed `sub` | Covered by current tests |
| Expiry, future-issued, `nbf`, clock-skew boundaries | Partially covered by current tests |
| Firebase `auth_time` policy | Missing |
| Real Google certificate retrieval/cache/key rotation | Not implemented |
| Revocation/session policy | Not implemented |
| Supabase Edge Runtime integration | Not tested |
| Live Firebase/Supabase behavior | Not tested |
| Production readiness | **No-go** |

## Phase 1 exit decision

**Research/review phase: complete. Production-verifier acceptance: not passed.**

Proceed to Phase 2 as a bounded local-only hardening batch:
1. Add explicit configuration validation and tests for `auth_time` and time boundaries.
2. Add parser/key-set negative tests and stable fail-closed behavior.
3. Update the prototype's README to state the exact limitations.
4. Re-run the local test suite when execution is available; keep owner-run results clearly distinguished from code review.
5. Separately assess whether a maintained JWT library is compatible with the target Edge Runtime before implementing network key retrieval.

Do not start production integration as part of Phase 2. Keep the strict $0 gate, existing restrictive Firestore Rules, and no-deployment boundary.

## Official sources reviewed

- Firebase, [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens): third-party JWT requirements, Firebase signing certificate endpoint, cache-header guidance, and the distinction between token verification and revocation checking.
- Supabase, [Firebase Auth integration](https://supabase.com/docs/guides/auth/third-party/firebase-auth): third-party setup and the `role: "authenticated"` claim requirement.
- Supabase, [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth): default platform JWT validation, manual authentication responsibility when disabled, and privileged access implications.
- Supabase, [Authorization headers](https://supabase.com/docs/guides/functions/auth-headers): platform gateway JWT behavior and header semantics.

This is a bounded source review, not an independent penetration test, a live-provider validation, or a security certification.

## Phase 2 — synthetic verifier hardening follow-up

**Implementation status:** Changes and regression cases committed to `main`. **Execution status:** The expanded suite has not yet been run after these changes in an independent runtime. Do not mark test acceptance complete until it passes.

Changes:
- Require `auth_time` as a non-negative safe integer and reject future authentication time or an authentication time later than issue time beyond configured skew.
- Validate project ID shape, `now`, bounded integer clock skew (0–300 seconds), and a non-empty key set with unique, syntactically valid key IDs and public-key material.
- Bound clock arithmetic to safe-integer ranges.
- Require JWT `typ` to be `JWT`; strictly decode canonical unpadded base64url and UTF-8 JSON; require JSON object values; validate signature-segment encoding.
- Add synthetic regression tests for missing/malformed/future `auth_time`, invalid clock/skew configuration, malformed segment encodings/UTF-8, wrong token type, duplicate/malformed keys, and empty key sets.

**Known limitations remain:** duplicate JSON member names are not explicitly detected; the verifier does not fetch/cache/rotate Google's certificates, perform revocation checks, or use a production JWT library. This work does not validate live Firebase tokens or Supabase Edge Runtime behavior. No network, cloud resources, secrets, billing changes, Rules changes, or deployment were involved.

### Phase 2 local acceptance command

From the repository root, run:

```powershell
node --test project/prototypes/firebase-token-verifier-mock.test.mjs
```

Record the exact output. A passing local model suite is necessary but not sufficient for production approval.
