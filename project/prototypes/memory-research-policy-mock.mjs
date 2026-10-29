/**
 * Local-only Phase 4 policy model.
 *
 * This module is deliberately in-memory and dependency-free. It is not imported
 * by Awwab's web app or backend and must never be treated as a persistence,
 * authorization, or production retrieval implementation.
 */

const MEMORY_TYPES = new Set([
  "explicit_preference",
  "stable_profile_fact",
  "goal_commitment",
  "project_context",
  "learned_preference",
  "temporary_context",
  "derived_inference",
]);
const SOURCE_KINDS = new Set([
  "user_explicit",
  "user_corrected",
  "assistant_inference",
  "document",
  "tool",
]);
const SENSITIVITY = new Set(["low", "normal", "sensitive"]);
const MAX_CONTENT = 2000;
const MAX_SOURCE_REF = 256;
const MAX_OWNER_ID = 128;
const MAX_TTL_SECONDS = 10 * 365 * 24 * 60 * 60;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function boundedString(value, max, code) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    fail(code);
  }
  return value.trim();
}

function validNow(now) {
  if (!Number.isSafeInteger(now) || now < 0) fail("invalid-clock");
}

export function createMemory(input, options = {}) {
  const now = options.now ?? Math.floor(Date.now() / 1000);
  validNow(now);
  if (!input || typeof input !== "object" || Array.isArray(input)) fail("invalid-memory");
  const ownerId = boundedString(input.ownerId, MAX_OWNER_ID, "invalid-owner");
  const content = boundedString(input.content, MAX_CONTENT, "invalid-content");
  if (!MEMORY_TYPES.has(input.type)) fail("invalid-memory-type");
  if (!SOURCE_KINDS.has(input.sourceKind)) fail("invalid-source-kind");
  if (!SENSITIVITY.has(input.sensitivity)) fail("invalid-sensitivity");
  if (typeof input.confidence !== "number" || !Number.isFinite(input.confidence)
    || input.confidence < 0 || input.confidence > 1) fail("invalid-confidence");
  if (typeof input.confirmedByUser !== "boolean") fail("invalid-confirmation");
  if (typeof input.userVisible !== "boolean") fail("invalid-visibility");

  let sourceRef = null;
  if (input.sourceRef !== undefined && input.sourceRef !== null) {
    sourceRef = boundedString(input.sourceRef, MAX_SOURCE_REF, "invalid-source-reference");
  }
  if (["document", "tool"].includes(input.sourceKind) && !sourceRef) {
    fail("source-reference-required");
  }

  const expiresAt = input.expiresAt ?? null;
  if (expiresAt !== null) {
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= now
      || expiresAt > now + MAX_TTL_SECONDS) fail("invalid-expiry");
  }

  // Sensitive durable facts must be explicitly supplied/corrected and confirmed.
  if (input.sensitivity === "sensitive"
    && !(["user_explicit", "user_corrected"].includes(input.sourceKind) && input.confirmedByUser)) {
    fail("sensitive-memory-needs-explicit-confirmation");
  }
  // Model confidence is not evidence: inferences are always capped and non-sensitive.
  if (input.sourceKind === "assistant_inference"
    && (input.sensitivity === "sensitive" || input.confidence > 0.6)) {
    fail("inference-policy-violation");
  }
  if (input.type === "derived_inference" && input.sourceKind !== "assistant_inference") {
    fail("inference-provenance-mismatch");
  }

  return Object.freeze({
    ownerId, content, type: input.type, sourceKind: input.sourceKind, sourceRef,
    confidence: input.confidence, sensitivity: input.sensitivity,
    createdAt: now, updatedAt: now, expiresAt,
    userVisible: input.userVisible, confirmedByUser: input.confirmedByUser,
  });
}

export function retrieveMemories({ ownerId, memories, now, maxItems = 5, maxChars = 3000,
  includeSensitive = false, types = null }) {
  validNow(now);
  boundedString(ownerId, MAX_OWNER_ID, "invalid-owner");
  if (!Array.isArray(memories)) fail("invalid-memory-store");
  if (!Number.isSafeInteger(maxItems) || maxItems < 1 || maxItems > 10) fail("invalid-item-budget");
  if (!Number.isSafeInteger(maxChars) || maxChars < 1 || maxChars > 6000) fail("invalid-character-budget");
  if (typeof includeSensitive !== "boolean") fail("invalid-sensitive-option");
  if (types !== null && (!Array.isArray(types) || types.some((type) => !MEMORY_TYPES.has(type)))) {
    fail("invalid-type-filter");
  }

  const result = [];
  let used = 0;
  for (const memory of memories) {
    if (!memory || memory.ownerId !== ownerId || !memory.userVisible) continue;
    if (memory.expiresAt !== null && memory.expiresAt <= now) continue;
    if (memory.sensitivity === "sensitive" && !(includeSensitive && memory.confirmedByUser)) continue;
    if (types && !types.includes(memory.type)) continue;
    if (result.length >= maxItems) break;
    const remaining = maxChars - used;
    if (remaining <= 0) break;
    const content = memory.content.slice(0, remaining);
    if (!content) break;
    result.push(Object.freeze({
      content,
      type: memory.type,
      sourceKind: memory.sourceKind,
      sourceRef: memory.sourceRef,
      confidence: memory.confidence,
      sensitivity: memory.sensitivity,
      trustBoundary: "UNTRUSTED_MEMORY_DATA",
    }));
    used += content.length;
  }
  return result;
}

export function correctMemory({ ownerId, memory, content, now }) {
  validNow(now);
  boundedString(ownerId, MAX_OWNER_ID, "invalid-owner");
  if (!memory || memory.ownerId !== ownerId) fail("memory-not-found");
  return createMemory({
    ownerId,
    content,
    type: memory.type,
    sourceKind: "user_corrected",
    sourceRef: memory.sourceRef ?? "user-correction",
    confidence: 1,
    sensitivity: memory.sensitivity,
    expiresAt: memory.expiresAt,
    userVisible: memory.userVisible,
    confirmedByUser: true,
  }, { now });
}

export function deleteMemory({ ownerId, memoryId, records }) {
  boundedString(ownerId, MAX_OWNER_ID, "invalid-owner");
  boundedString(memoryId, 256, "invalid-memory-id");
  if (!Array.isArray(records)) fail("invalid-memory-store");
  const target = records.find((record) => record.id === memoryId && record.ownerId === ownerId);
  if (!target) fail("memory-not-found");
  return records.filter((record) => !(record.id === memoryId && record.ownerId === ownerId));
}

export function prepareResearchContext(sources) {
  if (!Array.isArray(sources) || sources.length > 20) fail("invalid-source-list");
  const seen = new Set();
  return sources.map((source) => {
    if (!source || typeof source !== "object") fail("invalid-source");
    const id = boundedString(source.id, 128, "invalid-source-id");
    if (seen.has(id)) fail("duplicate-source-id");
    seen.add(id);
    const title = boundedString(source.title, 300, "invalid-source-title");
    const uri = boundedString(source.uri, 2048, "invalid-source-uri");
    const content = boundedString(source.content, 8000, "invalid-source-content");
    return Object.freeze({
      id, title, uri, content,
      trustBoundary: "UNTRUSTED_RETRIEVED_CONTENT",
      mayAuthorizeActions: false,
    });
  });
}

export function mapClaimsToEvidence(claims, sources) {
  if (!Array.isArray(claims) || claims.length > 50) fail("invalid-claims");
  if (!Array.isArray(sources)) fail("invalid-source-list");
  const known = new Set(sources.map((source) => source.id));
  return claims.map((claim) => {
    if (!claim || typeof claim !== "object") fail("invalid-claim");
    const text = boundedString(claim.text, 2000, "invalid-claim-text");
    if (!Array.isArray(claim.sourceIds)) fail("invalid-claim-sources");
    const sourceIds = [...new Set(claim.sourceIds)];
    if (sourceIds.some((id) => typeof id !== "string" || !known.has(id))) {
      fail("unknown-evidence-source");
    }
    return Object.freeze({
      text,
      sourceIds,
      evidenceStatus: sourceIds.length ? "source-linked-not-verified" : "uncertain-no-source",
    });
  });
}
