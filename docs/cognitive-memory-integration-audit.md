# Cognitive Memory integration audit

**Review date:** 2026-11-02  
**Review type:** Source-only review of the existing MemoryPanel, Firestore Rules, backend context preview and the new Cognitive Core contracts.  
**Decision:** No integration, schema change, Rules change, deployment, migration, or live Firestore read/write was performed or approved.

## Executive finding

The existing MemoryPanel and the Cognitive Core are separate systems with incompatible schemas and different lifecycle semantics. The read-only compatibility mapper is an appropriate boundary prototype, but it is not a Firestore adapter. Do not connect it to the panel or persistence until the security and schema decisions below are resolved.

## Existing MemoryPanel

Source: `apps/web/src/MemoryPanel.tsx`.

- Reads `/users/{uid}/memories` through a Firestore snapshot listener.
- Creates records directly from the signed-in web client.
- Corrections update the same document and set `sourceKind: user_corrected`.
- Deletion is a direct owner client delete after a browser confirmation.
- Uses six legacy types: `explicit_preference`, `stable_profile_fact`, `goal_commitment`, `project_context`, `learned_preference`, and `temporary_context`.
- Uses Firestore Timestamp values, a 2,000-character content limit, `user_explicit/user_corrected` provenance, and legacy fields `confirmedByUser` and `userVisible`.
- Allows temporary context with no expiry; the UI offers never, 30, 90, or 365 days.
- Does not store an `ownerId` field in each document; ownership is expressed by the authenticated user's document path.

The panel's copy says saved content is not automatically sent to an assistant runtime. Preserve this distinction.

## Existing Firestore Rules

Source: `firestore.rules`; emulator coverage: `tests/firestore.rules.test.js`.

- Memory reads and deletes are owner-path scoped.
- Client creates require the exact legacy field set, supported legacy type, user-entered provenance, bounded content, timestamps, expiry shape, sensitivity and confirmation fields.
- Client updates require the valid legacy schema, `user_corrected` provenance, immutable `createdAt`, and server request time for `updatedAt`.
- Sensitive records require explicit confirmation.
- Expired records cannot be corrected through the current valid-memory update predicate because non-null expiry must be later than `request.time`; the UI correspondingly disables correction for expired records. Owner deletion remains allowed.
- The schema has no cognitive `kind`, `status`, `ownerId`, source object, goals, experiences, revision metadata, or expected-version field.
- The rules tests exercise owner isolation and malformed/forged writes, but passing emulator tests do not prove that these Rules are deployed in the live Firebase project.

## Existing backend memory-context preview

Sources: `backend/functions/src/index.ts`, `apps/web/src/App.tsx`, and `apps/web/src/device.ts`.

- Settings exposes a manual **Preview context** action. It is not automatic assistant retrieval.
- The callable requires Firebase Auth, an explicit `conversation_context` scope and a device ID that the backend currently considers trusted.
- The loader queries only the authenticated UID's memory subcollection, considers at most 50 recent records, caps returned content at 6,000 total characters, excludes sensitive/unconfirmed/hidden/expired/unsupported-provenance records, and marks returned content as untrusted reference data.
- This is a preview of eligible legacy records. It does not use the new Cognitive Core or its adapter contract.
- **Security blocker:** the device check relies on the caller-supplied device ID and trusted status, not cryptographic proof of private-key possession. The previously confirmed AWW-022 spoofing issue therefore also affects the trust assumption behind this preview endpoint. A second-session memory-preview characterization test has been added. Do not treat the preview's device gate as strong device authentication until AWW-022 is fixed and independently tested. See the [device proof-of-possession design proposal](device-proof-of-possession-design.md).
- Assistant generation remains separately gated; the preview endpoint is not proof that an assistant model is running or that memory is automatically injected into ordinary conversations.

## Compatibility matrix

| Concern | Legacy persistence/UI | Cognitive Core | Decision |
|---|---|---|---|
| Ownership | Auth UID in Firestore path | Explicit `ownerId` in records and calls | Adapter must derive owner from trusted server auth context; never from model/client payload |
| Type system | Six legacy labels | Five kinds | Use the read-only mapper only for unambiguous cases; owner review required for ambiguous labels |
| Content size | 2,000 characters | Up to 8,000 | Enforce legacy 2,000 limit when representing legacy records |
| Time | Firestore Timestamp | ISO-8601 strings | Convert only at a future adapter boundary |
| Provenance | `user_explicit/user_corrected` | `owner_entered/owner_corrected/observed_evidence/reviewed_import` | Current Rules support only the first two equivalents |
| Confirmation | `confirmedByUser` | `confirmedByOwner` | Preserve exactly; never infer |
| Expiry | Nullable; even temporary context may be non-expiring | Working memory requires expiry | Reject non-expiring temporary records; do not invent expiry |
| Lifecycle | No archived status; direct deletion | Active/archived and explicit deletion | Requires product/schema decision; do not silently add a field |
| Concurrency | No expected version in current UI update | Expected `updatedAt` required by adapter contract | Future adapter must use transactions/conditional writes |
| Conflict handling | No conflict workflow | Owner-selected winner and atomic archive command | No automatic conflict inference or mutation |
| Goals/experiences | Legacy goal text only | Structured goal and evidence-linked experience records | No automatic conversion from legacy goal/project labels |

## Findings and risks

1. **No safe direct structural mapping.** The mapper intentionally rejects `goal_commitment` and `project_context`; keep that behavior.
2. **Working-memory expiry mismatch.** The legacy UI allows no-expiry temporary context. Do not silently assign a default expiry.
3. **No durable lifecycle representation.** Adding archive/status or cognitive fields requires a separately reviewed schema and Rules change.
4. **No optimistic concurrency in the legacy panel.** A future adapter must handle stale edits/deletes atomically; current UI does not supply expected versions.
5. **Trust dependency is unresolved.** AWW-022 must be resolved before the preview endpoint's trusted-device gate can be relied on for sensitive access.
6. **Live Rules state is unknown.** Source and emulator results are not evidence of deployed production Rules.
7. **No migration is justified.** The current mapper and reference adapter tests use synthetic fixtures only; no user records were read, transformed or written.

## Safe next sequence

1. Keep the MemoryPanel, Firestore schema, Rules and live data unchanged.
2. Fix AWW-022 through a separately bounded proof-of-possession design and emulator tests before relying on trusted-device authorization.
3. Keep regression coverage for preview filtering and expiry. The new second-session preview-spoof characterization test makes the AWW-022 impact explicit; invert it to a denial expectation after proof-of-possession is implemented. Add a per-record content bound and malformed timestamp cases before adapter work.
4. Define owner decisions for ambiguous legacy types, temporary-memory expiry, archive/delete behavior and correction/concurrency UX.
5. Design a read-only Firestore adapter prototype against synthetic emulator fixtures only; derive `ownerId` from verified server auth and test owner isolation, stale versions, transaction rollback and Rules compatibility.
6. Submit a separate integration proposal with exact schema/Rules diff and rollback plan. Obtain explicit approval before any production Rules deployment, migration or live writes.

## Explicit non-actions

- No change to `MemoryPanel.tsx`, `firestore.rules`, backend callables or live Firestore data.
- No durable Cognitive Memory adapter.
- No schema migration or background import.
- No Firestore Rules deployment.
- No enabling automatic memory injection or assistant generation.
- No claim that current trusted-device checks prove device-key possession.
