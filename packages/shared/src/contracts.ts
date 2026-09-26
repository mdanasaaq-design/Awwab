export type DeviceStatus = "pending" | "trusted" | "revoked";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "executed" | "failed";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface UserProfile {
  displayName: string;
  email: string;
  timezone: string;
  locale: string;
  status: "active" | "disabled";
}

export interface DeviceRecord {
  platform: "web" | "android";
  appVersion: string;
  deviceName: string;
  status: DeviceStatus;
  createdAt: string;
  lastSeenAt: string;
  trustedAt?: string;
  revokedAt?: string;
}

export interface ApprovalRecord {
  actionType: string;
  description: string;
  riskLevel: RiskLevel;
  requestedAt: string;
  expiresAt: string;
  status: ApprovalStatus;
  requestedByDeviceId: string;
  approvedAt?: string;
  approvedByDeviceId?: string;
  executionId?: string;
  resultSummary?: string;
}
