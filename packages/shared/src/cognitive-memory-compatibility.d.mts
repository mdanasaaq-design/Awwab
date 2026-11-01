import type { MemoryKind, MemoryRecord } from "./cognitive-core.mjs";

export type LegacyMemoryType =
  | "explicit_preference"
  | "stable_profile_fact"
  | "goal_commitment"
  | "project_context"
  | "learned_preference"
  | "temporary_context";
export interface LegacyMemoryDocument {
  id: string;
  content: string;
  type: LegacyMemoryType;
  sourceKind: "user_explicit" | "user_corrected";
  sourceRef: string | null;
  confidence: number;
  sensitivity: "low" | "normal" | "sensitive";
  createdAt: Date | string | number | { toDate(): Date } | { seconds: number; nanoseconds?: number };
  updatedAt: Date | string | number | { toDate(): Date } | { seconds: number; nanoseconds?: number };
  expiresAt: null | Date | string | number | { toDate(): Date } | { seconds: number; nanoseconds?: number };
  userVisible: boolean;
  confirmedByUser: boolean;
}
export type LegacyMemoryMapping =
  | Readonly<{ ok: true; record: MemoryRecord; legacyType: LegacyMemoryType }>
  | Readonly<{ ok: false; reason: "owner_required" | "ambiguous_type" | "working_memory_requires_expiry" | "invalid_record"; legacyType?: LegacyMemoryType; message?: string }>;
export const LEGACY_MEMORY_COMPATIBILITY: Readonly<{
  schema: "awwab-memory-panel-v1";
  contentLimit: 2000;
  supportedLegacyTypes: readonly LegacyMemoryType[];
  ambiguousLegacyTypes: readonly ["goal_commitment", "project_context"];
  requiresExplicitLegacyTypeOnExport: true;
  readOnly: true;
}>;
export function mapLegacyMemoryToCognitive(input: LegacyMemoryDocument, options: { ownerId?: string }): LegacyMemoryMapping;
export function mapCognitiveMemoryToLegacy(record: MemoryRecord, options: { legacyType: LegacyMemoryType }): Omit<LegacyMemoryDocument, "id" | "createdAt" | "updatedAt" | "expiresAt"> & {
  createdAt: string; updatedAt: string; expiresAt: string | null;
};
