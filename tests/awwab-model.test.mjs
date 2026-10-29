import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AwwabModelUnavailableError,
  awwabModelRuntime,
} from "../backend/functions/lib/awwabModel.js";

test("default Awwab model status is honestly untrained with no remote fallback", () => {
  assert.deepEqual(awwabModelRuntime.getStatus(), {
    modelId: "awwab-from-scratch",
    state: "not_trained",
    trained: false,
    inferenceLocation: "none",
    remoteFallback: false,
    message: "Awwab's own model has not been trained yet.",
  });
});

test("missing Awwab model fails closed instead of generating a pretend plan", async () => {
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls += 1;
    throw new Error("Network must never be used by Awwab's untrained model.");
  };
  try {
    await assert.rejects(
      awwabModelRuntime.generatePlan({
        requestId: "request_123456",
        conversationId: "conversation_123",
        text: "Help me plan something.",
        includeMemoryContext: false,
      }),
      (error) => error instanceof AwwabModelUnavailableError &&
        /has not been trained yet/i.test(error.message) &&
        /no other AI model/i.test(error.message),
    );
    assert.equal(networkCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
