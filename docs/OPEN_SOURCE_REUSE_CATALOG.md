# Awwab Open-Source Reuse Catalogue and Integration Plan

**Research date:** 2026-10-30  
**Repository baseline:** `d81779e9996c69b88e6c140ea473eb4b603c4a17` on `phase-4-memory-research-safety`  
**Planning branch:** `opensource-reuse-strategy`  
**Status:** Research and integration plan; no third-party source code has been imported by this document update.

## 1. Owner direction and interpretation

Awwab remains its own product and independent AI system. The owner wants us to **reuse, copy, adapt, and incorporate useful open-source source code into Awwab itself**, rather than merely studying other projects or making Awwab a thin wrapper around them.

This is distinct from depending on another AI model:
- Reusing deterministic agent orchestration, browser, memory, parsing, testing, training, and infrastructure code is allowed after review.
- Awwab's intelligence model remains Awwab-owned and randomly initialized. No third-party pretrained weights, model API, hosted agent, or teacher-model distillation.
- We should vendor selected source files/modules or adapt algorithms into Awwab-owned modules. Do not import an entire agent product when a small, bounded component solves the need.
- A third-party package may be used temporarily when vendoring is disproportionate, but the default long-term goal is to own and maintain the required code inside Awwab. Any runtime dependency must be explicit, pinned, replaceable, and documented.

## 2. Awwab baseline and constraints

The repository currently has:
- React + TypeScript + Vite web application.
- Kotlin + Jetpack Compose Android shell.
- Firebase Authentication and Cloud Firestore.
- TypeScript Firebase Functions backend targeting Node.js 22.
- Memory UI/storage and bounded retrieval callable.
- Research UI with Wikipedia and Crossref lookup.
- An independent model interface that fails closed while the model is `not_trained`.
- `model-lab/`: reversible byte tokenizer, provenance-checked JSONL loader, randomly initialized small causal Transformer, training/checkpoint/inference/evaluation scaffolding.

Latest observed CI run [40872007847](https://github.com/mdanasaaq-design/Awwab/actions/runs/40872007847) passed all six jobs on commit `d81779e9996c69b88e6c140ea473eb4b603c4a17`. PR #22 remains open and draft. This proves the checked CI jobs, not live deployment or user-facing end-to-end readiness.

Hard constraints:
- No external AI APIs, hosted agent services, third-party pretrained model weights, or silent remote fallback.
- No paid API, paid compute, model/data downloads, new cloud resources, Firebase billing upgrade, secret creation, migration, or production deployment without explicit owner approval.
- Do not use user conversations as training data without separate explicit opt-in.
- Firebase Auth/device state/Firestore remain existing cloud dependencies; Awwab is not fully offline yet.
- All retrieved pages, repository files, model outputs, and tool results are untrusted data, never instructions or authorization.
- Preserve current working features and data; no wholesale rewrite.

## 3. Candidate repository catalogue

The licence values below were checked against GitHub repository metadata or the repository's own README during this review. A repository-level licence is only the starting point: before copying a file, inspect that exact file's path, notices, submodule origin, generated assets, bundled models, and any separate licence. Review again at the commit actually copied.

### A. Agent orchestration and workflow state

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [LangGraph.js](https://github.com/langchain-ai/langgraphjs) | MIT; TypeScript; strong language/runtime fit | Selected graph/state-machine implementation patterns, typed node/edge execution, checkpoint interfaces, interrupt/resume flow, retry boundaries, and deterministic workflow tests. Port the smallest useful primitives into Awwab-owned contracts. | Do not import the full framework by default, its provider adapters, or any model integration. **Priority A — inspect source and select small modules.** |
| [Mastra](https://github.com/mastra-ai/mastra) | Apache-2.0 core; directories named `ee/` use a separate Mastra Enterprise License | TypeScript workflow composition, tool schema conventions, durable workflow and evaluation patterns. | Never copy `ee/` code without a separate commercial licence. Large surface area overlaps LangGraph; **reference/secondary candidate**, do not combine both frameworks wholesale. |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Repository availability/licence was not reliably confirmed in this pass | Study task decomposition, workspace isolation, tool boundaries, and agent run observability if needed later. | No source copying until repository identity, current licence, exact files, and Python/runtime footprint are verified. **Reference only for now.** |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | GitHub API returned `NOASSERTION`; exact licence needs inspection | If Awwab later needs tool interoperability, inspect protocol framing, schema validation, and transport code. | Do not add SDK or copy files until its actual LICENSE/NOTICE and dependency chain are verified. MCP is transport/interoperability, not authorization. **Deferred.** |

**Recommendation:** use LangGraph.js as the first source donor for selected deterministic workflow code, not as Awwab's application framework. Keep Awwab's request, job, policy, approval, audit, and tool contracts authoritative.

### B. Browser and computer interaction

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [Microsoft Playwright](https://github.com/microsoft/playwright) | Apache-2.0; mature TypeScript/Node browser automation | Browser lifecycle, locator/action patterns, waiting, navigation, screenshots, trace capture, and deterministic browser tests. Use the smallest browser-control layer needed. | Do not expose arbitrary browser control to the model. Browser binaries and installation footprint must be assessed. **Priority A for browser capability.** |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | Apache-2.0 | Page snapshot/accessibility-tree extraction, browser action wrappers, screenshot and navigation flows, and useful test fixtures. | Take selected handlers/helpers only; do not adopt its full MCP server or broad tool surface by default. |
| [Browser Use](https://github.com/browser-use/browser-use) | MIT; Python-first | DOM/screenshot observation, action validation, browser state handling, retry/recovery, and task-result verification patterns. Port selected deterministic ideas to TypeScript where useful. | Do not embed the Python agent as a separate service or use its model/provider integrations. |
| [Stagehand](https://github.com/browserbase/stagehand) | MIT; TypeScript | Browser interaction abstractions, extraction schemas, and resilient locator strategies. Useful as a source-code comparison alongside Playwright. | Its natural-language actions assume a model/provider. Copy only deterministic pieces; no Browserbase cloud or external model calls. |
| [Mozilla Readability](https://github.com/mozilla/readability) | Apache-2.0; small focused article extraction library | Article-content extraction, boilerplate removal, metadata handling, and parsing tests. Could be vendored/adapted into Research as a local parser when HTML is already available. | It does not fetch websites and does not bypass browser CORS. Keep fetch and parse separate. **Priority A for research extraction.** |

**Recommendation:** Playwright is the deterministic browser engine; Readability is a content parser. Browser Use and Stagehand are implementation donors for selected patterns, not required runtime agents. Start read-only and isolated. No credential entry, purchases, message sending, account changes, or arbitrary shell access in the first browser phase.

### C. Memory, retrieval, and knowledge

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [Mem0](https://github.com/mem0ai/mem0) | Apache-2.0; memory algorithms and data flows are useful | Candidate extraction, conflict detection, merge/deduplication, memory update decisions, temporal metadata, and retrieval-ranking test patterns. Port only the provider-independent logic. | Do not import its LLM provider adapters, default remote calls, vector-store stack, or broad runtime. Preserve Awwab's explicit user confirmation, Firestore ownership and sensitivity controls. **Priority A — inspect memory algorithms.** |
| [Graphiti](https://github.com/getzep/graphiti) | Apache-2.0; Python and graph-database-oriented | Temporal facts, entity/relation provenance, valid-time/invalid-time concepts, contradiction handling, and evolving-context test cases. Translate the data model into Awwab's own schema if useful. | Do not add Neo4j/FalkorDB or Python services now; no external model calls. **Priority B — schema/pattern donor.** |
| [Chroma](https://github.com/chroma-core/chroma) | Apache-2.0 | Vector-index design and retrieval test ideas if semantic retrieval becomes necessary. | No vector database now. Awwab does not yet have its own trained embedding model; adding a store before that is premature. |
| [Qdrant](https://github.com/qdrant/qdrant) | Apache-2.0; Rust vector database | Indexing, filtering, payload isolation, and ANN retrieval design if scale later requires it. | Full server is a separate infrastructure component, not source to transplant into the current Firebase app. **Deferred until measured need.** |

**Recommendation:** do not replace existing Firestore memory. First improve Awwab's own memory policy and data model using selected Mem0/Graphiti algorithms. Add semantic indexing only after an Awwab-owned embedding path and retrieval benchmark exist.

### D. Research and document understanding

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [Mozilla Readability](https://github.com/mozilla/readability) | Apache-2.0; TypeScript/JavaScript-compatible | Main article extraction and readability heuristics; metadata and fixture tests. **Priority A.** | Does not fetch URLs; CORS, SSRF, and safe-fetch rules remain separate. |
| [Microsoft MarkItDown](https://github.com/microsoft/markitdown) | MIT; Python document-to-Markdown converter | Format-detection ideas, conversion fixtures, and selected parser logic for PDF/Office/text formats. | Python-first and broad dependencies; port only needed formats or build a small local adapter. Do not upload private documents to a hosted converter. |
| [Firecrawl](https://github.com/firecrawl/firecrawl) | AGPL-3.0 | Useful feature reference for crawl/extract pipelines, structured output, and source metadata. | **Do not copy into Awwab by default.** AGPL obligations and the large service footprint require a separate licensing decision. Reimplement the narrow needed behavior with permissively licensed code. |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | Licence and exact current status require file-level verification before reuse | Crawl orchestration, content extraction, and crawler test ideas. | Python service and dependency footprint; no copy until exact licence/security review. |

**Recommendation:** improve the existing Wikipedia/Crossref research workflow with source metadata, deduplication, safe URL ingestion, Readability extraction, and claim-to-source mapping. Do not copy Firecrawl's AGPL code.

### E. Model architecture and training (Awwab's own weights only)

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [LitGPT](https://github.com/Lightning-AI/litgpt) | Apache-2.0; actively developed training recipes | Random-initialization model code, attention/optimizer improvements, pretraining loop, checkpoint resume, batching, precision/memory optimizations, and benchmark harness patterns. Select and port only the from-scratch path. **Priority A for Model Lab review.** | Do not load its catalogue of pretrained models, download checkpoints, use fine-tuning recipes that start from external weights, or adopt Lightning infrastructure without a need. |
| [nanoGPT](https://github.com/karpathy/nanoGPT) | MIT; compact and readable, latest repository push observed 2025-11-12 | Small decoder-only Transformer, token batching, training loop, sampling, and educational tests. Good source for a minimal implementation. | Smaller/older training infrastructure than LitGPT; compare rather than merge two full training stacks. **Priority B as a readable donor.** |
| [torchtune](https://github.com/pytorch/torchtune) | Repository identity/licence was not confirmed in this review | Potential future recipe/configuration ideas. | Do not copy until exact repository, licence and random-init pretraining path are verified. |

**Non-negotiable:** Awwab's model weights start from random initialization. Reusing training algorithms, tensor kernels, optimizer implementations, checkpoint mechanics, tokenizer code, and test harnesses does not mean reusing another model. Do not download any pretrained model or dataset as part of this plan.

### F. Evaluation, security, and observability

| Repository | Licence / fit | What Awwab can take | What not to take / decision |
|---|---|---|---|
| [Promptfoo](https://github.com/promptfoo/promptfoo) | MIT; TypeScript test/evaluation tooling | Test case format, assertion/rubric patterns, red-team scenarios, regression reporting, and deterministic mock-provider tests. Could vendor small test utilities or use a pinned dev-only package after dependency review. **Priority A.** | Do not configure hosted model providers or API keys; no paid evaluation calls. |
| [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) | Apache-2.0 | Trace/span conventions, correlation IDs, structured metrics and instrumentation patterns for local diagnostics. | Add only when observability need is concrete; never log prompts, secrets, or private memory by default. |
| [Langfuse](https://github.com/langfuse/langfuse) | GitHub API reports `NOASSERTION`; exact current licence is unresolved | Study trace and experiment UX concepts. | **No code reuse until licence and deployment/privacy model are verified.** Do not send personal prompts to a hosted service. |

### G. Voice and speech

| Repository | Licence / model constraint | What Awwab can take | Decision |
|---|---|---|---|
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT code, but typical use requires OpenAI Whisper pretrained weights | Study audio streaming, buffering, platform bindings, and inference-engine integration boundaries. | Do not use Whisper weights as Awwab intelligence or speech model. No weight download. Revisit only if a non-model component is useful and separated cleanly. |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT code, but typically runs pretrained Whisper weights | Study audio preprocessing/batching and inference-performance patterns. | No Whisper weights or hosted inference. Reference only. |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 code; voice models have separate licences | Study local TTS packaging and audio-stream interfaces. | Do not copy GPL code or ship voice weights without a separate licence decision. No voice-model downloads. |

## 4. What we should actually integrate

### First wave — high value, low architectural disruption

1. **Mozilla Readability source**: vendor/adapt the article extraction core and its relevant tests, preserving Apache-2.0 notices. Integrate as a pure parser with no network access.
2. **Promptfoo evaluation patterns**: add Awwab-owned deterministic evaluation cases and adversarial fixtures inspired by its MIT-licensed test design; avoid remote provider adapters and API calls.
3. **LangGraph.js selected workflow primitives**: extract only the small state/checkpoint/interrupt ideas that fit Awwab's TypeScript contracts. Do not add the entire framework.
4. **Mem0 selected deterministic memory algorithms**: inspect exact modules for deduplication, conflict/merge and candidate lifecycle; port to Awwab types and retain explicit user approval. No provider or vector DB.
5. **Playwright browser adapter**: use its Apache-2.0 browser engine for deterministic local browser automation after the local runtime/sandbox boundary is established; borrow Playwright MCP/Browser Use patterns for accessible snapshots and action verification.

### Second wave — after first user-facing workflows work

6. **Graphiti temporal fact schema patterns**: add valid-time, source provenance and contradiction handling to Awwab memory only if test cases show the current schema cannot represent evolving facts.
7. **LitGPT training improvements**: compare current Model Lab to its from-scratch pretraining code; port selected batching, optimizer, checkpoint-resume, and memory optimizations. Never import its pretrained weights.
8. **MarkItDown parser ideas**: add document ingestion for formats users actually upload; keep all parsing local and validate file size/type/resource limits.
9. **OpenTelemetry**: add minimal local traces/metrics once the runtime has multiple stages and debugging requires it.

### Deliberately deferred or rejected

- Full Mastra or LangGraph runtime adoption: unnecessary framework lock-in while Awwab can own a small runtime.
- Full OpenHands/Browser Use/Stagehand agent stack: too broad; take deterministic components only.
- Firecrawl source code: AGPL-3.0; do not transplant without explicit licence approval.
- Mem0's default provider/vector database integrations: conflict with no-external-AI and existing Firestore controls.
- Graphiti's Neo4j/FalkorDB deployment: no demonstrated need.
- Chroma/Qdrant: wait for an Awwab-owned embedding model and retrieval benchmark.
- Whisper/Piper pretrained speech models: prohibited by the independent-model decision; voice is a later, separately scoped project.
- Any repo with unresolved licence, archived/abandoned status, unreviewed binary assets, or unclear provenance: reference only.

## 5. Source-copying and licence procedure

Before copying any upstream file:
1. Record repository URL, exact commit SHA, retrieval date, file path, upstream copyright header and SPDX licence.
2. Inspect the exact file and every imported file; repository root licence alone is not enough for monorepos, dual-licensed projects, generated code, models, datasets or submodules.
3. Confirm dependencies and transitive licences; remove provider integrations, network calls, telemetry and unrelated features that Awwab does not need.
4. Copy into a clearly named Awwab-owned module, adapt types/interfaces, and add tests proving no unwanted service or model call exists.
5. Preserve copyright and licence text. Apache-2.0 copies retain required NOTICE attributions where applicable; MIT copies retain copyright and permission notice.
6. Add an entry to `THIRD_PARTY_NOTICES.md` with source commit, copied paths, licence, modifications and local owner.
7. Run licence, secret, dependency, static, unit, integration and security checks.
8. Never execute upstream install scripts or downloaded binaries blindly. Review workflows, postinstall scripts, native binaries and model files.
9. Keep an exit path: Awwab should be able to maintain or replace the imported module without depending on an upstream hosted service.

**Awwab licensing note:** no root-level Awwab licence was present in the reviewed tree. This plan does not choose or grant an Awwab distribution licence. MIT/Apache code can generally be incorporated subject to their notice/condition requirements, but GPL/AGPL code can impose reciprocal obligations. Avoid GPL/AGPL until the owner explicitly chooses a project licensing/distribution policy and receives appropriate legal review.

## 6. Integration architecture

```
Awwab Web / Android
        |
Awwab-owned contracts and UI
        |
Awwab Core (owned)
  - request lifecycle / workflow state
  - context and memory policy
  - retrieval and research
  - permissions / approvals
  - tool registry / budgets
  - execution / verification / audit
        |
Vendored and adapted modules
  - LangGraph-derived state primitives
  - Mem0-derived memory algorithms
  - Readability parser
  - Playwright browser adapter
  - Promptfoo-derived evaluation utilities
  - LitGPT-derived training optimizations
        |
Awwab-owned model and weights (random initialization)
        |
Existing Firebase data/auth boundary; local runtime where required
```

Imported modules never decide identity, ownership, permissions, approval, risk, budgets, or whether an action succeeded. Those remain Awwab-owned deterministic code.

## 7. Phased implementation plan and acceptance gates

| Phase | Work | Exit criteria |
|---|---|---|
| R0 — Reuse inventory (this documentation pass) | Catalogue projects, check repository-level licences, classify exact use, record owner constraints | Owner strategy recorded; source-copy checklist and priorities documented |
| R1 — Research extraction | Readability source review and bounded integration into Research | Pure parser; no network; source URL/provenance preserved; malicious HTML fixtures; tests pass; attribution present |
| R2 — Workflow engine | Extract minimal graph/state/checkpoint primitives from LangGraph.js | Awwab-owned types; resumable state tests; no provider dependency; cancellation and bounded step tests |
| R3 — Memory quality | Inspect Mem0 algorithms and Graphiti data patterns; improve Awwab Firestore memory lifecycle | Explicit confirmation preserved; merge/conflict tests; source provenance; expiry/sensitivity controls; no AI API |
| R4 — Browser capability | Playwright-based local browser adapter, with selected Browser Use/MCP patterns | Read-only first; isolated profile; domain/action allowlist; prompt-injection tests; screenshots/evidence; no credential or external side effects |
| R5 — Model Lab upgrade | Compare LitGPT/nanoGPT code and port useful from-scratch training improvements | Random-init tests; deterministic small smoke run; checkpoint resume; held-out metrics; no pretrained weights |
| R6 — Document ingestion | Adapt MarkItDown parsing patterns for chosen formats | Local processing, MIME/size limits, extraction tests, source/page mapping, private-data safeguards |
| R7 — Evaluation/observability | Promptfoo-derived tests and minimal OpenTelemetry | Deterministic CI, red-team regression set, trace IDs, redacted logs, no external model calls |
| R8 — Release and device validation | Complete real browser/mobile testing and deployment decisions | Security review, explicit approval, no deployment until owner authorizes |

## 8. First implementation task — R1 Readability review

**Bounded task:** inspect Mozilla Readability's exact source files and Apache-2.0 notice; identify the minimal parser module and tests to vendor; compare against the existing ResearchPanel and current fetch constraints. Do not yet build a crawler or bypass CORS.

Acceptance criteria:
- [ ] Exact upstream commit SHA and copied file list recorded.
- [ ] Apache-2.0 licence and any NOTICE requirements preserved.
- [ ] Parser is pure: accepts an already-fetched DOM/document and returns normalized article fields.
- [ ] Parser performs no network requests, AI inference, telemetry, or file writes.
- [ ] URL fetching is kept separate and is not allowed to fetch private/local network addresses.
- [ ] Malformed, oversized, script-heavy and empty HTML fixtures are covered.
- [ ] Existing Wikipedia/Crossref workflows remain functional.
- [ ] Web typecheck/build and relevant tests pass.
- [ ] No model/data download, paid service, cloud resource, deployment or secret change.

## 9. Research sources

- [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
- [Mastra](https://github.com/mastra-ai/mastra) and [licence mapping](https://github.com/mastra-ai/mastra/blob/main/LICENSE.md)
- [OpenHands](https://github.com/All-Hands-AI/OpenHands)
- [Playwright](https://github.com/microsoft/playwright)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Browser Use](https://github.com/browser-use/browser-use)
- [Stagehand](https://github.com/browserbase/stagehand)
- [Mozilla Readability](https://github.com/mozilla/readability)
- [Mem0](https://github.com/mem0ai/mem0)
- [Graphiti](https://github.com/getzep/graphiti)
- [Chroma](https://github.com/chroma-core/chroma)
- [Qdrant](https://github.com/qdrant/qdrant)
- [MarkItDown](https://github.com/microsoft/markitdown)
- [Firecrawl](https://github.com/firecrawl/firecrawl)
- [LitGPT](https://github.com/Lightning-AI/litgpt)
- [nanoGPT](https://github.com/karpathy/nanoGPT)
- [Promptfoo](https://github.com/promptfoo/promptfoo)
- [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js)
- [Langfuse](https://github.com/langfuse/langfuse)
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- [Piper](https://github.com/OHF-Voice/piper1-gpl)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---
This is a research-backed candidate list, not blanket permission to copy every listed repository. Exact source-file and licence review is required before each transplant.


## R1 source-import progress — 2026-10-30

**Completed substep:** Mozilla Readability source has been vendored at `apps/web/src/vendor/mozilla/Readability.js` from upstream commit `ab4027a8b37669745016869a37a504727992b2ba`. Its Apache-2.0 licence is copied alongside it. Awwab adds only an ES-module default export and a typed, bounded wrapper at `apps/web/src/research/articleParser.ts`. The wrapper accepts already-fetched HTML, accepts only HTTP(S) provenance URLs, caps input at 1 MB and output at 12,000 characters, and returns plain text only. It performs no fetching or model calls.

A deterministic Node test suite and CI step have been added. CI has not yet run for this branch; the PR must report the actual result. The Research UI is not wired to the parser yet. The next R1 substep is to design a safe source adapter (the parser does not bypass CORS), then connect Wikipedia HTML extraction and preserve current Crossref/Wikipedia behavior. Manual browser parser acceptance remains required.


### R1 implementation update — 2026-10-30

The Readability parser is now vendored and wired into the existing Wikipedia Research path. After Wikipedia search, Awwab requests page HTML from the fixed `en.wikipedia.org/w/api.php?action=parse` endpoint with CORS enabled, parses the returned HTML locally, and displays plain text only. If parsing fails or yields insufficient text, Awwab falls back to the provider's search excerpt. Crossref behavior is unchanged. This is a bounded integration, not arbitrary website crawling. CI has confirmed the parser tests and web typecheck/build on the implementation commit; remaining backend/rules jobs are tracked separately. Manual browser review of representative Wikipedia pages remains outstanding.


### R1 CI result — 2026-10-30

<code>CI run 41064652230</code> on latest branch head `c36830480c1c85d91624804c88195dab7f3355f8` completed with all six jobs successful: parser/provenance tests, Model Lab checks, web typecheck/build, Functions/shared typecheck, Firestore rules, and backend callable emulator tests. This does not replace manual browser testing of the actual Wikipedia article output.


## Self-development priority alignment — 2026-10-31

R1 Mozilla Readability is complete: the parser is vendored with Apache-2.0 attribution and integrated into the fixed Wikipedia parse path. Do not repeat R1 or claim arbitrary URL crawling.

The current reuse priority is aligned to the Self-Development Master Plan:
1. R2 minimal deterministic workflow/checkpoint primitives (LangGraph.js-derived) only if the Cognitive Core needs them; no full framework adoption.
2. R3 Mem0-derived memory merge/deduplication/conflict logic, adapted to Awwab's consent, provenance, sensitivity and owner-scope policy.
3. R5 LitGPT/nanoGPT-derived random-initialization training improvements; no pretrained weights, external model APIs or dataset downloads.
4. R4 Playwright-based read-only repository/documentation browser mechanics with strict sandbox and allowlist.
5. R7 Promptfoo-inspired local red-team/evaluation fixtures; no hosted provider integrations.
6. R6 selected local document parsing only for formats actually supported.

This is a priority order, not permission to copy code immediately. Cognitive Core contracts and acceptance tests come first; each source transplant requires pinned commit, exact-file licence/NOTICE/import review, dependency/security review, attribution and regression tests. Awwab's model, policies, data boundaries and authorization remain independent. See [Self-Development Master Plan](../project/SELF_DEVELOPMENT_MASTER_PLAN.md).
