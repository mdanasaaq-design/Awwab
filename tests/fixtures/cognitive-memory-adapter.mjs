import { CognitiveCoreError, validateMemoryRecord } from "../../packages/shared/src/cognitive-core.mjs";

function fail(code, message) {
  throw new CognitiveCoreError(code, message);
}

function key(ownerId, memoryId) {
  return `${ownerId}\u0000${memoryId}`;
}

function nextTimestamp(clock, previous) {
  const requested = Date.parse(clock());
  if (!Number.isFinite(requested)) fail("invalid_input", "Adapter clock must return a valid timestamp.");
  return new Date(Math.max(requested, Date.parse(previous) + 1)).toISOString();
}

/**
 * Test-only reference adapter. This is deliberately in-memory and is not
 * exported from Awwab's runtime package or suitable for production storage.
 */
export function createMemoryAdapterFixture({ clock = () => new Date().toISOString() } = {}) {
  const records = new Map();

  function owned(ownerId, memoryId) {
    const record = records.get(key(ownerId, memoryId));
    if (!record) fail("not_found", "Memory was not found.");
    return record;
  }

  function assertVersion(record, expectedUpdatedAt) {
    if (record.updatedAt !== expectedUpdatedAt) fail("conflict", "Memory changed since it was read.");
  }

  return Object.freeze({
    async getMemory({ ownerId, memoryId }) {
      return records.get(key(ownerId, memoryId)) ?? null;
    },

    async listMemories({ ownerId, options = {} }) {
      const { kind, status, limit = 100 } = options;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) fail("invalid_input", "limit must be between 1 and 100.");
      return [...records.values()]
        .filter((record) => record.ownerId === ownerId)
        .filter((record) => kind == null || record.kind === kind)
        .filter((record) => status == null || record.status === status)
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, limit);
    },

    async createMemory({ ownerId, record }) {
      if (!record || record.ownerId !== ownerId) fail("owner_mismatch", "Memory owner does not match request owner.");
      const normalized = validateMemoryRecord(record);
      const recordKey = key(ownerId, normalized.id);
      if (records.has(recordKey)) fail("already_exists", "Memory ID already exists.");
      records.set(recordKey, normalized);
      return normalized;
    },

    async updateMemory({ ownerId, memoryId, patch, expectedUpdatedAt }) {
      const previous = owned(ownerId, memoryId);
      assertVersion(previous, expectedUpdatedAt);
      if (!patch || typeof patch !== "object" || Array.isArray(patch)) fail("invalid_input", "patch must be an object.");
      for (const field of ["id", "ownerId", "createdAt", "updatedAt"]) {
        if (Object.hasOwn(patch, field)) fail("invalid_input", `${field} is immutable.`);
      }
      const updatedAt = nextTimestamp(clock, previous.updatedAt);
      const updated = validateMemoryRecord({ ...previous, ...patch, updatedAt });
      records.set(key(ownerId, memoryId), updated);
      return updated;
    },

    async deleteMemory({ ownerId, memoryId, expectedUpdatedAt }) {
      const previous = owned(ownerId, memoryId);
      assertVersion(previous, expectedUpdatedAt);
      records.delete(key(ownerId, memoryId));
      return true;
    },

    async resolveMemoryConflict({ ownerId, command }) {
      if (!command || command.ownerId !== ownerId) fail("owner_mismatch", "Conflict owner does not match request owner.");
      const winner = owned(ownerId, command.winner.id);
      assertVersion(winner, command.winner.expectedUpdatedAt);
      if (winner.status !== "active") fail("invalid_conflict", "Conflict winner must remain active.");
      const updates = [];
      for (const loser of command.archive) {
        const current = owned(ownerId, loser.id);
        assertVersion(current, loser.expectedUpdatedAt);
        if (current.status !== "active" || current.kind !== winner.kind || current.id === winner.id) {
          fail("invalid_conflict", "Conflict losers must be distinct active memories of the winner's kind.");
        }
        if (Date.parse(command.resolvedAt) < Date.parse(current.updatedAt)) {
          fail("invalid_input", "Conflict resolution time cannot move a memory timestamp backwards.");
        }
        updates.push(validateMemoryRecord({ ...current, status: "archived", updatedAt: command.resolvedAt }));
      }
      // Commit only after every record and expected version has passed validation.
      for (const archived of updates) records.set(key(ownerId, archived.id), archived);
    },
  });
}
