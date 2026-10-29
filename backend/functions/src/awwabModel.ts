/**
 * Awwab-owned model boundary.
 *
 * This interface is deliberately not an adapter for a third-party model.
 * The current implementation reports that Awwab's from-scratch model has
 * not been trained and fails closed. It performs no network requests.
 */
export interface AwwabModelStatus {
  modelId: "awwab-from-scratch";
  state: "not_trained" | "ready";
  trained: boolean;
  inferenceLocation: "local" | "none";
  remoteFallback: false;
  message: string;
}

export interface AwwabModelRequest {
  requestId: string;
  conversationId: string;
  text: string;
  includeMemoryContext: boolean;
}

export interface AwwabModelPlan {
  summary: string;
  steps: Array<{ id: string; description: string }>;
}

export class AwwabModelUnavailableError extends Error {
  constructor(message = "Awwab's own model has not been trained yet. Assistant generation is unavailable; no other AI model will be used as a fallback.") {
    super(message);
    this.name = "AwwabModelUnavailableError";
  }
}

export interface AwwabModelRuntime {
  getStatus(): AwwabModelStatus;
  generatePlan(request: AwwabModelRequest): Promise<AwwabModelPlan>;
}

const notTrainedStatus: AwwabModelStatus = Object.freeze({
  modelId: "awwab-from-scratch",
  state: "not_trained",
  trained: false,
  inferenceLocation: "none",
  remoteFallback: false,
  message: "Awwab's own model has not been trained yet.",
});

/** Default runtime until Awwab's own trained checkpoint and inference exist. */
export const awwabModelRuntime: AwwabModelRuntime = Object.freeze({
  getStatus: () => notTrainedStatus,
  async generatePlan(_request: AwwabModelRequest): Promise<AwwabModelPlan> {
    throw new AwwabModelUnavailableError();
  },
});
