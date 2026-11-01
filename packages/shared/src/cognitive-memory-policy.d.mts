import type { MemoryKind, MemoryRecord } from "./cognitive-core.mjs";

export interface MemoryConflictResolution {
  readonly ownerId: string;
  readonly winner: Readonly<{ id: string; expectedUpdatedAt: string }>;
  readonly archive: readonly Readonly<{ id: string; expectedUpdatedAt: string }>[];
  readonly reason: string;
  readonly resolvedAt: string;
  readonly atomicity: "all_or_nothing";
  readonly policy: "owner_selected_winner";
}

export interface MemoryAdapterListOptions {
  readonly kind?: MemoryKind;
  readonly status?: "active" | "archived";
  readonly limit?: number;
}

export interface CognitiveMemoryAdapter {
  /** ownerId must come from trusted authenticated server context. */
  getMemory(input: { ownerId: string; memoryId: string }): Promise<MemoryRecord | null>;
  listMemories(input: { ownerId: string; options?: MemoryAdapterListOptions }): Promise<MemoryRecord[]>;
  createMemory(input: { ownerId: string; record: MemoryRecord }): Promise<MemoryRecord>;
  updateMemory(input: {
    ownerId: string;
    memoryId: string;
    patch: Partial<Omit<MemoryRecord, "id" | "ownerId" | "createdAt" | "updatedAt">>;
    expectedUpdatedAt: string;
  }): Promise<MemoryRecord>;
  deleteMemory(input: { ownerId: string; memoryId: string; expectedUpdatedAt: string }): Promise<true>;
  resolveMemoryConflict(input: { ownerId: string; command: MemoryConflictResolution }): Promise<void>;
}

export const COGNITIVE_MEMORY_ADAPTER_CONTRACT_VERSION: 1;
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
