# Cognitive memory storage boundary

**Status:** Versioned adapter contract and policy prototype only. No durable adapter is implemented or approved.

## Contract version 1

The shared package exports `CognitiveMemoryAdapter` and
`COGNITIVE_MEMORY_ADAPTER_CONTRACT_VERSION = 1`. Every method accepts one
request object containing an explicit `ownerId`; implementations must derive
that value from trusted authenticated server context, not model output or an
untrusted client field.

| Method | Request | Required behavior |
|---|---|---|
| `getMemory` | `{ ownerId, memoryId }` | Return the record or `null`. A foreign owner's record must be indistinguishable from a missing record. |
| `listMemories` | `{ ownerId, options? }` | Return only records belonging to that owner; optional kind/status/limit filters are bounded. |
| `createMemory` | `{ ownerId, record }` | Require `record.ownerId === ownerId`; reject duplicate IDs rather than overwrite. |
| `updateMemory` | `{ ownerId, memoryId, patch, expectedUpdatedAt }` | Check ownership and exact current version; reject stale writes; immutable ID/owner/creation/update timestamps cannot be supplied in the patch. The adapter assigns a new monotonic `updatedAt`. |
| `deleteMemory` | `{ ownerId, memoryId, expectedUpdatedAt }` | Explicit owner-requested deletion only; check ownership and exact version before deleting. |
| `resolveMemoryConflict` | `{ ownerId, command }` | Verify command owner and every expected version, then archive all selected losers in one all-or-nothing transaction. Never partially apply. |

The expected error codes are `not_found` (including cross-owner access),
`already_exists`, `conflict` (stale version), and `invalid_input`. Errors
must not reveal another owner's record existence or contents.

The runtime `assertCognitiveMemoryAdapter` checks method presence only. It
does **not** prove request semantics, authorization, transactionality,
persistence, encryption, auditability, or Firestore Rules compatibility.
The compile-time contract fixture checks the TypeScript interface only.
A real adapter still requires isolated behavioral conformance tests,
security review, failure/retry tests, and explicit architecture approval.

## Conflict semantics

Awwab must not infer that two memories contradict merely because their wording
differs or lexical similarity is high. A conflict group is presented for owner
review. The owner explicitly selects the winning memory and supplies a
rationale. The policy helper creates a deterministic command containing
expected versions; it does not write data. Conflict resolution must preserve
the winner and archive all selected losers atomically or do nothing.

## Retention semantics

- Expired records are excluded from assistant context.
- Expiry does not authorize hard deletion.
- Archived and expired records remain available to owner-controlled
  review/export/deletion workflows.
- No automatic purge, silent rewrite, or cross-owner retention job is permitted.
- A future retention implementation must define audit, recovery, legal/privacy
  requirements, and explicit deletion behavior before durable storage is enabled.

## Current implementation boundary

The Cognitive Core in-memory store remains a test/reference store, not an
implementation of this durable adapter interface. The policy module is pure
and dependency-free. Existing Firestore schema, Rules, Memory UI, live data,
Firebase plan, and deployments are unchanged.
