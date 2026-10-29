import assert from "node:assert/strict";
import { test } from "node:test";
import { createOpenAICompatibleProvider } from "../backend/functions/lib/assistantProvider.js";

test("provider adapter refuses missing configuration", () => {
  assert.throws(() => createOpenAICompatibleProvider({ apiKey: "", baseUrl: "", model: "" }), /not configured/i);
});

test("provider adapter refuses non-HTTPS endpoints", () => {
  assert.throws(() => createOpenAICompatibleProvider({
    apiKey: "test-key", baseUrl: "http://127.0.0.1:8080/v1", model: "test-model",
  }), /HTTPS/i);
});

test("provider adapter parses a JSON plan from a compatible response", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://example.test/v1/chat/completions");
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-key");
    const request = JSON.parse(String(init?.body));
    assert.equal(request.model, "test-model");
    assert.equal(request.max_tokens, 1024);
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
      summary: "Test plan", steps: [{ id: "step-1", description: "Review the request." }],
    }) } }] }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  const provider = createOpenAICompatibleProvider({ apiKey: "test-key", baseUrl: "https://example.test/v1", model: "test-model" });
  const result = await provider.generate({
    requestId: "request_1234", conversationId: "conversation_1234", userText: "Plan something",
    safety: { mode: "plan_only", memoryIsUntrusted: true, toolsEnabled: false, externalSideEffectsEnabled: false },
  }, {});
  assert.deepEqual(result, { summary: "Test plan", steps: [{ id: "step-1", description: "Review the request." }] });
});
