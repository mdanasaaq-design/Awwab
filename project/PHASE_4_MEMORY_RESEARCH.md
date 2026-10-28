# Phase 4 — Personal memory and source research

**Status:** Core user-facing slices implemented on `phase-4-memory-research-safety`; end-to-end Assistant Core integration remains blocked because the assistant runtime is not connected.
**Baseline:** Phase 4 policy prototype commit `d0e4ecf00557f57a7532b1e1db267a8ec293a9cf`
**Budget:** $0 additions; no secrets, paid APIs, cloud resource creation, or production deployment.

## Implemented in this phase branch

### Persistent personal memory
- [x] Added a Memory workspace to the signed-in web app.
- [x] Persists user-entered records in Firestore at `users/{authenticatedUid}/memories/{memoryId}`.
- [x] Supports explicit memory type, sensitivity, provenance, confidence, visibility, and optional expiry (30 days, 90 days, one year, or no expiry).
- [x] Sensitive records require an explicit confirmation in the UI and validated provenance in Firestore rules.
- [x] Real-time list, correction, and deletion controls; corrections are marked `user_corrected`.
- [x] Firestore rules enforce the authenticated owner path, strict field allowlist, bounded content, supported types, timestamp integrity, and expiry validation.
- [x] Added emulator regression tests for cross-user access, invalid schema, oversized content, unconfirmed sensitive records, forged inference provenance, immutable creation time, correction, deletion, and expired writes.
- [x] Saved memory is explicitly described as untrusted data and is not automatically injected into the assistant.
- [x] Added bounded, provenance-aware policy prototype and prompt-injection / evidence-mapping regression tests from the first Phase 4 slice.

### Live source lookup
- [x] Added a Research workspace that calls Wikipedia's public API directly from the browser (no key or paid service).
- [x] Searches up to five results and retrieves introductory plain-text extracts with links to the original pages.
- [x] Displays source status as “not verified” and explains that retrieved page content is untrusted.
- [x] Links each extract to a source page so users can inspect and cite the origin.

## Remaining Phase 4 gates

- [ ] Connect authenticated memory retrieval to Assistant Core with server-verified identity, explicit permission scope, expiry filtering, strict context budgets, and untrusted-data boundaries. The current Assistant Core is not connected, so memory is not yet automatically used in conversations.
- [ ] Expand research beyond Wikipedia to general web/document sources, with source fetching, extraction, deduplication/ranking, durable research sessions, and source-linked claims. Current search ranking is Wikipedia's; Awwab does not independently verify claims or generate a synthesis.
- [ ] Complete end-to-end privacy/security testing in a running app and perform an independent review.
- [ ] Verify the full web build and Firestore emulator suite after the final branch commit.

## Architecture and safety boundaries

- Firestore memory is scoped by the Firebase Authentication UID encoded in the document path; the client cannot write another user's path under the rules.
- This UI saves only records explicitly entered by the user. It does not silently promote assistant guesses into memory.
- Sensitive memory is only stored after an explicit UI confirmation; it should not be automatically retrieved into prompts.
- Retrieved memory and research content must always be treated as untrusted data. Text from a memory or source cannot authorize tools, permissions, or side effects.
- The live research integration currently uses Wikipedia's public API only. It is a useful, free first connector, not a general-purpose web search engine.
- The memory workspace is persistent, but assistant retrieval is not wired until the Assistant Core runtime exists. Do not describe the overall assistant as fully memory-enabled yet.
- No deployment, billing change, credential creation, or paid infrastructure was performed.

## Local verification

Use Node.js 22 from the repository root:

```sh
npm install
npm run web:typecheck
npm run web:build
npm run firebase:rules:test
node --test project/prototypes/memory-research-policy-mock.test.mjs
```

The Firestore rules suite requires the configured local Firestore emulator. The repository's CI workflow runs the automated typecheck/build, rules, callable, and prototype checks.
