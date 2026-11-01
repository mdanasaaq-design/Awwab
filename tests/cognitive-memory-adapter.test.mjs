import assert from "node:assert/strict";
import { test } from "node:test";
import { createMemoryConflictResolution } from "../packages/shared/src/cognitive-memory-policy.mjs";
import { createMemoryAdapterFixture } from "./cognitive-memory-adapter.mjs";

const at = "2026-11-01T10:00:00.000Z";
function memory(id, ownerId = "owner-a", overrides = {}) {
  return {
    id, ownerId, kind: "semantic", content: `Memory ${id}`,
    source: { kind: "owner_entered", reference: null },
    confidence: 1, sensitivity: "normal",
    createdAt: "2026-11-01T09:00:00.000Z", updatedAt: at, expiresAt: null,
    userVisible: true, confirmedByOwner: true, status: "active",
    ...overrides,
  };
}

test("adapter scopes reads and lists by owner without disclosing foreign records", async () => {
  const adapter = createMemoryAdapterFixture();
  await adapter.createMemory({ ownerId: "owner-a", record: memory("same-id") });
  await adapter.createMemory({ ownerId: "owner-b", record: memory("same-id", "owner-b") });

  assert.equal(await adapter.getMemory({ ownerId: "owner-b", memoryId: "missing" }), null);
  assert.equal(await adapter.getMemory({ ownerId: "owner-b", memoryId: "same-id" }).then((value) => value.ownerId), "owner-b");
  assert.deepEqual((await adapter.listMemories({ ownerId: "owner-a" })).map((item) => item.ownerId), ["owner-a"]);
  assert.deepEqual((await adapter.listMemories({ ownerId: "owner-a", options: { limit: 1 } })).map((item) => item.id), ["same-id"]);
});

test("adapter rejects owner mismatch and duplicate IDs rather than overwriting", async () => {
  const adapter = createMemoryAdapterFixture();
  await assert.rejects(
    adapter.createMemory({ ownerId: "owner-a", record: memory("foreign", "owner-b") }),
    (error) => error.code === "owner_mismatch",
  );
  await adapter.createMemory({ ownerId: "owner-a", record: memory("m1") });
  await assert.rejects(
    adapter.createMemory({ ownerId: "owner-a", record: memory("m1") }),
    (error) => error.code === "already_exists",
  );
});

test("updates and deletions require the exact expected version", async () => {
  const adapter = createMemoryAdapterFixture({ clock: () => "2026-11-01T10:01:00.000Z" });
  const original = await adapter.createMemory({ ownerId: "owner-a", record: memory("m1") });
  await assert.rejects(
    adapter.updateMemory({ ownerId: "owner-a", memoryId: "m1", patch: { content: "stale" }, expectedUpdatedAt: "2026-11-01T08:00:00.000Z" }),
    (error) => error.code === "conflict",
  );
  const updated = await adapter.updateMemory({
    ownerId: "owner-a", memoryId: "m1", patch: { content: "corrected" }, expectedUpdatedAt: original.updatedAt,
  });
  assert.equal(updated.content, "corrected");
  assert.ok(Date.parse(updated.updatedAt) > Date.parse(original.updatedAt));
  await assert.rejects(
    adapter.updateMemory({ ownerId: "owner-a", memoryId: "m1", patch: { ownerId: "owner-b" }, expectedUpdatedAt: updated.updatedAt }),
    (error) => error.code === "invalid_input",
  );
  await assert.rejects(
    adapter.deleteMemory({ ownerId: "owner-a", memoryId: "m1", expectedUpdatedAt: original.updatedAt }),
    (error) => error.code === "conflict",
  );
  assert.equal(await adapter.deleteMemory({ ownerId: "owner-a", memoryId: "m1", expectedUpdatedAt: updated.updatedAt }), true);
  assert.equal(await adapter.getMemory({ ownerId: "owner-a", memoryId: "m1" }), null);
});

test("conflict resolution is atomic when any expected version is stale", async () => {
  const adapter = createMemoryAdapterFixture();
  const winner = await adapter.createMemory({ ownerId: "owner-a", record: memory("winner") });
  const loserA = await adapter.createMemory({ ownerId: "owner-a", record: memory("loser-a") });
  const loserB = await adapter.createMemory({ ownerId: "owner-a", record: memory("loser-b") });
  const staleCommand = createMemoryConflictResolution({
    ownerId: "owner-a", winner, losers: [loserA, loserB],
    reason: "Owner reviewed the conflict.", resolvedAt: "2026-11-01T10:02:00.000Z",
  });
  await adapter.updateMemory({
    ownerId: "owner-a", memoryId: "loser-b", patch: { content: "newer version" }, expectedUpdatedAt: loserB.updatedAt,
  });
  await assert.rejects(
    adapter.resolveMemoryConflict({ ownerId: "owner-a", command: staleCommand }),
    (error) => error.code === "conflict",
  );
  assert.equal((await adapter.getMemory({ ownerId: "owner-a", memoryId: "loser-a" })).status, "active");
  assert.equal((await adapter.getMemory({ ownerId: "owner-a", memoryId: "loser-b" })).status, "active");
});

test("conflict resolution archives all selected losers together and preserves the winner", async () => {
  const adapter = createMemoryAdapterFixture();
  const winner = await adapter.createMemory({ ownerId: "owner-a", record: memory("winner") });
  const loserA = await adapter.createMemory({ ownerId: "owner-a", record: memory("loser-a") });
  const loserB = await adapter.createMemory({ ownerId: "owner-a", record: memory("loser-b") });
  const command = createMemoryConflictResolution({
    ownerId: "owner-a", winner, losers: [loserA, loserB],
    reason: "Owner confirmed the current preference.", resolvedAt: "2026-11-01T10:02:00.000Z",
  });
  await adapter.resolveMemoryConflict({ ownerId: "owner-a", command });
  assert.equal((await adapter.getMemory({ ownerId: "owner-a", memoryId: "winner" })).status, "active");
  assert.equal((await adapter.getMemory({ ownerId: "owner-a", memoryId: "loser-a" })).status, "archived");
  assert.equal((await adapter.getMemory({ ownerId: "owner-a", memoryId: "loser-b" })).status, "archived");
});
