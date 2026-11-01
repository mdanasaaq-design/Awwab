import { validateMemoryRecord } from "./cognitive-core.mjs";

const LEGACY_TYPES = Object.freeze([
  "explicit_preference",
  "stable_profile_fact",
  "goal_commitment",
  "project_context",
  "learned_preference",
  "temporary_context",
]);
const TYPE_TO_KIND = Object.freeze({
  explicit_preference: "semantic",
  stable_profile_fact: "semantic",
  learned_preference: "semantic",
  temporary_context: "working",
});
const KIND_TO_TYPES = Object.freeze({
  semantic: Object.freeze(["explicit_preference", "stable_profile_fact", "learned_preference"]),
  working: Object.freeze(["temporary_context"]),
});
const SOURCE_TO_CORE = Object.freeze({
  user_explicit: "owner_entered",
  user_corrected: "owner_corrected",
});
const SOURCE_TO_LEGACY = Object.freeze({
  owner_entered: "user_explicit",
  owner_corrected: "user_corrected",
});
const LEGACY_CONTENT_LIMIT = 2000;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function timestampToIso(value, field, nullable = false) {
  if (nullable && value === null) return null;
  let date;
  if (value instanceof Date) date = value;
  else if (typeof value === "string" || typeof value === "number") date = new Date(value);
  else if (isObject(value) && typeof value.toDate === "function") date = value.toDate();
  else if (isObject(value) && Number.isFinite(value.seconds)) {
    date = new Date(value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1e6));
  }
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError(`${field} must be a valid Date, ISO string, or Firestore Timestamp.`);
  }
  return date.toISOString();
}

function validateLegacyShape(input) {
  if (!isObject(input)) throw new TypeError("Legacy memory must be an object.");
  if (typeof input.id !== "string" || !input.id.trim()) throw new TypeError("Legacy memory id is required.");
  if (typeof input.content !== "string" || !input.content.trim() || input.content.trim().length > LEGACY_CONTENT_LIMIT) {
    throw new TypeError("Legacy memory content must contain 1–2000 characters.");
  }
  if (!LEGACY_TYPES.includes(input.type)) throw new TypeError("Legacy memory type is not supported.");
  if (!Object.hasOwn(SOURCE_TO_CORE, input.sourceKind)) throw new TypeError("Legacy memory sourceKind is not supported.");
  if (input.sourceRef !== null && input.sourceRef !== undefined && typeof input.sourceRef !== "string") {
    throw new TypeError("Legacy memory sourceRef must be a string or null.");
  }
  if (typeof input.userVisible !== "boolean" || typeof input.confirmedByUser !== "boolean") {
    throw new TypeError("Legacy memory visibility and confirmation flags are required.");
  }
  if (!["low", "normal", "sensitive"].includes(input.sensitivity)) throw new TypeError("Legacy memory sensitivity is not supported.");
  if (typeof input.confidence !== "number" || !Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    throw new TypeError("Legacy memory confidence must be between 0 and 1.");
  }
}

export function mapLegacyMemoryToCognitive(input, { ownerId } = {}) {
  try {
    validateLegacyShape(input);
    if (typeof ownerId !== "string" || !ownerId.trim()) {
      return Object.freeze({ ok: false, reason: "owner_required" });
    }
    if (input.type === "goal_commitment" || input.type === "project_context") {
      return Object.freeze({ ok: false, reason: "ambiguous_type", legacyType: input.type });
    }
    if (input.type === "temporary_context" && input.expiresAt === null) {
      return Object.freeze({ ok: false, reason: "working_memory_requires_expiry", legacyType: input.type });
    }
    const record = validateMemoryRecord({
      id: input.id,
      ownerId,
      kind: TYPE_TO_KIND[input.type],
      content: input.content,
      source: {
        kind: SOURCE_TO_CORE[input.sourceKind],
        reference: input.sourceRef ?? null,
      },
      confidence: input.confidence,
      sensitivity: input.sensitivity,
      createdAt: timestampToIso(input.createdAt, "createdAt"),
      updatedAt: timestampToIso(input.updatedAt, "updatedAt"),
      expiresAt: timestampToIso(input.expiresAt, "expiresAt", true),
      userVisible: input.userVisible,
      confirmedByOwner: input.confirmedByUser,
      status: "active",
    });
    return Object.freeze({ ok: true, record, legacyType: input.type });
  } catch (error) {
    return Object.freeze({
      ok: false,
      reason: "invalid_record",
      message: error instanceof Error ? error.message : "Legacy memory is invalid.",
    });
  }
}

export function mapCognitiveMemoryToLegacy(record, { legacyType } = {}) {
  if (!isObject(record)) throw new TypeError("Cognitive memory record must be an object.");
  if (!LEGACY_TYPES.includes(legacyType) || !KIND_TO_TYPES[record.kind]?.includes(legacyType)) {
    throw new TypeError("An explicit compatible legacyType is required; the cognitive kind alone is ambiguous.");
  }
  if (record.status !== "active") throw new TypeError("Archived cognitive memories cannot be represented by the legacy schema.");
  if (!Object.hasOwn(SOURCE_TO_LEGACY, record.source?.kind)) {
    throw new TypeError("The legacy schema supports only owner-entered and owner-corrected provenance.");
  }
  if (typeof record.content !== "string" || record.content.trim().length < 1 || record.content.trim().length > LEGACY_CONTENT_LIMIT) {
    throw new TypeError("Legacy memory content must contain 1–2000 characters.");
  }
  if (record.kind === "working" && record.expiresAt === null) {
    throw new TypeError("The legacy temporary-context type requires an expiry.");
  }
  const normalized = validateMemoryRecord(record);
  return Object.freeze({
    content: normalized.content,
    type: legacyType,
    sourceKind: SOURCE_TO_LEGACY[normalized.source.kind],
    sourceRef: normalized.source.reference,
    confidence: normalized.confidence,
    sensitivity: normalized.sensitivity,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    expiresAt: normalized.expiresAt,
    userVisible: normalized.userVisible,
    confirmedByUser: normalized.confirmedByOwner,
  });
}

export const LEGACY_MEMORY_COMPATIBILITY = Object.freeze({
  schema: "awwab-memory-panel-v1",
  contentLimit: LEGACY_CONTENT_LIMIT,
  supportedLegacyTypes: LEGACY_TYPES,
  ambiguousLegacyTypes: Object.freeze(["goal_commitment", "project_context"]),
  requiresExplicitLegacyTypeOnExport: true,
  readOnly: true,
});
