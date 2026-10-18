export type DeviceStatus = "pending" | "trusted" | "revoked";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "executed" | "failed";

export type RiskLevel = "low" | "medium" | "high" | "critical";

/**
 * Serialized device shape returned by the listDevices callable.
 * Firestore timestamps are converted to ISO strings; missing timestamps are null.
 */
export interface DeviceRecord {
  deviceId: string;
  platform: "web" | "android";
  appVersion: string;
  deviceName: string;
  status: DeviceStatus;
  createdAt: string | null;
  lastSeenAt: string | null;
  trustedAt: string | null;
}

export interface BootstrapFirstDeviceResponse {
  ok: true;
  deviceId: string;
  status: "trusted";
}

export interface RegisterDeviceResponse {
  ok: true;
  deviceId: string;
  status: "pending" | "trusted";
}

export interface ListDevicesResponse {
  ok: true;
  callerDeviceId: string;
  devices: DeviceRecord[];
}

export interface ApproveDeviceResponse {
  ok: true;
  deviceId: string;
  status: "trusted";
}

export interface RevokeDeviceResponse {
  ok: true;
  deviceId: string;
  status: "revoked";
}

export interface EnsureUserProfileResponse {
  ok: true;
  uid: string;
}

/**
 * Planned application-level profile shape. This is not a DTO for the current root
 * Firestore profile document; see docs/data-model.md for its backend-owned fields.
 */
export interface UserProfile {
  displayName: string;
  email: string;
  timezone: string;
  locale: string;
  status: "active" | "disabled";
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
