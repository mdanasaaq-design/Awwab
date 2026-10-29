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
- [x] Added unit tests for provider-neutral runtime validation, explicit memory opt-in, untrusted-memory labeling, cancellation, sanitized failures, malformed provider output, and the no-side-effect plan-only result.
- [x] Added bounded, provenance-aware policy prototype and prompt-injection / evidence-mapping regression tests from the first Phase 4 slice.

### Live source lookup
- [x] Added a Research workspace that calls Wikipedia's public API directly from the browser (no key or paid service).
- [x] Added Crossref academic-publication search with title, author/year/journal metadata, abstract when available, and DOI/source links.
- [x] Searches up to five results and retrieves introductory plain-text extracts with links to the original pages.
- [x] Displays source status as “not verified” and explains that retrieved page content is untrusted.
- [x] Links each extract to a source page so users can inspect and cite the origin.

## Remaining Phase 4 gates

- [x] Added a provider-neutral, plan-only Assistant Core runtime boundary with typed requests/responses/errors, bounded input/output validation, cancellation, explicit opt-in memory loading, and hard-coded no-tools/no-side-effects safety flags. A deterministic mock provider and automated contract tests run without network calls or model charges.
- [ ] Configure a real model adapter/provider and connect an authenticated server callable to the runtime. The assistant composer remains disabled; the mock is test-only, and this branch does not claim to generate real replies or automatically invoke memory during conversations.
- [ ] Expand research beyond Wikipedia and Crossref to general web/document sources, durable research sessions, deduplication/ranking across providers, and source-linked claim synthesis. Current results remain provider-ranked extracts/metadata; Awwab does not independently verify claims or generate a synthesis.
- [ ] Complete end-to-end privacy/security testing in a running app and perform an independent review.
- [ ] Re-run CI against the final Phase 4 implementation commits and inspect every job result before considering the branch ready for review.

## Architecture and safety boundaries

- Firestore memory is scoped by the Firebase Authentication UID encoded in the document path; the client cannot write another user's path under the rules.
- This UI saves only records explicitly entered by the user. It does not silently promote assistant guesses into memory.
- Sensitive memory is only stored after an explicit UI confirmation; it should not be automatically retrieved into prompts.
- Retrieved memory and research content must always be treated as untrusted data. Text from a memory or source cannot authorize tools, permissions, or side effects.
- Live research supports Wikipedia and Crossref academic metadata/abstracts. It is still not a general-purpose web search engine and does not independently validate source claims.
- The memory workspace and trusted-device-gated retrieval callable are implemented, and the signed-in UI has an explicit context-preview action. The new runtime accepts a memory-context loader only when a request explicitly opts in, but no production callable currently wires the runtime to that loader or a real provider. Do not describe the overall assistant as fully memory-enabled until a real conversation runtime is configured, wired, and tested.
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


## Assistant Core server connection (2026-10-29)

- Added authenticated `runAssistant` callable; it requires a signed-in user and a trusted device.
- Added a configurable OpenAI-compatible chat-completions adapter. Configure Firebase secret `AWWAB_MODEL_API_KEY` and server environment values `AWWAB_MODEL_BASE_URL` and `AWWAB_MODEL_NAME`. No endpoint or model is silently selected.
- The web composer sends requests to the callable and displays returned plans. Memory is opt-in per request; only the server-side trusted memory filter is used, and memory is labeled untrusted.
- Plans are never executed: the runtime has no tool executor and returns `executed: false`.
- No provider credentials are included in source. Until configuration is supplied, requests fail closed with a provider-not-configured message.
- Deployment remains separate and has not been performed.


## Free-start cost and request safeguards (2026-10-29)

- Provider requests have a 30-second timeout and a hard maximum of 1,024 generated tokens per response.
- The authenticated server callable enforces per-user limits of 3 requests per minute and 20 requests per UTC day before calling the configured model provider.
- Requests fail closed when provider configuration is missing; no automatic paid fallback or provider switching is performed.
- These controls cap request frequency and output length, but they do not guarantee zero charges if an administrator later configures a billable provider/account. Keep billing disabled unless explicitly approved and verify provider-specific free-tier settings before adding credentials.
- Provider comparison: Groq is the recommended first trial to investigate because its documented Free Plan says over-limit requests are rate-limited rather than billed; Google Gemini also offers free-tier models, but its free-tier data-use terms deserve careful review before sending personal memories. Provider choice is not hard-coded into the runtime.
