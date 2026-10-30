# Awwab Agent Runtime and Open-Source Reuse Strategy

**Reviewed:** 2026-10-30  
**Decision:** Awwab owns the product, architecture, model, policies and runtime boundaries; selected open-source source code may be copied, adapted and maintained inside Awwab after exact-file licence/security review.  
**Detailed catalogue:** [Open-Source Reuse Catalogue and Integration Plan](OPEN_SOURCE_REUSE_CATALOG.md)

## Corrected owner direction

Awwab must not become a wrapper around another agent product, hosted agent, external AI API, or third-party pretrained model. However, that does **not** mean every line of engineering must be invented from scratch.

The owner explicitly wants us to reuse useful code from public repositories, adapt it, and incorporate the required pieces directly into Awwab so development is faster. Earlier statements in this document saying “reference only; do not copy” are superseded by this decision.

## What stays Awwab-owned

- Product identity, UI, user experience and roadmap.
- Request, conversation, workflow, job and tool contracts.
- Authentication, user/device ownership, authorization and approval policy.
- Memory consent, sensitivity, provenance, retention and deletion controls.
- Tool registry, budgets, risk policy, execution, verification and audit.
- Independent model architecture choices, random initialization, training data governance, model weights and evaluation thresholds.
- Integration boundaries, release decisions and user-facing claims.

## What may be reused

Selected source code and algorithms for:
- agent workflow/state machines, checkpointing and interrupt/resume;
- deterministic browser automation, DOM/accessibility snapshots and action verification;
- memory candidate merge/deduplication and temporal fact representation;
- article extraction and document parsing;
- training optimizations, batching, checkpoint resume and evaluation utilities;
- red-team test cases, regression harnesses, tracing and metrics.

We prefer small vendored/adapted modules with attribution over wholesale import of an entire agent product. A pinned dependency is acceptable temporarily when copying is disproportionate, but it must be replaceable and explicitly documented.

## Candidate selection

The current candidate matrix and priority decisions live in [OPEN_SOURCE_REUSE_CATALOG.md](OPEN_SOURCE_REUSE_CATALOG.md). Initial source donors:
- LangGraph.js (MIT): selected TypeScript workflow/checkpoint primitives.
- Mozilla Readability (Apache-2.0): pure article extraction.
- Mem0 (Apache-2.0): deterministic memory merge/deduplication patterns, not provider adapters.
- Microsoft Playwright (Apache-2.0): deterministic browser engine and tests.
- Promptfoo (MIT): local deterministic evaluation and red-team test patterns.
- LitGPT (Apache-2.0), with nanoGPT (MIT) as a readable comparison: from-scratch training code only.

Mastra, Stagehand, Browser Use, Graphiti, MarkItDown, Chroma, Qdrant, OpenTelemetry and other candidates are documented with narrower dispositions. AGPL/GPL projects and repositories with unresolved licences are not copied without a separate owner licensing decision.

## Architecture rule

```
Awwab-owned UI and product contracts
             |
Awwab Core: context, workflow, memory policy, permissions,
approvals, tools, budgets, execution, verification, audit
             |
Small vendored/adapted deterministic modules
             |
Awwab-owned model architecture + randomly initialized weights
```

Imported code is a component, not an authority. It cannot determine identity, ownership, permission, risk, approval, budget, or success. All imported output is untrusted until Awwab validates it.

## Source-copying gate

Before a file is copied:
1. Pin the upstream repository and exact commit SHA.
2. Inspect the exact file's licence, headers, NOTICE, generated status and imports.
3. Review transitive dependencies, install scripts, binaries, telemetry, network calls and model/weight assets.
4. Remove provider-specific or hosted-service paths not required by Awwab.
5. Preserve required notices and add a row to `THIRD_PARTY_NOTICES.md`.
6. Port to Awwab-owned types and add tests for no hidden API/model/network calls.
7. Run security, licence, dependency, build and integration checks.

The Awwab repository had no root-level licence file in the reviewed tree. This plan does not select an Awwab licence. GPL/AGPL source is deferred pending an explicit distribution/licensing decision.

## Implementation order

1. R1: Readability parser source review and integration into Research; pure parser, no fetching.
2. R2: minimal workflow state/checkpoint primitives from LangGraph.js.
3. R3: memory merge/conflict/temporal provenance improvements based on Mem0 and Graphiti.
4. R4: local read-only Playwright browser adapter with sandbox and allowlist.
5. R5: LitGPT/nanoGPT-derived training improvements for Awwab's random-init Model Lab.
6. R6: local document ingestion based on selected MarkItDown parsing patterns.
7. R7: Promptfoo-inspired evaluation and minimal OpenTelemetry.
8. Release gates, manual testing and owner-authorized deployment.

See the catalogue for detailed acceptance criteria, project links and rejected/deferred options.

## Current state

This document update does not itself copy third-party code or add dependencies. The independent model boundary and Model Lab scaffold remain in place. The latest CI run [40872007847](https://github.com/mdanasaaq-design/Awwab/actions/runs/40872007847) passed six jobs on `d81779e`; PR #22 remains draft/open. No deployment, billing change, paid API, model/data download, secret configuration or cloud resource creation occurred.
