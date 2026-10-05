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
