import type { MemoryRecord } from "./cognitive-core.mjs";

export interface MemoryConflictResolution {
  readonly ownerId: string;
  readonly winner: Readonly<{ id: string; expectedUpdatedAt: string }>;
  readonly archive: readonly Readonly<{ id: string; expectedUpdatedAt: string }>[];
  readonly reason: string;
  readonly resolvedAt: string;
  readonly atomicity: "all_or_nothing";
  readonly policy: "owner_selected_winner";
}
export interface CognitiveMemoryAdapter {
  getMemory(ownerId: string, memoryId: string): Promise<MemoryRecord | null>;
  listMemories(ownerId: string, options?: object): Promise<MemoryRecord[]>;
  createMemory(ownerId: string, record: MemoryRecord): Promise<MemoryRecord>;
  updateMemory(ownerId: string, memoryId: string, patch: Partial<MemoryRecord>, expectedUpdatedAt: string): Promise<MemoryRecord>;
  deleteMemory(ownerId: string, memoryId: string, expectedUpdatedAt: string): Promise<boolean>;
  resolveMemoryConflict(ownerId: string, command: MemoryConflictResolution): Promise<void>;
}
export const COGNITIVE_MEMORY_ADAPTER_METHODS: readonly string[];
export function assertCognitiveMemoryAdapter<T extends CognitiveMemoryAdapter>(adapter: T): T;
export function createMemoryConflictResolution(input: {
  ownerId: string; winner: MemoryRecord; losers: MemoryRecord[]; reason: string; resolvedAt: string;
}): MemoryConflictResolution;
export function evaluateMemoryRetention(record: Pick<MemoryRecord, "status" | "expiresAt">, options?: { now?: string }): {
  readonly state: "retained" | "expired" | "archived";
  readonly excludeFromContext: boolean;
  readonly hardDelete: false;
};
