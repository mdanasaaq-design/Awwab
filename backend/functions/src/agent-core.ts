/**
 * Awwab-owned, provider-neutral plan validation and policy preflight.
 *
 * This module deliberately does not call a model, access user data, or execute tools.
 * All tool policy is supplied by trusted backend code; a model-authored plan cannot
 * define or weaken its own permissions.
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AgentPlanStep {
  stepId: string;
  toolId: string;
  input: Record<string, unknown>;
  expectedOutcome: string;
  verification: string;
}

export interface AgentPlan {
  schemaVersion: 1;
  objective: string;
  steps: AgentPlanStep[];
}

export interface ToolPolicy {
  id: string;
  version: number;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  idempotent: boolean;
  validateInput: (input: unknown) => boolean;
}

export interface PlannedStepDecision {
  stepId: string;
  toolId: string;
  toolVersion: number;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  idempotent: boolean;
}

export type PlanFailureReason =
  | "invalid_plan"
  | "duplicate_tool_policy"
  | "unknown_tool"
  | "invalid_tool_input";

export type PlanEvaluation =
  | { ok: true; plan: AgentPlan; steps: PlannedStepDecision[] }
  | { ok: false; reason: PlanFailureReason; stepId?: string };

const MAX_PLAN_BYTES = 64 * 1024;
const MAX_STEPS = 8;
const MAX_INPUT_BYTES = 16 * 1024;
const RISK_LEVELS = new Set<RiskLevel>(["low", "medium", "high", "critical"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  return actual.length === allowed.length && actual.every((key, index) => key === allowed[index]);
}

function jsonByteLength(value: unknown): number | null {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === "string" ? Buffer.byteLength(serialized, "utf8") : null;
  } catch {
    return null;
  }
}

function boundedText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

/** Validate untrusted model output before any policy lookup or downstream action. */
export function validateAgentPlan(input: unknown): AgentPlan | null {
  if (!isRecord(input) || !hasExactKeys(input, ["schemaVersion", "objective", "steps"])) return null;
  if (input.schemaVersion !== 1 || !boundedText(input.objective, 1000)) return null;
  if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > MAX_STEPS) return null;
  if ((jsonByteLength(input) ?? MAX_PLAN_BYTES + 1) > MAX_PLAN_BYTES) return null;

  const seenStepIds = new Set<string>();
  const steps: AgentPlanStep[] = [];

  for (const rawStep of input.steps) {
    if (!isRecord(rawStep) || !hasExactKeys(rawStep, [
      "stepId", "toolId", "input", "expectedOutcome", "verification",
    ])) return null;

    if (!boundedText(rawStep.stepId, 64) || !/^[A-Za-z0-9_-]+$/.test(rawStep.stepId)) return null;
    if (seenStepIds.has(rawStep.stepId)) return null;
    seenStepIds.add(rawStep.stepId);

    if (!boundedText(rawStep.toolId, 64) || !/^[a-z][a-z0-9.-]*$/.test(rawStep.toolId)) return null;
    if (!isRecord(rawStep.input) || (jsonByteLength(rawStep.input) ?? MAX_INPUT_BYTES + 1) > MAX_INPUT_BYTES) return null;
    if (!boundedText(rawStep.expectedOutcome, 500)) return null;
    if (!boundedText(rawStep.verification, 500)) return null;

    steps.push({
      stepId: rawStep.stepId,
      toolId: rawStep.toolId,
      input: rawStep.input,
      expectedOutcome: rawStep.expectedOutcome,
      verification: rawStep.verification,
    });
  }

  return { schemaVersion: 1, objective: input.objective, steps };
}

/**
 * Resolve each planned tool against a trusted allowlist.
 * Risk and approval are derived from backend policy, never from model output.
 */
export function evaluateAgentPlan(input: unknown, toolPolicies: readonly ToolPolicy[]): PlanEvaluation {
  const plan = validateAgentPlan(input);
  if (!plan) return { ok: false, reason: "invalid_plan" };

  const policyById = new Map<string, ToolPolicy>();
  for (const policy of toolPolicies) {
    if (
      !boundedText(policy.id, 64) ||
      !/^[a-z][a-z0-9.-]*$/.test(policy.id) ||
      !Number.isInteger(policy.version) ||
      policy.version < 1 ||
      !RISK_LEVELS.has(policy.riskLevel) ||
      typeof policy.requiresApproval !== "boolean" ||
      typeof policy.idempotent !== "boolean" ||
      typeof policy.validateInput !== "function" ||
      policyById.has(policy.id)
    ) {
      return { ok: false, reason: "duplicate_tool_policy" };
    }
    policyById.set(policy.id, policy);
  }

  const decisions: PlannedStepDecision[] = [];
  for (const step of plan.steps) {
    const policy = policyById.get(step.toolId);
    if (!policy) return { ok: false, reason: "unknown_tool", stepId: step.stepId };

    let inputIsValid = false;
    try {
      inputIsValid = policy.validateInput(step.input) === true;
    } catch {
      inputIsValid = false;
    }
    if (!inputIsValid) return { ok: false, reason: "invalid_tool_input", stepId: step.stepId };

    decisions.push({
      stepId: step.stepId,
      toolId: policy.id,
      toolVersion: policy.version,
      riskLevel: policy.riskLevel,
      requiresApproval: policy.requiresApproval || policy.riskLevel === "high" || policy.riskLevel === "critical",
      idempotent: policy.idempotent,
    });
  }

  return { ok: true, plan, steps: decisions };
}
