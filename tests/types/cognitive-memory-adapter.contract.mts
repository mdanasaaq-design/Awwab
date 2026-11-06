import type { CognitiveMemoryAdapter } from "../../packages/shared/src/cognitive-memory-policy.mjs";
import type { MemoryRecord } from "../../packages/shared/src/cognitive-core.mjs";

declare const record: MemoryRecord;

export const cognitiveMemoryAdapterContractFixture: CognitiveMemoryAdapter = {
  async getMemory({ ownerId, memoryId }) {
    void ownerId;
    void memoryId;
    return null;
  },
  async listMemories({ ownerId, options }) {
    void ownerId;
    void options;
    return [];
  },
  async createMemory({ ownerId, record: input }) {
    if (input.ownerId !== ownerId) throw new Error("owner mismatch");
    return input;
  },
  async updateMemory({ ownerId, memoryId, patch, expectedUpdatedAt }) {
    void ownerId;
    void memoryId;
    void patch;
    void expectedUpdatedAt;
    return record;
  },
  async deleteMemory({ ownerId, memoryId, expectedUpdatedAt }) {
    void ownerId;
    void memoryId;
    void expectedUpdatedAt;
    return true;
  },
  async resolveMemoryConflict({ ownerId, command }) {
    if (command.ownerId !== ownerId) throw new Error("owner mismatch");
  },
};
