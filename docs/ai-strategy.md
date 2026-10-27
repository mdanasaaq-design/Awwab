# Awwab AI and Model Strategy

## Objective

Use the best available model for each task without making Awwab dependent on one vendor.

## Model roles

- **Fast:** routing, extraction, simple transformations.
- **Reasoning:** complex planning and analysis.
- **Multimodal:** images, screenshots, documents.
- **Speech:** STT/TTS and real-time voice.
- **Specialized:** coding, embeddings or local inference only when justified.

## Model router

Consider task class, quality, context length, tools, latency, cost, privacy and availability.

## Provider abstraction

The internal provider interface should represent input, model selection, tools, structured output, streaming, usage and errors without leaking vendor-specific state into the product.

## Tool calling

The model may propose a call. Backend must validate tool existence/schema, permissions, risk, approval, execute, verify and sanitize the result.

## Structured output

Prefer schemas for intent, plan, tool call, memory candidate, research claim, automation and execution result.

## Context

Use recent conversation, compact summaries, active task/project, relevant memory, retrieved documents and tool state. Avoid indiscriminate context stuffing.

## Memory

The model may propose memory. Deterministic policy decides durability, sensitivity, confidence, expiry and confirmation.

## Hallucination controls

Retrieve evidence for current facts, cite sources, state uncertainty, never invent tool results and verify side effects.

## Evaluation

Candidate providers/models must be tested against the Awwab benchmark for quality, safety, tool correctness, factuality, latency, cost and context handling.

## Provider decision

Do not select a permanent provider before evaluation. Choose by measured task performance and operational constraints.

## Current ecosystem note

Modern agent APIs increasingly support web/file tools, function calling, remote MCP and computer-use patterns. These are building blocks, not substitutes for Awwab's own authorization and verification.

References:
- https://platform.openai.com/docs/
- https://modelcontextprotocol.io/


## Independent agent-runtime direction (research update — 2026-10-18)

Awwab will implement its own runtime and product logic. Research into Mastra, LangGraph.js, OpenClaw, Dodaios, Khoj, OpenAgent and MCP is architectural reconnaissance only. Do not copy their code, import their runtime, or make Awwab depend on any of those projects as part of this direction. Any future third-party dependency requires a separate explicit decision, license review, compatibility review, and measurable benefit.

Use the research to inform requirements, not dictate implementation:

- **Durable workflow state:** model jobs, steps, attempts, checkpoints, cancellation and recovery explicitly.
- **Human approval:** approval must bind to a specific action, target, arguments/payload digest, expiry and requester; re-check authorization at execution time.
- **Trust boundaries:** treat retrieved webpages, documents, tool output and model-produced arguments as untrusted input.
- **Provider neutrality:** keep model-provider interfaces replaceable and avoid provider-specific state in product contracts.
- **Tool contracts:** allowlisted tools have versioned schemas, scopes, risk, data classes, idempotency, timeout/retry policy, approval policy and verification rules.
- **Evidence-first completion:** record tool results and verification evidence; never infer success from the absence of an exception.
- **Bounded execution:** enforce step, token/cost, wall-clock and tool-call budgets; support cancellation and safe failure states.

### Framework research disposition

Mastra and LangGraph.js remain comparison references only; no framework has been selected. The first Awwab proof of concept should be a native, minimal request-to-structured-plan pipeline, not a framework integration. Select infrastructure only after validating Node.js 22, Cloud Functions execution limits, Firestore persistence needs, recovery semantics and operational cost.

### Initial model/runtime experiment

The first experiment should not execute external side effects. It should:
1. authenticate a request in the backend;
2. validate a bounded request envelope;
3. ask a provider-neutral model adapter for a schema-validated plan;
4. validate every proposed step against an Awwab-owned capability registry;
5. persist request/plan/status with user ownership and correlation IDs;
6. return the plan and explicit non-execution status;
7. test malformed output, unauthorized access, timeouts, retries and cross-user isolation.

Sensitive approval and actual tool execution belong to a later increment after this foundation passes tests.


---

> **Planning sync — 2026-10-27:** This document describes a capability, design or acceptance contract; it does not prove the capability is live. See the [Awwab Master Plan and Work Audit](../../project/MASTER_PLAN.md) for current evidence, the Firebase Blaze blocker, source-reconciliation steps and the ordered implementation gates.
