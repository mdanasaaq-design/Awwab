export type MemoryKind = "working" | "episodic" | "semantic" | "procedural" | "development";
export type Sensitivity = "low" | "normal" | "sensitive";
export type MemorySourceKind = "owner_entered" | "owner_corrected" | "observed_evidence" | "reviewed_import";
export type GoalStatus = "draft" | "active" | "blocked" | "completed" | "cancelled";
export type GoalPriority = "low" | "medium" | "high" | "urgent";
export type ExperienceKind = "request" | "decision" | "plan" | "action" | "verification" | "reflection";
export type ExperienceOutcome = "unknown" | "success" | "partial" | "failure" | "cancelled";
export interface IdentityProfile {
  readonly schemaVersion: 1; readonly id: string; readonly version: number; readonly purpose: string;
  readonly principles: readonly string[]; readonly boundaries: readonly string[];
  readonly createdAt: string; readonly updatedAt: string;
}
export interface MemoryRecord {
  readonly id: string; readonly ownerId: string; readonly kind: MemoryKind; readonly content: string;
  readonly source: Readonly<{kind: MemorySourceKind; reference: string | null}>; readonly confidence: number;
  readonly sensitivity: Sensitivity; readonly createdAt: string; readonly updatedAt: string; readonly expiresAt: string | null;
  readonly userVisible: boolean; readonly confirmedByOwner: boolean; readonly status: "active" | "archived";
}
export interface GoalRecord {
  readonly id: string; readonly ownerId: string; readonly title: string; readonly description: string;
  readonly parentGoalId: string | null; readonly priority: GoalPriority; readonly status: GoalStatus;
  readonly constraints: readonly string[]; readonly progress: number;
  readonly source: "owner_requested" | "owner_approved_suggestion"; readonly createdAt: string; readonly updatedAt: string;
}
export interface ExperienceRecord {
  readonly id: string; readonly ownerId: string; readonly kind: ExperienceKind; readonly summary: string;
  readonly goalId: string | null; readonly taskRef: string | null; readonly planRef: string | null; readonly actionRef: string | null;
  readonly evidenceRefs: readonly string[]; readonly outcome: ExperienceOutcome;
  readonly verification: "unverified" | "verified" | "rejected"; readonly confidence: number; readonly recordedAt: string; readonly notes: string;
}
export interface SelectedMemory {
  readonly id: string; readonly kind: MemoryKind; readonly content: string; readonly score: number;
  readonly source: MemoryRecord["source"]; readonly confidence: number; readonly sensitivity: Sensitivity;
  readonly updatedAt: string; readonly expiresAt: string | null; readonly reason: "lexical_overlap";
}
export interface MemoryContext {
  readonly ownerId: string; readonly query: string; readonly selected: readonly SelectedMemory[];
  readonly excluded: readonly Readonly<{id: string; reason: string}>[]; readonly totalChars: number;
  readonly maxChars: number; readonly untrustedDataNotice: string;
}
export class CognitiveCoreError extends Error { readonly code: string; }
export const COGNITIVE_SCHEMA_VERSION: 1;
export const COGNITIVE_UNTRUSTED_DATA_NOTICE: string;
export function createIdentityProfile(input: Omit<IdentityProfile, "schemaVersion">): IdentityProfile;
export function validateMemoryRecord(input: MemoryRecord): MemoryRecord;
export function validateGoal(input: GoalRecord): GoalRecord;
export function validateExperienceRecord(input: ExperienceRecord): ExperienceRecord;
export function selectMemoryContext(options: {
  ownerId: string; query: string; memories: readonly MemoryRecord[]; now?: string; maxChars?: number; maxRecords?: number;
  includeSensitive?: boolean; includeUnconfirmed?: boolean;
}): MemoryContext;
export interface CognitiveStore {
  readonly ownerId: string;
  createMemory(input: Partial<MemoryRecord> & Pick<MemoryRecord, "kind" | "content">): MemoryRecord;
  getMemory(id: string): MemoryRecord; listMemories(): MemoryRecord[];
  correctMemory(id: string, content: string): MemoryRecord; deleteMemory(id: string): true;
  createGoal(input: Partial<GoalRecord> & Pick<GoalRecord, "title">): GoalRecord;
  getGoal(id: string): GoalRecord; listGoals(): GoalRecord[];
  updateGoal(id: string, patch: Partial<Omit<GoalRecord, "id" | "ownerId" | "createdAt" | "source">>): GoalRecord;
  recordExperience(input: Partial<ExperienceRecord> & Pick<ExperienceRecord, "kind" | "summary">): ExperienceRecord;
  listExperiences(): ExperienceRecord[];
  selectContext(options: Omit<Parameters<typeof selectMemoryContext>[0], "ownerId" | "memories"> & {memories?: readonly MemoryRecord[]}): MemoryContext;
}
export function createInMemoryCognitiveStore(options: {ownerId: string; clock?: () => string; idFactory?: () => string}): CognitiveStore;
