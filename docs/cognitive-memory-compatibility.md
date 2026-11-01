# Existing Memory UI compatibility assessment

**Status:** Source-only assessment. No application code, Firestore schema, Rules, or live data changed.

## Existing implementation

The web Memory panel is `apps/web/src/MemoryPanel.tsx`. It directly subscribes to and writes documents at `/users/{uid}/memories/{memoryId}`. The current Firestore Rules in `firestore.rules` validate that existing document shape and allow owner reads/deletes plus constrained user-entered creates and user-corrected updates.

The panel explicitly tells the owner that saved content is not used by the assistant until a future authorized retrieval workflow is connected. Keep that statement true.

## Logical mapping (proposal only)

| Existing Firestore field/value | Cognitive Core concept | Compatibility note |
|---|---|---|
| `content` | `content` | Existing limit is 2,000 chars; core allows 8,000. A bridge must enforce the stricter 2,000 limit for existing records. |
| `explicit_preference`, `learned_preference` | `semantic` | Learned preference must remain explicitly confirmed; never infer confirmation. |
| `stable_profile_fact` | `semantic` | Preserve user-entered provenance and confidence. |
| `goal_commitment` | Goal record, optionally linked memory | Do not silently convert this into a goal; a future explicit review/confirmation is required. |
| `project_context` | `episodic` or `semantic` | Classification depends on whether it describes an event or a stable fact; do not guess automatically. |
| `temporary_context` | `working` | Existing UI offers no-expiry as well as 30/90/365 days. A future working-memory adapter must reject or assign a bounded expiry only with an explicit product decision. |
| `sourceKind: user_explicit` | `source.kind: owner_entered` | Map only when the record is read from the authenticated owner's existing path. |
| `sourceKind: user_corrected` | `source.kind: owner_corrected` | Preserve `sourceRef` as provenance reference. |
| Firestore `Timestamp` | ISO-8601 string | Convert at the adapter boundary; preserve server timestamp semantics on writes. |
| `confirmedByUser` | `confirmedByOwner` | Exact semantic equivalent for the current owner-confirmation flag. |
| `expiresAt` | `expiresAt` | Firestore null/timestamp must be converted without changing expiry. |
| `sensitivity`, `confidence`, `userVisible` | same concepts | Validate both existing and core constraints; do not weaken Rules. |

## Gaps and blockers

1. Existing Firestore records have six UI types; Cognitive Core has five different memory kinds. Several mappings are ambiguous and require owner/product decisions.
2. The core's 8,000-character memory limit is wider than the current UI/Rules 2,000-character limit.
3. The core model includes archived status, while the existing Firestore shape has no status field. Adding it would be a schema/Rules change and is not approved.
4. Existing UI permits non-expiring temporary context; the core context selector requires working memory to expire.
5. Current Rules permit only user-entered/user-corrected provenance. They do not authorize observed evidence, reviewed imports, inferred facts, or backend-generated memories.
6. Firestore Rules are not deployed/accepted as live production policy merely because emulator tests pass.
7. Firestore Timestamp conversion, conflict transactions, expected-version concurrency and retention behavior require adapter conformance tests.

## Safe integration sequence

1. Keep the existing Memory panel and Firestore schema unchanged.
2. Build a read-only mapper over synthetic fixtures first; reject ambiguous records rather than guessing.
3. Add round-trip tests for every existing type, source, timestamp, expiry and sensitivity combination.
4. Add adapter conformance tests for owner isolation, stale writes, atomic conflict resolution, correction and deletion.
5. Review the actual Firestore Rules and prove the adapter can satisfy them without broadening access.
6. Only then propose a separate schema/Rules change and request owner approval before any live writes or migration.

**Decision for this phase:** no MemoryPanel integration, Firestore adapter, schema migration, Rules edit/deployment, or live database write. The in-memory Cognitive Core remains separate from existing user-entered memory.
