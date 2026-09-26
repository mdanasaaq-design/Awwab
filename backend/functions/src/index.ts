import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

type DevicePlatform = "web" | "android";

function requireAuth(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }
  return uid;
}

function validateDeviceId(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(value)) {
    throw new HttpsError("invalid-argument", "deviceId must be an opaque 16-128 character identifier.");
  }
  return value;
}

function validatePlatform(value: unknown): DevicePlatform {
  if (value !== "web" && value !== "android") {
    throw new HttpsError("invalid-argument", "platform must be web or android.");
  }
  return value;
}

export const health = onCall(() => ({
  ok: true,
  service: "awwab-functions",
  version: "0.1.0",
}));

export const registerDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = request.data as Record<string, unknown>;
  const deviceId = validateDeviceId(data.deviceId);
  const platform = validatePlatform(data.platform);
  const appVersion = typeof data.appVersion === "string" ? data.appVersion.slice(0, 32) : "unknown";
  const deviceName = typeof data.deviceName === "string" ? data.deviceName.slice(0, 100) : "Awwab device";

  const userRef = db.doc(`users/${uid}`);
  const deviceRef = userRef.collection("devices").doc(deviceId);
  const existing = await deviceRef.get();

  if (existing.exists) {
    await deviceRef.set(
      {
        lastSeenAt: FieldValue.serverTimestamp(),
        appVersion,
        deviceName,
      },
      { merge: true },
    );

    await writeActivity(uid, deviceId, "device_seen", "success");
    return {
      ok: true,
      deviceId,
      status: existing.get("status") ?? "pending",
    };
  }

  await deviceRef.create({
    platform,
    appVersion,
    deviceName,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    notificationTokenStatus: "not_registered",
  });

  await writeActivity(uid, deviceId, "device_registered", "success");
  return { ok: true, deviceId, status: "pending" };
});

export const bootstrapFirstDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = request.data as Record<string, unknown>;
  const deviceId = validateDeviceId(data.deviceId);

  const devices = await db.collection(`users/${uid}/devices`).limit(1).get();

  if (!devices.empty) {
    throw new HttpsError("failed-precondition", "A device already exists for this account.");
  }

  const deviceRef = db.doc(`users/${uid}/devices/${deviceId}`);
  await deviceRef.create({
    platform: validatePlatform(data.platform),
    appVersion: typeof data.appVersion === "string" ? data.appVersion.slice(0, 32) : "unknown",
    deviceName: typeof data.deviceName === "string" ? data.deviceName.slice(0, 100) : "Awwab device",
    status: "trusted",
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    trustedAt: FieldValue.serverTimestamp(),
    notificationTokenStatus: "not_registered",
  });

  await writeActivity(uid, deviceId, "device_bootstrapped", "success");
  return { ok: true, deviceId, status: "trusted" };
});

async function writeActivity(uid: string, deviceId: string, action: string, outcome: string) {
  await db.collection(`users/${uid}/activity`).add({
    eventType: "security",
    actorType: "user",
    deviceId,
    tool: "device-management",
    action,
    targetType: "device",
    targetReference: deviceId,
    outcome,
    createdAt: FieldValue.serverTimestamp(),
  });
}
