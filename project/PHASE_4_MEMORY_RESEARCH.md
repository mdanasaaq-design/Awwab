# Phase 4 — Personal context and research safety prototype

**Status:** Prototype slice implemented on an isolated branch; full Phase 4 remains blocked.
**Branch:** `phase-4-memory-research-safety`
**Baseline:** `main` at `c74bab5b6cfc3ee56617af5d177988ff9b91ca11`
**Scope:** Dependency-free, in-memory policy model and regression tests only. No production app/backend wiring, persistent writes, external retrieval, credentials, billing, or deployment.

## Acceptance criteria for this slice

- [x] Memory records require bounded content, explicit type, provenance, confidence, sensitivity, visibility, and expiry fields.
- [x] Sensitive memory requires explicit user-originated provenance and confirmation.
- [x] Model-derived inference confidence is capped and cannot be sensitive.
- [x] Retrieval is user-scoped, expiry-aware, visibility-aware, type-filterable, and budget-bounded.
- [x] Automatic retrieval excludes sensitive memory unless an explicit caller opts in; production policy must still independently authorize this.
- [x] Correction changes provenance to a user correction; deletion checks owner scope.
- [x] Retrieved memory and research source content are explicitly marked untrusted and cannot authorize actions.
- [x] Research claims map to known source IDs; claims without sources are marked uncertain, and source-linked claims are not claimed as verified.
- [x] Regression cases cover cross-user access attempts, memory poisoning / indirect prompt injection content, unsupported claims, expiry, budgets, malformed inputs, and sensitive-memory promotion.
- [ ] Node.js 22 test run observed in CI.
- [ ] Independent review of the policy model and threat cases.

## Why Phase 4 is not complete

This prototype is not durable memory or a research workflow. Phase 3 Assistant Core v0 is not connected, and the free-plan backend decision remains unresolved. The existing Firebase Functions deployment is blocked by the project's current plan; no backend migration or cloud resource creation is approved. The acceptance gates for real user-scoped persistence, inspect/correct/delete UI, permission-scoped retrieval, real source extraction/ranking/citations, and end-to-end privacy/security benchmarks therefore cannot be honestly marked complete yet.

## Run locally

From the repository root on Node.js 22:

```sh
node --test project/prototypes/memory-research-policy-mock.test.mjs
```

## Safety limits

- This is a pure in-memory model. It proves neither Firestore/SQL transaction semantics nor real authorization.
- The caller-supplied owner ID is not a trusted identity source; production code must derive identity from verified server authentication.
- The model does not fetch sources, verify URLs, extract web/document content, evaluate factual entailment, or provide real citations.
- The `includeSensitive` switch is a test seam, not an authorization system.
- No production code imports this module. Never present its results as live Awwab memory or research.
- No deployment or billing changes were performed.
