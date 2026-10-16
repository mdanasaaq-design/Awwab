import { httpsCallable, type Functions } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { auth, firebaseApp } from "./firebase";

const STORAGE_KEY = "awwab.deviceId";

export interface DeviceRecord {
  deviceId: string;
  platform: "web" | "android";
  appVersion: string;
  deviceName: string;
  status: "pending" | "trusted" | "revoked";
  createdAt: string | null;
  lastSeenAt: string | null;
  trustedAt: string | null;
}

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
  return getFunctions(firebaseApp);
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

  const bootstrap = httpsCallable<typeof payload, { status: string }>(
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

    const register = httpsCallable<typeof payload, { status: string }>(
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

  const callable = httpsCallable<{ deviceId: string }, { devices: DeviceRecord[] }>(
    functions,
    "listDevices",
  );
  const result = await callable({ deviceId: getDeviceId() });
  return result.data.devices;
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

  const callable = httpsCallable<void, { ok: boolean; uid: string }>(
    functions,
    "ensureUserProfile",
  );
  return callable();
}
