import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CognitiveCoreError,
  COGNITIVE_UNTRUSTED_DATA_NOTICE,
  createIdentityProfile,
  createIdentityRegistry,
  createInMemoryCognitiveStore,
  selectMemoryContext,
} from "../packages/shared/src/cognitive-core.mjs";

const clock = () => "2026-11-01T10:00:00.000Z";
function store(ownerId = "owner-a") {
  let id = 0;
  return createInMemoryCognitiveStore({ ownerId, clock, idFactory: () => `id-${++id}` });
}
const memory = (overrides = {}) => ({
  id: "m1", ownerId: "owner-a", kind: "semantic", content: "Prefers concise project plans",
  source: { kind: "owner_entered", reference: "profile" }, confidence: 1, sensitivity: "normal",
  createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-31T00:00:00.000Z",
  expiresAt: null, userVisible: true, confirmedByOwner: true, status: "active", ...overrides,
});

test("identity profile is versioned, immutable and rejects invalid versions", () => {
  const identity = createIdentityProfile({
    id: "awwab", version: 1, purpose: "Personal assistant under owner control",
    principles: ["Be truthful"], boundaries: ["Never self-approve"], createdAt: clock(),
  });
  assert.equal(identity.schemaVersion, 1);
  assert.equal(identity.version, 1);
  assert.ok(Object.isFrozen(identity));
  assert.throws(() => createIdentityProfile({ id: "awwab", version: 0, purpose: "x", principles: [], boundaries: [], createdAt: clock() }),
    (error) => error instanceof CognitiveCoreError && error.code === "invalid_input");
});

test("identity registry keeps immutable history and only accepts the next version", () => {
  const first = { id: "awwab", version: 1, purpose: "Personal assistant", principles: ["Be truthful"], boundaries: ["No self-approval"], createdAt: clock() };
  const registry = createIdentityRegistry(first);
  const second = registry.addVersion({ ...first, version: 2, purpose: "Personal assistant under owner control", updatedAt: "2026-11-01T11:00:00.000Z" });
  assert.equal(registry.getCurrent().version, 2);
  assert.equal(registry.getVersion(1).purpose, "Personal assistant");
  assert.equal(registry.getVersion(2), second);
  assert.throws(() => registry.addVersion({ ...first, version: 4 }), (error) => error.code === "invalid_identity_version");
  assert.throws(() => registry.addVersion({ ...first, id: "different", version: 3 }), (error) => error.code === "identity_mismatch");
});

test("memory is owner-scoped and cross-owner reads fail as not found", () => {
  const a = store("owner-a"), b = store("owner-b");
  const saved = a.createMemory({ id: "only-a", kind: "semantic", content: "My preferred plan format" });
  assert.equal(saved.ownerId, "owner-a");
  assert.throws(() => b.getMemory(saved.id), (error) => error.code === "not_found");
  assert.throws(() => a.createMemory({ id: "forged", ownerId: "owner-b", kind: "semantic", content: "forged" }),
    (error) => error.code === "owner_mismatch");
});

test("observed and imported memory require a provenance reference", () => {
  assert.throws(() => store().createMemory({ kind: "semantic", content: "An observed fact", source: { kind: "observed_evidence" } }),
    (error) => error.code === "invalid_input" && /provenance reference/.test(error.message));
});

test("memory correction preserves ID and provenance; deletion removes the record", () => {
  const db = store();
  const saved = db.createMemory({ id: "m1", kind: "semantic", content: "Old fact" });
  const corrected = db.correctMemory(saved.id, "Corrected fact");
  assert.equal(corrected.id, saved.id);
  assert.equal(corrected.source.kind, "owner_corrected");
  assert.equal(corrected.source.reference, "m1");
  assert.equal(corrected.confirmedByOwner, true);
  assert.equal(db.deleteMemory(saved.id), true);
  assert.throws(() => db.getMemory(saved.id), (error) => error.code === "not_found");
});

test("context selection excludes hidden, sensitive, unconfirmed, expired and cross-owner records", () => {
  const result = selectMemoryContext({
    ownerId: "owner-a", query: "project plans", now: clock(), memories: [
      memory(),
      memory({ id: "hidden", userVisible: false }),
      memory({ id: "secret", sensitivity: "sensitive" }),
      memory({ id: "unconfirmed", confirmedByOwner: false }),
      memory({ id: "expired", expiresAt: "2026-10-31T00:00:00.000Z" }),
      memory({ id: "other", ownerId: "owner-b" }),
    ],
  });
  assert.deepEqual(result.selected.map((item) => item.id), ["m1"]);
  assert.equal(result.excluded.length, 5);
  assert.match(result.untrustedDataNotice, /not instructions/);
});

test("sensitive memory requires explicit opt-in and working memory must expire", () => {
  const sensitive = memory({ sensitivity: "sensitive" });
  assert.equal(selectMemoryContext({ ownerId: "owner-a", query: "project plans", memories: [sensitive] }).selected.length, 0);
  assert.equal(selectMemoryContext({ ownerId: "owner-a", query: "project plans", memories: [sensitive], includeSensitive: true }).selected.length, 1);
  const working = memory({ kind: "working", expiresAt: null });
  assert.equal(selectMemoryContext({ ownerId: "owner-a", query: "project plans", memories: [working] }).excluded[0].reason, "working_memory_requires_expiry");
});

test("context selection explains relevance and enforces a hard character budget", () => {
  const result = selectMemoryContext({
    ownerId: "owner-a", query: "project plans", maxChars: 13, memories: [
      memory({ id: "long", content: "A very long project planning preference" }),
      memory({ id: "short", content: "Project plans" }),
    ],
  });
  assert.equal(result.selected.length, 1);
  assert.equal(result.selected[0].id, "short");
  assert.equal(result.selected[0].reason, "lexical_overlap");
  assert.equal(result.totalChars, 13);
  assert.ok(result.totalChars <= result.maxChars);
});

test("goal state machine validates progress, terminal states, ownership and hierarchy", () => {
  const db = store();
  const parent = db.createGoal({ id: "parent", title: "Build Awwab", priority: "high", status: "active" });
  const child = db.createGoal({ id: "child", title: "Build memory", parentGoalId: parent.id });
  assert.equal(child.parentGoalId, parent.id);
  assert.throws(() => db.updateGoal(parent.id, { status: "completed" }), (error) => error.code === "invalid_input");
  const done = db.updateGoal(child.id, { status: "completed", progress: 100 });
  assert.equal(done.status, "completed");
  assert.throws(() => db.updateGoal(child.id, { status: "active", progress: 50 }), (error) => error.code === "invalid_transition");
  assert.throws(() => db.createGoal({ id: "bad-child", title: "Bad", parentGoalId: "missing" }), (error) => error.code === "not_found");
});

test("goal hierarchy rejects cycles and immutable owner/source fields", () => {
  const db = store();
  db.createGoal({ id: "a", title: "A" });
  db.createGoal({ id: "b", title: "B", parentGoalId: "a" });
  assert.throws(() => db.updateGoal("a", { parentGoalId: "b" }), (error) => error.code === "goal_cycle");
  assert.throws(() => db.updateGoal("a", { ownerId: "other" }), (error) => error.code === "immutable_field");
});

test("verified experience requires evidence and can link only to an owned goal", () => {
  const db = store();
  db.createGoal({ id: "g1", title: "A goal" });
  assert.throws(() => db.recordExperience({ kind: "verification", summary: "It worked", goalId: "g1", verification: "verified" }),
    (error) => error.code === "invalid_input");
  const record = db.recordExperience({
    kind: "verification", summary: "The goal passed its acceptance test", goalId: "g1",
    taskRef: "task:42", planRef: "plan:42", actionRef: "commit:abc",
    evidenceRefs: ["test-run:123"], verification: "verified", outcome: "success", confidence: 1,
  });
  assert.equal(record.evidenceRefs[0], "test-run:123");
  assert.throws(() => db.recordExperience({ kind: "reflection", summary: "Cross-owner", goalId: "foreign" }),
    (error) => error.code === "not_found");
});

test("context selector rejects overlarge budgets and never treats memory as instructions", () => {
  assert.throws(() => selectMemoryContext({ ownerId: "owner-a", query: "x", memories: [], maxChars: 12001 }), /maxChars/);
  assert.match(COGNITIVE_UNTRUSTED_DATA_NOTICE, /permissions/);
});
