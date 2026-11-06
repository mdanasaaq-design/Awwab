import { httpsCallable, type Functions } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import {
  type ApproveDeviceResponse,
  type BootstrapFirstDeviceResponse,
  type DeviceRecord,
  type EnsureUserProfileResponse,
  type ListDevicesResponse,
  type RegisterDeviceResponse,
  type RevokeDeviceResponse,
} from "@awwab/shared/contracts";
import { auth, firebaseApp } from "./firebase";

export type { DeviceRecord } from "@awwab/shared/contracts";

const STORAGE_KEY = "awwab.deviceId";
// Must match CALLABLE_OPTIONS.region in backend/functions/src/index.ts.
const FUNCTIONS_REGION = "asia-south1";

function getDeviceId(): string {
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) {
    return existing;
  }

  const id = `web_${crypto.randomUUID().replace(/-/g, "")}`;
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function getAwwabDeviceId(): string {
  return getDeviceId();
}

function getAwwabFunctions(): Functions | null {
  if (!firebaseApp || !auth?.currentUser) {
    return null;
  }
  return getFunctions(firebaseApp, FUNCTIONS_REGION);
}

export async function registerWebDevice() {
  const functions = getAwwabFunctions();
  if (!functions) {
    return { status: "unavailable" as const };
  }

  const payload = {
    deviceId: getDeviceId(),
    platform: "web" as const,
    appVersion: "0.1.0",
    deviceName: navigator.userAgent.slice(0, 100),
  };

  const bootstrap = httpsCallable<typeof payload, BootstrapFirstDeviceResponse>(
    functions,
    "bootstrapFirstDevice",
  );

  try {
    return (await bootstrap(payload)).data;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "functions/failed-precondition") {
      throw error;
    }

    const register = httpsCallable<typeof payload, RegisterDeviceResponse>(
      functions,
      "registerDevice",
    );
    return (await register(payload)).data;
  }
}

export async function listDevices(): Promise<DeviceRecord[]> {
  const functions = getAwwabFunctions();
  if (!functions) {
    throw new Error("Firebase is not configured for this environment.");
  }

  const callable = httpsCallable<{ deviceId: string }, ListDevicesResponse>(
    functions,
    "listDevices",
  );
  const result = await callable({ deviceId: getDeviceId() });
  return result.data.devices;
}

export type AssistantMemoryContext = {
  ok: true;
  scope: "conversation_context";
  trustedDeviceId: string;
  maxRecords: number;
  maxChars: number;
  untrustedDataNotice: string;
  memories: Array<{
    id: string;
    type: string;
    content: string;
    sourceKind: "user_explicit" | "user_corrected";
    updatedAt: string | null;
  }>;
  totalChars: number;
};

/** Explicitly retrieve eligible memory for inspection by the signed-in user. */
export async function getAssistantMemoryContext(): Promise<AssistantMemoryContext> {
  const functions = getAwwabFunctions();
  if (!functions) {
    throw new Error("Firebase is not configured or no user is signed in.");
  }

  const callable = httpsCallable<
    { deviceId: string; scope: "conversation_context" },
    AssistantMemoryContext
  >(functions, "getAssistantMemoryContext");
  const result = await callable({
    deviceId: getDeviceId(),
    scope: "conversation_context",
  });
  return result.data;
}

export async function approveDevice(targetDeviceId: string) {
  const functions = getAwwabFunctions();
  if (!functions) {
    throw new Error("Firebase is not configured for this environment.");
  }

  const callable = httpsCallable<
    { callerDeviceId: string; targetDeviceId: string },
    { status: string }
  >(functions, "approveDevice");

  return callable({
    callerDeviceId: getDeviceId(),
    targetDeviceId,
  });
}

export async function revokeDevice(targetDeviceId: string) {
  const functions = getAwwabFunctions();
  if (!functions) {
    throw new Error("Firebase is not configured for this environment.");
  }

  const callable = httpsCallable<
    { callerDeviceId: string; targetDeviceId: string },
    { status: string }
  >(functions, "revokeDevice");

  return callable({
    callerDeviceId: getDeviceId(),
    targetDeviceId,
  });
}

export async function ensureUserProfile() {
  const functions = getAwwabFunctions();
  if (!functions) {
    throw new Error("Firebase is not configured for this environment.");
  }

  const callable = httpsCallable<void, EnsureUserProfileResponse>(
    functions,
    "ensureUserProfile",
  );
  return callable();
}

