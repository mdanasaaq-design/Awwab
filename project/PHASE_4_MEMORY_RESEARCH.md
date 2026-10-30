# Phase 4 — Personal memory and source research

**Status:** Memory storage, bounded server-side memory retrieval, and two-source research lookup are implemented on `phase-4-memory-research-safety`. The Assistant Core request boundary exists, but generation is intentionally disabled until Awwab's own model is trained from scratch. The independent-AI owner decision supersedes all earlier third-party provider plans.
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
- [x] Disconnect the external AI provider from the active callable; add an Awwab-owned model interface whose default status is `not_trained`; fail closed with no remote fallback; disable the generation composer in the UI; and add deterministic no-network tests.
- [ ] Implement and train Awwab's own model from random initialization, then validate local inference and model quality. Until that work is complete, Awwab does not generate model-based assistant replies.
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


## Independent model boundary (2026-10-29)

- The owner decision in [AWWAB_INDEPENDENT_AI_DECISION.md](https://github.com/mdanasaaq-design/Awwab/blob/phase-4-memory-research-safety/project/AWWAB_INDEPENDENT_AI_DECISION.md) is authoritative.
- Removed the OpenAI-compatible external AI adapter and its tests. The active callable does not bind an AI API secret or call an external AI provider.
- Awwab's own model interface reports `not_trained` and fails closed. The web UI does not submit assistant generation requests and explains why generation is unavailable.
- The older provider adapter/runtime tests remain legacy contract tests only; they do not represent the active application path. Do not configure or enable that adapter.
- No model training, model/data download, secret configuration, deployment, billing change, or paid infrastructure was performed.

## Cost and privacy boundary

- No AI provider is configured or invoked by the active Assistant Core path.
- The active model boundary makes no network request and has no remote fallback.
- Firebase Authentication, device state, and saved memories remain existing cloud dependencies; this work does not make the app fully offline.
- No deployment, billing change, credential creation, model/data download, or paid infrastructure was performed.


## Model Lab implementation (2026-10-29)

Awwab's first independent model workbench is now in `model-lab/`: versioned byte-level tokenizer, JSONL data provenance checks, randomly initialized causal decoder-only Transformer, reproducible small-corpus training script, atomic versioned local checkpoints, local autoregressive inference, and next-token loss/perplexity evaluation. It contains no pretrained weights or external AI provider. A small synthetic fixture can be generated locally; no fixture corpus, checkpoint, or model weights are committed.

The CI workflow checks Python syntax and standard-library tokenizer/data tests without installing PyTorch, downloading datasets, or running training. PyTorch-backed training, checkpoint round-trip, generation, and actual quality evaluation remain unverified until an explicit local dependency setup and smoke test. The production assistant remains disabled and does not load these checkpoints. Do not claim Awwab has a trained assistant until an actual checkpoint has been trained from random initialization, evaluated, and later integrated under a separate phase.


## Open-source reuse direction — 2026-10-30

The owner has clarified that Awwab should incorporate selected public source code rather than only study external projects. This is compatible with the independent-model decision: reuse deterministic engineering, not third-party learned weights or external AI APIs.

Potential Phase 4 improvements:
- Mozilla Readability parser for article extraction, with source provenance and no network inside the parser.
- Mem0-derived memory merge/deduplication/conflict algorithms, adapted to Awwab's explicit-confirmation and Firestore ownership model.
- Graphiti temporal fact/provenance patterns only if current memory schema needs evolving facts.
- Promptfoo-inspired local regression/adversarial tests, without remote model-provider calls.

No code was copied in this documentation pass. The full source/licence matrix and R1–R7 plan are in [OPEN_SOURCE_REUSE_CATALOG.md](../docs/OPEN_SOURCE_REUSE_CATALOG.md). Existing memory controls and current Wikipedia/Crossref behavior must remain intact during integration.


## Reuse programme update — R1 parser foundation (2026-10-30)

Mozilla Readability has now been vendored from a pinned upstream commit under Apache-2.0, with the licence retained and attribution recorded in `THIRD_PARTY_NOTICES.md`. Awwab has a pure parser wrapper with bounded HTML/text sizes and HTTP(S) source attribution. The current ResearchPanel has not yet been wired to it. Safe fetching, CORS behavior, redirect/private-network protections, parser fixture validation and end-to-end UI testing remain required before claiming article extraction is available.


### Research parser integration update — 2026-10-30

The existing Wikipedia path now fetches HTML only from the fixed CORS-enabled Wikipedia parse API endpoint and cleans it locally with the vendored Mozilla Readability parser. The UI receives plain text, and it falls back to the original provider search excerpt when extraction fails or is too short. Crossref is unchanged. This is not arbitrary URL crawling. CI has passed parser adapter/provenance tests and web build/typecheck for the implementation commit; manual browser validation and the remaining CI jobs are still required.
