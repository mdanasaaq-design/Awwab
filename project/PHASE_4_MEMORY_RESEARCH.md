# Phase 4 — Personal memory and source research

**Status:** Memory storage, bounded server-side memory retrieval contract, and two-source research lookup are implemented on `phase-4-memory-research-safety`. Full Phase 4 remains gated on wiring the retrieval contract into an Assistant Core runtime, which does not yet exist in this branch.
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
- [x] Added authenticated `getAssistantMemoryContext` callable requiring an explicit `conversation_context` scope and a trusted device.
- [x] Added a signed-in UI action to explicitly preview the backend-filtered context; retrieval is never automatic, and the assistant composer remains disabled.
- [x] Retrieval is owner-scoped from server-verified Firebase Auth identity, excludes sensitive/hidden/unconfirmed/expired/unsupported records, strips control characters, and caps output at 50 records / 6,000 characters.
- [x] Added callable emulator regression tests for authentication, trusted-device checks, explicit scope, expiry filtering, sensitive exclusion, hidden records, and user confirmation.
- [x] Added bounded, provenance-aware policy prototype and prompt-injection / evidence-mapping regression tests from the first Phase 4 slice.

### Live source lookup
- [x] Added a Research workspace that calls Wikipedia's public API directly from the browser (no key or paid service).
- [x] Added Crossref academic-publication search with title, author/year/journal metadata, abstract when available, and DOI/source links.
- [x] Searches up to five results and retrieves introductory plain-text extracts with links to the original pages.
- [x] Displays source status as “not verified” and explains that retrieved page content is untrusted.
- [x] Links each extract to a source page so users can inspect and cite the origin.

## Remaining Phase 4 gates

- [ ] Build and connect an actual Assistant Core conversation runtime. The UI can explicitly preview the trusted-device-gated memory context, but the current assistant composer remains a non-functional placeholder: no model adapter/provider is configured, and no conversation invokes memory or generates replies.
- [ ] Expand research beyond Wikipedia and Crossref to general web/document sources, durable research sessions, deduplication/ranking across providers, and source-linked claim synthesis. Current results remain provider-ranked extracts/metadata; Awwab does not independently verify claims or generate a synthesis.
- [ ] Complete end-to-end privacy/security testing in a running app and perform an independent review.
- [ ] Re-run CI against the final Phase 4 implementation commits and inspect every job result before considering the branch ready for review.

## Architecture and safety boundaries

- Firestore memory is scoped by the Firebase Authentication UID encoded in the document path; the client cannot write another user's path under the rules.
- This UI saves only records explicitly entered by the user. It does not silently promote assistant guesses into memory.
- Sensitive memory is only stored after an explicit UI confirmation; it should not be automatically retrieved into prompts.
- Retrieved memory and research content must always be treated as untrusted data. Text from a memory or source cannot authorize tools, permissions, or side effects.
- Live research supports Wikipedia and Crossref academic metadata/abstracts. It is still not a general-purpose web search engine and does not independently validate source claims.
- The memory workspace and trusted-device-gated retrieval callable are implemented, and the signed-in UI has an explicit context-preview action. The assistant runtime still does not call that endpoint or generate replies. Do not describe the overall assistant as fully memory-enabled until a real conversation runtime is configured, wired, and tested.
- No deployment, billing change, credential creation, or paid infrastructure was performed.

## Local verification

Use Node.js 22 from the repository root:

```sh
npm install
npm run web:typecheck
npm run web:build
npm run firebase:rules:test
node --test project/prototypes/memory-research-policy-mock.test.mjs
npm run firebase:callable:test
```

The Firestore rules suite requires the configured local Firestore emulator. The repository's CI workflow runs the automated typecheck/build, rules, callable, and prototype checks.
