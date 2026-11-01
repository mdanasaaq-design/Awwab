import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CognitiveCoreError,
} from "../packages/shared/src/cognitive-core.mjs";
import {
  assertCognitiveMemoryAdapter,
  COGNITIVE_MEMORY_ADAPTER_CONTRACT_VERSION,
  COGNITIVE_MEMORY_ADAPTER_METHODS,
  createMemoryConflictResolution,
  evaluateMemoryRetention,
} from "../packages/shared/src/cognitive-memory-policy.mjs";

const base = (overrides = {}) => ({
  id: "m1", ownerId: "owner-a", kind: "semantic", content: "A fact",
  status: "active", updatedAt: "2026-10-31T00:00:00.000Z",
  expiresAt: null, ...overrides,
});

test("adapter v1 exposes the documented method set and shape-checks without invoking methods", () => {
  assert.throws(() => assertCognitiveMemoryAdapter({ getMemory() {} }),
    (error) => error instanceof CognitiveCoreError && error.code === "invalid_adapter");
  const adapter = Object.fromEntries([
    "getMemory", "listMemories", "createMemory", "updateMemory", "deleteMemory", "resolveMemoryConflict",
  ].map((name) => [name, () => {}]));
  assert.equal(COGNITIVE_MEMORY_ADAPTER_CONTRACT_VERSION, 1);
  assert.deepEqual(COGNITIVE_MEMORY_ADAPTER_METHODS, [
    "getMemory", "listMemories", "createMemory", "updateMemory", "deleteMemory", "resolveMemoryConflict",
  ]);
  let invoked = false;
  const guarded = Object.fromEntries(Object.entries(adapter).map(([name]) => [name, () => { invoked = true; }]));
  assert.equal(assertCognitiveMemoryAdapter(guarded), guarded);
  assert.equal(invoked, false, "shape assertion must not execute adapter methods");
});

test("owner-selected conflict plan archives only same-owner active memories of the same kind", () => {
  const plan = createMemoryConflictResolution({
    ownerId: "owner-a", winner: base({ id: "winner" }),
    losers: [base({ id: "old-a" }), base({ id: "old-b", updatedAt: "2026-10-30T00:00:00.000Z" })],
    reason: "Owner confirmed the newer preference is correct.",
    resolvedAt: "2026-11-01T10:00:00.000Z",
  });
  assert.equal(plan.atomicity, "all_or_nothing");
  assert.equal(plan.policy, "owner_selected_winner");
  assert.deepEqual(plan.archive.map((item) => item.id), ["old-a", "old-b"]);
  assert.equal(plan.archive[1].expectedUpdatedAt, "2026-10-30T00:00:00.000Z");
  assert.ok(Object.isFrozen(plan.archive));
});

test("conflict resolution rejects cross-owner, duplicate, inactive and mixed-kind records", () => {
  const winner = base({ id: "winner" });
  const make = (loser) => createMemoryConflictResolution({
    ownerId: "owner-a", winner, losers: [loser], reason: "Owner reviewed", resolvedAt: "2026-11-01T10:00:00.000Z",
  });
  assert.throws(() => make(base({ id: "x", ownerId: "owner-b" })), (error) => error.code === "owner_mismatch");
  assert.throws(() => make(base({ id: "winner" })), (error) => error.code === "invalid_conflict");
  assert.throws(() => make(base({ id: "x", status: "archived" })), (error) => error.code === "invalid_conflict");
  assert.throws(() => make(base({ id: "x", kind: "episodic" })), (error) => error.code === "invalid_conflict");
});

test("conflict command requires rationale and valid record versions", () => {
  assert.throws(() => createMemoryConflictResolution({
    ownerId: "owner-a", winner: base(), losers: [base({ id: "old" })],
    reason: " ", resolvedAt: "2026-11-01T10:00:00.000Z",
  }), (error) => error.code === "invalid_input");
});

test("expired memory is excluded but never automatically hard-deleted", () => {
  const result = evaluateMemoryRetention(base({ expiresAt: "2026-10-31T00:00:00.000Z" }), { now: "2026-11-01T00:00:00.000Z" });
  assert.deepEqual(result, { state: "expired", excludeFromContext: true, hardDelete: false });
});

test("unexpired, non-expiring and archived memories receive deterministic retention states", () => {
  assert.equal(evaluateMemoryRetention(base({ expiresAt: "2026-12-01T00:00:00.000Z" }), { now: "2026-11-01T00:00:00.000Z" }).state, "retained");
  assert.equal(evaluateMemoryRetention(base({ status: "archived" })).state, "archived");
  assert.equal(evaluateMemoryRetention(base()).hardDelete, false);
});
