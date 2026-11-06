/**
 * Awwab-owned provider-neutral Assistant Core boundary.
 *
 * This module deliberately contains no model SDK, network client, tool executor,
 * or persistence. Production callers must inject a server-side provider and a
 * trusted memory loader. The mock provider is for tests only.
 */

export type AssistantRuntimeErrorCode =
  | "invalid_request"
  | "cancelled"
  | "context_unavailable"
  | "provider_unavailable"
  | "provider_failure"
  | "invalid_provider_response";

export class AssistantRuntimeError extends Error {
  readonly code: AssistantRuntimeErrorCode;

  constructor(code: AssistantRuntimeErrorCode, message: string) {
    super(message);
    this.name = "AssistantRuntimeError";
    this.code = code;
  }
}

export interface AssistantMemoryRecord {
  id: string;
  type: string;
  content: string;
  sourceKind: "user_explicit" | "user_corrected";
  updatedAt: string | null;
}

export interface AssistantMemoryContext {
  ok: true;
  scope: "conversation_context";
  trustedDeviceId: string;
  maxRecords: number;
  maxChars: number;
  untrustedDataNotice: string;
  memories: AssistantMemoryRecord[];
  totalChars: number;
}

export interface AssistantRuntimeRequest {
  requestId: string;
  conversationId: string;
  text: string;
  /** Memory is never loaded unless the user explicitly opts in for this request. */
  includeMemoryContext: boolean;
}

export interface AssistantProviderRequest {
  requestId: string;
  conversationId: string;
  userText: string;
  memoryContext?: Pick<AssistantMemoryContext, "memories" | "untrustedDataNotice">;
  safety: {
    mode: "plan_only";
    memoryIsUntrusted: true;
    toolsEnabled: false;
    externalSideEffectsEnabled: false;
  };
}

export interface AssistantPlanStep {
  id: string;
  description: string;
}

export interface AssistantProviderResponse {
  summary: string;
  steps: AssistantPlanStep[];
}

export interface AssistantRuntimeResponse {
  ok: true;
  status: "planned";
  providerId: string;
  requestId: string;
  conversationId: string;
  summary: string;
  steps: AssistantPlanStep[];
  executed: false;
  requiresHumanReview: true;
}

export interface AssistantProvider {
  readonly id: string;
  generate(
    request: AssistantProviderRequest,
    options: { signal?: AbortSignal },
  ): Promise<unknown>;
}

export type AssistantMemoryContextLoader = (
  options: { signal?: AbortSignal },
) => Promise<AssistantMemoryContext>;

export interface AssistantRuntimeDependencies {
  provider: AssistantProvider | null;
  loadMemoryContext?: AssistantMemoryContextLoader;
}

const MAX_REQUEST_CHARS = 4000;
const MAX_SUMMARY_CHARS = 4000;
const MAX_STEPS = 8;
const MAX_STEP_CHARS = 500;

function throwIfCancelled(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new AssistantRuntimeError("cancelled", "The assistant request was cancelled.");
  }
}

function validateRequest(value: AssistantRuntimeRequest): AssistantRuntimeRequest {
  if (
    !value ||
    typeof value.requestId !== "string" ||
    !/^[A-Za-z0-9_-]{8,128}$/.test(value.requestId) ||
    typeof value.conversationId !== "string" ||
    !/^[A-Za-z0-9_-]{8,128}$/.test(value.conversationId) ||
    typeof value.text !== "string" ||
    value.text.trim().length === 0 ||
    value.text.length > MAX_REQUEST_CHARS ||
    typeof value.includeMemoryContext !== "boolean"
  ) {
    throw new AssistantRuntimeError("invalid_request", "The assistant request is invalid or exceeds its limits.");
  }
  return { ...value, text: value.text.trim() };
}

function validateMemoryContext(context: AssistantMemoryContext): AssistantMemoryContext {
  if (
    !context ||
    context.ok !== true ||
    context.scope !== "conversation_context" ||
    typeof context.untrustedDataNotice !== "string" ||
    !Array.isArray(context.memories) ||
    context.memories.length > 50 ||
    typeof context.maxChars !== "number" ||
    context.maxChars < 0 ||
    typeof context.totalChars !== "number" ||
    context.totalChars < 0 ||
    context.totalChars > 6000
  ) {
    throw new AssistantRuntimeError("context_unavailable", "Eligible assistant context could not be validated.");
  }

  const memories = context.memories.filter((memory) =>
    memory &&
    typeof memory.id === "string" &&
    typeof memory.content === "string" &&
    memory.content.trim().length > 0 &&
    memory.content.length <= 6000 &&
    (memory.sourceKind === "user_explicit" || memory.sourceKind === "user_corrected"),
  );
  const totalChars = memories.reduce((sum, memory) => sum + memory.content.length, 0);
  if (totalChars > 6000) {
    throw new AssistantRuntimeError("context_unavailable", "Eligible assistant context exceeded the runtime limit.");
  }
  return { ...context, memories, totalChars };
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}

function validateProviderResponse(value: unknown): AssistantProviderResponse {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !hasExactKeys(value as Record<string, unknown>, ["summary", "steps"]) ||
    typeof (value as AssistantProviderResponse).summary !== "string" ||
    !(value as AssistantProviderResponse).summary.trim() ||
    (value as AssistantProviderResponse).summary.length > MAX_SUMMARY_CHARS ||
    !Array.isArray((value as AssistantProviderResponse).steps) ||
    (value as AssistantProviderResponse).steps.length > MAX_STEPS
  ) {
    throw new AssistantRuntimeError("invalid_provider_response", "The provider returned an invalid plan.");
  }

  const seenIds = new Set<string>();
  const steps = (value as AssistantProviderResponse).steps.map((step) => {
    if (
      !step ||
      typeof step !== "object" ||
      Array.isArray(step) ||
      !hasExactKeys(step as unknown as Record<string, unknown>, ["id", "description"]) ||
      typeof step.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(step.id) ||
      seenIds.has(step.id) ||
      typeof step.description !== "string" ||
      !step.description.trim() ||
      step.description.length > MAX_STEP_CHARS
    ) {
      throw new AssistantRuntimeError("invalid_provider_response", "The provider returned an invalid plan step.");
    }
    seenIds.add(step.id);
    return { id: step.id, description: step.description.trim() };
  });

  return {
    summary: (value as AssistantProviderResponse).summary.trim(),
    steps,
  };
}

/**
 * Execute the non-side-effecting orchestration boundary. Identity, device trust,
 * and authorization must be verified by the callable before this function runs.
 */
export async function runAssistantRequest(
  rawRequest: AssistantRuntimeRequest,
  dependencies: AssistantRuntimeDependencies,
  options: { signal?: AbortSignal } = {},
): Promise<AssistantRuntimeResponse> {
  throwIfCancelled(options.signal);
  const request = validateRequest(rawRequest);

  if (!dependencies.provider) {
    throw new AssistantRuntimeError("provider_unavailable", "No assistant model provider is configured.");
  }

  let memoryContext: AssistantMemoryContext | undefined;
  if (request.includeMemoryContext) {
    if (!dependencies.loadMemoryContext) {
      throw new AssistantRuntimeError("context_unavailable", "Memory context was requested but no trusted loader is configured.");
    }
    try {
      memoryContext = validateMemoryContext(await dependencies.loadMemoryContext({ signal: options.signal }));
    } catch (error) {
      if (error instanceof AssistantRuntimeError) throw error;
      if (options.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
        throw new AssistantRuntimeError("cancelled", "The assistant request was cancelled.");
      }
      throw new AssistantRuntimeError("context_unavailable", "Eligible assistant context could not be loaded.");
    }
  }

  throwIfCancelled(options.signal);
  let rawResponse: unknown;
  try {
    rawResponse = await dependencies.provider.generate({
      requestId: request.requestId,
      conversationId: request.conversationId,
      userText: request.text,
      ...(memoryContext ? {
        memoryContext: {
          memories: memoryContext.memories,
          untrustedDataNotice: memoryContext.untrustedDataNotice,
        },
      } : {}),
      safety: {
        mode: "plan_only",
        memoryIsUntrusted: true,
        toolsEnabled: false,
        externalSideEffectsEnabled: false,
      },
    }, { signal: options.signal });
  } catch (error) {
    if (options.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new AssistantRuntimeError("cancelled", "The assistant request was cancelled.");
    }
    throw new AssistantRuntimeError("provider_failure", "The assistant provider could not complete the request.");
  }

  throwIfCancelled(options.signal);
  const response = validateProviderResponse(rawResponse);
  return {
    ok: true,
    status: "planned",
    providerId: dependencies.provider.id,
    requestId: request.requestId,
    conversationId: request.conversationId,
    summary: response.summary,
    steps: response.steps,
    executed: false,
    requiresHumanReview: true,
  };
}

/** Deterministic test double. It performs no inference, network calls, or actions. */
export const mockAssistantProvider: AssistantProvider = {
  id: "mock-test-only",
  async generate(request, options) {
    throwIfCancelled(options.signal);
    return {
      summary: "Mock provider contract check only; no model reasoning was performed.",
      steps: [{
        id: "review",
        description: `Review the request contract for conversation ${request.conversationId}; no tools or side effects are available.`,
      }],
    } satisfies AssistantProviderResponse;
  },
};
