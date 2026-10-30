# Daily Log

## 2026-10-05

### Agentic architecture upgrade
- Reviewed the existing repository foundation and documentation.
- Researched current agentic-AI security and interoperability guidance.
- Expanded Awwab's product definition from a chatbot shell to a secure personal-agent platform.
- Added explicit status semantics for implemented, validated, planned, proposed and blocked work.
- Added planning/execution separation, model routing, tool registry, policy engine, approval binding and verification.
- Added memory provenance and poisoning controls.
- Added long-running job and automation requirements.
- Added agent evaluation and regression requirements.
- Added capability catalog and threat model.
- Added phased roadmap focused on user value rather than feature count.

### Research basis
- OWASP GenAI Security Project and 2026 guidance.
- OWASP Top 10 for Agentic Applications.
- NIST AI Risk Management Framework and Generative AI Profile.
- Current MCP evolution, including authorization hardening and long-running task patterns.
- Current agent/tool capabilities exposed by major AI platforms.

### Validation boundary
This documentation update does not claim local builds, emulator tests, real Firebase integration, Android tests or production deployment. Those remain executable validation tasks.


## 2026-10-27 — Planning and deployment-blocker audit

- Confirmed Firebase project access and existence of the default Firestore Native database in asia-south1.
- Confirmed Functions list is empty; attempted Functions deployment stopped before deployment because Blaze is required.
- Recorded owner choice to stay on the current Firebase plan.
- Local extracted ZIP copy passed functions typecheck/build and web build; Node 22 parity and GitHub-main parity remain unverified.
- Added a master plan that separates completed code changes from pending manual, emulator, live-environment and production checks.
- No Hosting, Rules or Functions deployment was performed; no alternate backend was selected or provisioned.


## 2026-10-30 — Open-source reuse strategy

- Owner clarified that selected public GitHub source code should be copied/adapted and integrated directly into Awwab, rather than used only as inspiration.
- Added a detailed catalogue and R1–R7 integration plan covering workflow orchestration, Readability, memory, Playwright, model-training engineering, document parsing and evaluation.
- Recorded exact repository-level licence checks and deferred GPL/AGPL/unresolved-licence projects.
- Confirmed the independent-model requirement remains unchanged: no third-party pretrained weights, external AI APIs, hosted agents or teacher-model distillation.
- Updated active planning, architecture, security, testing, model and project-tracking docs in one documentation commit.
- Started R1 source review: Mozilla Readability upstream commit `ab4027a8b37669745016869a37a504727992b2ba`; source `Readability.js` (90,944 bytes); Apache-2.0. The parser accepts an existing DOM Document and does not fetch pages. CORS/fetch design and a suitable test harness must be solved before UI integration.
- No third-party source code or dependency has been copied/added yet. No model/data download, paid service, deployment, billing change, secret or cloud resource was used.


## 2026-10-30 — R1 first source transplant

- Inspected Mozilla Readability upstream commit `ab4027a8b37669745016869a37a504727992b2ba`, source header and Apache-2.0 licence.
- Vendored its standalone `Readability.js` source and full licence into Awwab; added one ESM export required by Vite.
- Added a typed wrapper that parses caller-supplied HTML only, rejects oversized input and non-HTTP(S) attribution URLs, caps plain-text output, and performs no network calls.
- Added Node wrapper/provenance tests and wired them into the CI workflow. Full CI/browser validation remains pending.
- Did not yet change ResearchPanel, fetch arbitrary URLs, bypass CORS, or add any external service.


### 2026-10-30 — R1 Research integration

- Wired the vendored Mozilla Readability parser into the existing Wikipedia research path using Wikipedia's fixed CORS-enabled parse API endpoint.
- Kept URL fetching separate from parsing; only the known Wikipedia API is fetched. No arbitrary URL fetch, crawler, proxy or SSRF-capable user URL path was introduced.
- The parser returns normalized plain text; the UI falls back to the search excerpt when parsing fails or returns too little content. Crossref remains unchanged.
- CI confirmed parser adapter/provenance tests and web typecheck/build for implementation commit `02546c3`; full workflow run [41064461385](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064461385) is still in progress for remaining jobs.
- Manual browser/source-quality validation remains pending.


### R1 CI completion

- Latest branch-head CI run [41064652230](https://github.com/mdanasaaq-design/Awwab/actions/runs/41064652230) passed all six jobs.
- Confirmed parser/provenance tests, web typecheck/build, Functions/shared typecheck, Firestore rules and backend callable emulator tests all passed.
- Manual browser testing remains outstanding; no deployment or merge performed.
