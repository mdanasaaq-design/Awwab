# Assistant Core Foundation — bounded slice

**Status:** Implementation proposed in PR; not yet merged or validated in CI.  
**Base:** `main` at `cffb22b829e76a859dd3029e482abd10e8314af5`.  
**Scope:** Provider-neutral plan validation and policy preflight only.

## Why this slice

Awwab's architecture calls for a planner that proposes structured steps while trusted backend code independently validates tools, risk, and approval. This slice establishes that boundary without introducing an external agent framework, provider dependency, live model call, persistence, or tool execution.

## Implemented in this slice

- Versioned plan shape with strict allowed-key checks and bounded step count/text/payload size.
- Duplicate step-ID rejection.
- Trusted tool-policy lookup; unknown tools fail closed.
- Per-tool input validation supplied by backend code; exceptions fail closed.
- Risk and approval requirements derived from trusted policy, with high/critical risk always requiring approval.
- Idempotency metadata carried into the decision result for a later executor.
- Unit tests for valid plans and rejection paths.

## Explicitly not implemented

- Model/provider calls, conversation or memory retrieval.
- Firestore writes, durable jobs, approval records, tool execution, retries, cancellation, or verification.
- An authenticated callable endpoint or web composer connection.
- Mastra, LangGraph.js, OpenClaw, or any other external assistant as a runtime dependency.

## Acceptance criteria

- [ ] Functions TypeScript build succeeds on Node.js 22.
- [ ] Unit tests pass for schema bounds, duplicate IDs, unexpected fields, unknown tools, invalid tool arguments, registry duplication, and thrown validators.
- [ ] CI runs the unit tests on pull requests.
- [ ] Existing web, Firestore Rules, and callable checks remain green.
- [ ] No model output can define tool permissions, risk, or approval policy.
- [ ] No live action is executed by this module.

## Next gate

Only after Phase 2 security/environment exit criteria are satisfied should Awwab add authenticated request ingress, provider abstraction, persistence, approval records, and bounded execution in separate reviewed slices.
