import { CognitiveCoreError } from "./cognitive-core.mjs";

const REQUIRED_METHODS = Object.freeze([
  "getMemory",
  "listMemories",
  "createMemory",
  "updateMemory",
  "deleteMemory",
  "resolveMemoryConflict",
]);

function fail(code, message) {
  throw new CognitiveCoreError(code, message);
}

function nonEmpty(value, name, max = 256) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    fail("invalid_input", `${name} must contain 1–${max} characters.`);
  }
  return value.trim();
}

/**
 * Runtime shape check for a future durable adapter. This deliberately does not
 * construct a database client, infer an owner, or perform I/O.
 */
export function assertCognitiveMemoryAdapter(adapter) {
  if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) {
    fail("invalid_adapter", "A cognitive memory adapter object is required.");
  }
  const missing = REQUIRED_METHODS.filter((method) => typeof adapter[method] !== "function");
  if (missing.length) fail("invalid_adapter", `Adapter is missing methods: ${missing.join(", ")}.`);
  return adapter;
}

/**
 * Create a validated, owner-scoped conflict-resolution command. The owner (not
 * lexical similarity or a model) chooses the winner and records the rationale.
 * The adapter must apply this command atomically using the expected versions.
 */
export function createMemoryConflictResolution({
  ownerId, winner, losers, reason, resolvedAt,
}) {
  nonEmpty(ownerId, "ownerId");
  if (!winner || typeof winner !== "object" || winner.ownerId !== ownerId) {
    fail("owner_mismatch", "The winning memory must belong to the requested owner.");
  }
  if (!Array.isArray(losers) || losers.length < 1 || losers.length > 20) {
    fail("invalid_input", "A conflict must archive between 1 and 20 losing memories.");
  }
  nonEmpty(reason, "reason", 1000);
  const at = nonEmpty(resolvedAt, "resolvedAt", 64);
  const parsedAt = Date.parse(at);
  if (!Number.isFinite(parsedAt)) fail("invalid_input", "resolvedAt must be a valid date.");
  if (winner.status !== "active") fail("invalid_conflict", "The winning memory must be active.");
  const ids = new Set([nonEmpty(winner.id, "winner.id", 128)]);
  const archive = losers.map((record) => {
    if (!record || typeof record !== "object" || record.ownerId !== ownerId) {
      fail("owner_mismatch", "Every losing memory must belong to the requested owner.");
    }
    const id = nonEmpty(record.id, "loser.id", 128);
    if (ids.has(id)) fail("invalid_conflict", "Conflict memory IDs must be unique.");
    ids.add(id);
    if (record.status !== "active" || record.kind !== winner.kind) {
      fail("invalid_conflict", "Losing memories must be active and share the winner's memory kind.");
    }
    if (typeof record.updatedAt !== "string" || !Number.isFinite(Date.parse(record.updatedAt))) {
      fail("invalid_input", "Every memory requires a valid updatedAt version.");
    }
    return Object.freeze({ id, expectedUpdatedAt: record.updatedAt });
  });
  if (typeof winner.updatedAt !== "string" || !Number.isFinite(Date.parse(winner.updatedAt))) {
    fail("invalid_input", "The winning memory requires a valid updatedAt version.");
  }
  return Object.freeze({
    ownerId,
    winner: Object.freeze({ id: winner.id, expectedUpdatedAt: winner.updatedAt }),
    archive: Object.freeze(archive),
    reason: reason.trim(),
    resolvedAt: new Date(parsedAt).toISOString(),
    atomicity: "all_or_nothing",
    policy: "owner_selected_winner",
  });
}

/**
 * Expiry is a retrieval/retention signal, not permission to hard-delete data.
 * Expired records remain available for owner review, export and deletion flows.
 */
export function evaluateMemoryRetention(record, { now = new Date().toISOString() } = {}) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail("invalid_input", "A memory record is required.");
  }
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) fail("invalid_input", "now must be a valid date.");
  if (record.expiresAt == null) {
    return Object.freeze({ state: record.status === "archived" ? "archived" : "retained", excludeFromContext: record.status !== "active", hardDelete: false });
  }
  const expiryMs = Date.parse(record.expiresAt);
  if (!Number.isFinite(expiryMs)) fail("invalid_input", "expiresAt must be a valid date or null.");
  if (record.status === "archived") {
    return Object.freeze({ state: "archived", excludeFromContext: true, hardDelete: false });
  }
  if (expiryMs <= nowMs) {
    return Object.freeze({ state: "expired", excludeFromContext: true, hardDelete: false });
  }
  return Object.freeze({ state: "retained", excludeFromContext: false, hardDelete: false });
}

export const COGNITIVE_MEMORY_ADAPTER_CONTRACT_VERSION = 1;
export const COGNITIVE_MEMORY_ADAPTER_METHODS = REQUIRED_METHODS;
