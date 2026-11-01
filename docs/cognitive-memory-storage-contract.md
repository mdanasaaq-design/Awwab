# Cognitive memory storage boundary

**Status:** Contract and policy prototype only. No durable adapter is implemented.

## Adapter contract

A future adapter must expose these asynchronous operations:

- `getMemory(ownerId, memoryId)`
- `listMemories(ownerId, options)`
- `createMemory(ownerId, record)`
- `updateMemory(ownerId, memoryId, patch, expectedUpdatedAt)`
- `deleteMemory(ownerId, memoryId, expectedUpdatedAt)`
- `resolveMemoryConflict(ownerId, command)`

The owner ID must be derived from a trusted authenticated server context, never accepted as authority from model output or an untrusted client payload. Every operation is owner-scoped. Reads must not disclose whether another owner's record exists.

Mutations require optimistic concurrency using the record's expected version. Conflict resolution is a single atomic operation: verify the winner and all losing records still match their expected versions, keep the owner-selected winner, archive the selected losing records, and commit all changes or none. An adapter must reject stale versions and cross-owner IDs.

The runtime shape assertion in `@awwab/shared/cognitive-memory-policy` checks method presence only. It does not prove authorization, transactionality, persistence, encryption, or Rules compatibility. Adapter conformance tests and a security review are mandatory before use.

## Conflict semantics

Awwab must not infer that two memories contradict merely because their wording differs or lexical similarity is high. A conflict group is presented for owner review. The owner explicitly selects the winning memory and supplies a rationale. The policy helper creates a deterministic command containing expected versions; it does not write data.

## Retention semantics

- Expired records are excluded from assistant context.
- Expiry does not authorize hard deletion.
- Archived and expired records remain available to owner-controlled review/export/deletion workflows.
- No automatic purge, silent rewrite, or cross-owner retention job is permitted.
- A future retention implementation must define audit, recovery, legal/privacy requirements, and explicit deletion behavior before durable storage is enabled.

## Current implementation boundary

The Cognitive Core in-memory store remains a test/reference adapter. The new policy module is pure and dependency-free. Existing Firestore schema, Rules, Memory UI, live data, Firebase plan, and deployments are unchanged.
