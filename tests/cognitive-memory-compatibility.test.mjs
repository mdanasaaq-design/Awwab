import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGACY_MEMORY_COMPATIBILITY,
  mapCognitiveMemoryToLegacy,
  mapLegacyMemoryToCognitive,
} from "../packages/shared/src/cognitive-memory-compatibility.mjs";

const time = "2026-10-31T12:30:00.000Z";
const base = (overrides = {}) => ({
  id: "memory-1",
  content: "Prefers concise technical explanations.",
  type: "explicit_preference",
  sourceKind: "user_explicit",
  sourceRef: "user-interface",
  confidence: 1,
  sensitivity: "normal",
  createdAt: new Date(time),
  updatedAt: { seconds: Date.parse(time) / 1000, nanoseconds: 0, toDate() { return new Date(this.seconds * 1000); } },
  expiresAt: null,
  userVisible: true,
  confirmedByUser: true,
  ...overrides,
});

test("compatibility contract is explicitly read-only and preserves legacy limits", () => {
  assert.equal(LEGACY_MEMORY_COMPATIBILITY.readOnly, true);
  assert.equal(LEGACY_MEMORY_COMPATIBILITY.contentLimit, 2000);
  assert.deepEqual(LEGACY_MEMORY_COMPATIBILITY.ambiguousLegacyTypes, ["goal_commitment", "project_context"]);
});

test("unambiguous legacy semantic types map without losing provenance or confirmation", () => {
  for (const type of ["explicit_preference", "stable_profile_fact", "learned_preference"]) {
    const result = mapLegacyMemoryToCognitive(base({ type }), { ownerId: "owner-a" });
    assert.equal(result.ok, true);
    assert.equal(result.record.kind, "semantic");
    assert.equal(result.record.ownerId, "owner-a");
    assert.equal(result.record.source.kind, "owner_entered");
    assert.equal(result.record.source.reference, "user-interface");
    assert.equal(result.record.confirmedByOwner, true);
    assert.equal(result.legacyType, type);
  }
});

test("temporary context maps only when it has an explicit expiry", () => {
  const expiry = new Date("2026-11-30T12:30:00.000Z");
  const result = mapLegacyMemoryToCognitive(base({ type: "temporary_context", expiresAt: expiry }), { ownerId: "owner-a" });
  assert.equal(result.ok, true);
  assert.equal(result.record.kind, "working");
  assert.equal(result.record.expiresAt, expiry.toISOString());
  assert.equal(mapLegacyMemoryToCognitive(base({ type: "temporary_context" }), { ownerId: "owner-a" }).reason, "working_memory_requires_expiry");
});

test("goal commitments and project context are rejected rather than guessed", () => {
  for (const type of ["goal_commitment", "project_context"]) {
    const result = mapLegacyMemoryToCognitive(base({ type }), { ownerId: "owner-a" });
    assert.deepEqual(result, { ok: false, reason: "ambiguous_type", legacyType: type });
  }
});

test("invalid owner, malformed fields, and records over the legacy limit are rejected", () => {
  assert.equal(mapLegacyMemoryToCognitive(base(), {}).reason, "owner_required");
  assert.equal(mapLegacyMemoryToCognitive(base({ sensitivity: "secret" }), { ownerId: "owner-a" }).reason, "invalid_record");
  assert.equal(mapLegacyMemoryToCognitive(base({ content: "x".repeat(2001) }), { ownerId: "owner-a" }).reason, "invalid_record");
  assert.equal(mapLegacyMemoryToCognitive(base({ createdAt: null }), { ownerId: "owner-a" }).reason, "invalid_record");
});

test("owner-corrected provenance and sensitive confirmation survive a round trip", () => {
  const legacy = base({
    sourceKind: "user_corrected",
    sourceRef: "user-correction",
    sensitivity: "sensitive",
    confirmedByUser: true,
  });
  const mapped = mapLegacyMemoryToCognitive(legacy, { ownerId: "owner-a" });
  assert.equal(mapped.ok, true);
  const exported = mapCognitiveMemoryToLegacy(mapped.record, { legacyType: mapped.legacyType });
  assert.deepEqual(exported, {
    content: legacy.content,
    type: legacy.type,
    sourceKind: "user_corrected",
    sourceRef: "user-correction",
    confidence: 1,
    sensitivity: "sensitive",
    createdAt: time,
    updatedAt: time,
    expiresAt: null,
    userVisible: true,
    confirmedByUser: true,
  });
});

test("export requires explicit legacy type and refuses unsupported core states", () => {
  const mapped = mapLegacyMemoryToCognitive(base(), { ownerId: "owner-a" });
  assert.equal(mapped.ok, true);
  assert.throws(() => mapCognitiveMemoryToLegacy(mapped.record), /explicit compatible legacyType/);
  assert.throws(() => mapCognitiveMemoryToLegacy({ ...mapped.record, status: "archived" }, { legacyType: "explicit_preference" }), /Archived/);
  assert.throws(() => mapCognitiveMemoryToLegacy({ ...mapped.record, source: { kind: "reviewed_import", reference: "import-1" } }, { legacyType: "explicit_preference" }), /owner-entered/);
  assert.throws(() => mapCognitiveMemoryToLegacy({ ...mapped.record, content: "x".repeat(2001) }, { legacyType: "explicit_preference" }), /2000/);
});

test("round-trip preserves every representable legacy type and its exact discriminator", () => {
  const cases = [
    base({ type: "explicit_preference" }),
    base({ type: "stable_profile_fact" }),
    base({ type: "learned_preference" }),
    base({ type: "temporary_context", expiresAt: new Date("2026-11-30T12:30:00.000Z") }),
  ];
  for (const legacy of cases) {
    const mapped = mapLegacyMemoryToCognitive(legacy, { ownerId: "owner-a" });
    assert.equal(mapped.ok, true);
    const exported = mapCognitiveMemoryToLegacy(mapped.record, { legacyType: mapped.legacyType });
    assert.equal(exported.type, legacy.type);
    assert.equal(exported.content, legacy.content);
    assert.equal(exported.sourceKind, legacy.sourceKind);
    assert.equal(exported.sourceRef, legacy.sourceRef);
    assert.equal(exported.expiresAt, legacy.expiresAt === null ? null : legacy.expiresAt.toISOString());
  }
});
