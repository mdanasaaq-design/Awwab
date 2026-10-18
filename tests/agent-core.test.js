const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateAgentPlan, validateAgentPlan } = require("../backend/functions/lib/agent-core.js");

const plan = (overrides = {}) => ({
  schemaVersion: 1,
  objective: "Prepare a short status summary",
  steps: [{
    stepId: "step-1",
    toolId: "notes.read",
    input: { noteId: "note-123" },
    expectedOutcome: "Relevant note text is available",
    verification: "Confirm a note was returned",
  }],
  ...overrides,
});

const readPolicy = {
  id: "notes.read",
  version: 1,
  riskLevel: "low",
  requiresApproval: false,
  idempotent: true,
  validateInput: (input) => typeof input.noteId === "string" && input.noteId.length > 0,
};

test("accepts a bounded, schema-versioned plan", () => {
  assert.equal(validateAgentPlan(plan()).steps.length, 1);
});

test("rejects missing fields and unknown plan schema versions", () => {
  assert.equal(validateAgentPlan({ objective: "x", steps: [] }), null);
  assert.equal(validateAgentPlan(plan({ schemaVersion: 2 })), null);
});

test("rejects duplicate step IDs and more than eight steps", () => {
  const duplicate = plan({ steps: [plan().steps[0], { ...plan().steps[0] }] });
  assert.equal(validateAgentPlan(duplicate), null);
  const tooMany = plan({ steps: Array.from({ length: 9 }, (_, i) => ({
    ...plan().steps[0], stepId: `step-${i}`,
  })) });
  assert.equal(validateAgentPlan(tooMany), null);
});

test("rejects unexpected model-authored fields", () => {
  assert.equal(validateAgentPlan(plan({ permissions: ["admin"] })), null);
  assert.equal(validateAgentPlan(plan({ steps: [{ ...plan().steps[0], riskLevel: "low" }] })), null);
});

test("rejects unknown tools before execution", () => {
  const result = evaluateAgentPlan(plan(), []);
  assert.deepEqual(result, { ok: false, reason: "unknown_tool", stepId: "step-1" });
});

test("rejects tool arguments that fail trusted backend validation", () => {
  const badPlan = plan({ steps: [{ ...plan().steps[0], input: { noteId: "" } }] });
  assert.deepEqual(evaluateAgentPlan(badPlan, [readPolicy]), {
    ok: false, reason: "invalid_tool_input", stepId: "step-1",
  });
});

test("derives risk and approval from trusted policy, not plan content", () => {
  const sensitivePolicy = {
    ...readPolicy, riskLevel: "critical", requiresApproval: false,
  };
  const result = evaluateAgentPlan(plan(), [sensitivePolicy]);
  assert.equal(result.ok, true);
  assert.equal(result.steps[0].riskLevel, "critical");
  assert.equal(result.steps[0].requiresApproval, true);
});

test("rejects duplicate tool IDs in the trusted registry", () => {
  assert.deepEqual(evaluateAgentPlan(plan(), [readPolicy, readPolicy]), {
    ok: false, reason: "duplicate_tool_policy",
  });
});

test("fails closed when a tool argument validator throws", () => {
  const throwingPolicy = { ...readPolicy, validateInput: () => { throw new Error("boom"); } };
  assert.deepEqual(evaluateAgentPlan(plan(), [throwingPolicy]), {
    ok: false, reason: "invalid_tool_input", stepId: "step-1",
  });
});
