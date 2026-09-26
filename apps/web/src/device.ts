import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { auth, firebaseApp } from "./firebase";

const STORAGE_KEY = "awwab.deviceId";

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

export async function registerWebDevice() {
  if (!firebaseApp || !auth?.currentUser) {
    return { status: "unavailable" as const };
  }

  const functions = getFunctions(firebaseApp);
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
    return await bootstrap(payload);
  } catch (error) {
    const register = httpsCallable<typeof payload, { status: string }>(
      functions,
      "registerDevice",
    );
    return register(payload);
  }
}
