import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

type DevicePlatform = "web" | "android";
type DeviceStatus = "pending" | "trusted" | "revoked";

interface DeviceInput {
  deviceId: unknown;
  platform: unknown;
  appVersion: unknown;
  deviceName: unknown;
}

function requireAuth(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }
  return uid;
}

function requireDeviceId(value: unknown): string {
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

function parseDeviceInput(data: unknown): {
  deviceId: string;
  platform: DevicePlatform;
  appVersion: string;
  deviceName: string;
} {
  const input = (data ?? {}) as DeviceInput;
  return {
    deviceId: requireDeviceId(input.deviceId),
    platform: validatePlatform(input.platform),
    appVersion: typeof input.appVersion === "string" ? input.appVersion.slice(0, 32) : "unknown",
    deviceName: typeof input.deviceName === "string" ? input.deviceName.slice(0, 100) : "Awwab device",
  };
}

async function getDevice(uid: string, deviceId: string) {
  const ref = db.doc(`users/${uid}/devices/${deviceId}`);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Device was not found.");
  }
  return { ref, snapshot };
}

async function requireTrustedCaller(uid: string, deviceId: string) {
  const { snapshot } = await getDevice(uid, deviceId);
  if (snapshot.get("status") !== "trusted") {
    throw new HttpsError("permission-denied", "The calling device is not trusted.");
  }
  return snapshot;
}

export const health = onCall(() => ({
  ok: true,
  service: "awwab-functions",
  version: "0.1.0",
}));

export const registerDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const parsed = parseDeviceInput(request.data);
  const userRef = db.doc(`users/${uid}`);
  const deviceRef = userRef.collection("devices").doc(parsed.deviceId);
  const existing = await deviceRef.get();

  if (existing.exists) {
    const status = existing.get("status") as DeviceStatus | undefined;
    if (status === "revoked") {
      throw new HttpsError("permission-denied", "This device has been revoked and cannot self-reactivate.");
    }

    await deviceRef.set(
      {
        lastSeenAt: FieldValue.serverTimestamp(),
        appVersion: parsed.appVersion,
        deviceName: parsed.deviceName,
      },
      { merge: true },
    );

    await writeActivity(uid, parsed.deviceId, "device_seen", "success");
    return { ok: true, deviceId: parsed.deviceId, status: status ?? "pending" };
  }

  await deviceRef.create({
    platform: parsed.platform,
    appVersion: parsed.appVersion,
    deviceName: parsed.deviceName,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    notificationTokenStatus: "not_registered",
  });

  await writeActivity(uid, parsed.deviceId, "device_registered", "success");
  return { ok: true, deviceId: parsed.deviceId, status: "pending" };
});

export const bootstrapFirstDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const parsed = parseDeviceInput(request.data);
  const devicesRef = db.collection(`users/${uid}/devices`);
  const bootstrapRef = db.doc(`users/${uid}/system/firstDeviceBootstrap`);
  const deviceRef = devicesRef.doc(parsed.deviceId);
  const activityRef = db.collection(`users/${uid}/activity`).doc();

  await db.runTransaction(async (transaction) => {
    // All reads happen before writes. The per-user guard makes concurrent
    // bootstrap attempts contend on the same document, even for different IDs.
    const existingDevices = await transaction.get(devicesRef.limit(1));
    const bootstrap = await transaction.get(bootstrapRef);
    const existingDevice = await transaction.get(deviceRef);

    if (!existingDevices.empty || bootstrap.exists || existingDevice.exists) {
      throw new HttpsError("failed-precondition", "A first trusted device has already been established.");
    }

    const timestamp = FieldValue.serverTimestamp();
    transaction.create(bootstrapRef, {
      deviceId: parsed.deviceId,
      createdAt: timestamp,
    });
    transaction.create(deviceRef, {
      platform: parsed.platform,
      appVersion: parsed.appVersion,
      deviceName: parsed.deviceName,
      status: "trusted",
      createdAt: timestamp,
      lastSeenAt: timestamp,
      trustedAt: timestamp,
      notificationTokenStatus: "not_registered",
    });
    transaction.create(activityRef, {
      eventType: "security",
      actorType: "user",
      deviceId: parsed.deviceId,
      tool: "device-management",
      action: "device_bootstrapped",
      targetType: "device",
      targetReference: parsed.deviceId,
      outcome: "success",
      createdAt: timestamp,
    });
  });

  return { ok: true, deviceId: parsed.deviceId, status: "trusted" };
});

export const listDevices = onCall(async (request) => {
  const uid = requireAuth(request);
  const callerDeviceId = requireDeviceId((request.data as Record<string, unknown> | undefined)?.deviceId);
  await requireTrustedCaller(uid, callerDeviceId);

  const snapshot = await db.collection(`users/${uid}/devices`).orderBy("createdAt", "asc").get();
  const devices = snapshot.docs.map((doc) => ({
    deviceId: doc.id,
    platform: doc.get("platform") as DevicePlatform,
    appVersion: doc.get("appVersion") as string,
    deviceName: doc.get("deviceName") as string,
    status: doc.get("status") as DeviceStatus,
    createdAt: doc.get("createdAt")?.toDate?.()?.toISOString() ?? null,
    lastSeenAt: doc.get("lastSeenAt")?.toDate?.()?.toISOString() ?? null,
    trustedAt: doc.get("trustedAt")?.toDate?.()?.toISOString() ?? null,
  }));

  return { ok: true, callerDeviceId, devices };
});

export const approveDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const callerDeviceId = requireDeviceId(data.callerDeviceId);
  const targetDeviceId = requireDeviceId(data.targetDeviceId);
  if (callerDeviceId === targetDeviceId) {
    throw new HttpsError("invalid-argument", "A trusted device does not need approval.");
  }

  const devicesRef = db.collection(`users/${uid}/devices`);
  const callerRef = devicesRef.doc(callerDeviceId);
  const targetRef = devicesRef.doc(targetDeviceId);
  const activityRef = db.collection(`users/${uid}/activity`).doc();

  await db.runTransaction(async (transaction) => {
    // Authorization and target state are read in the same transaction as the
    // mutation, preventing a concurrent revoke from authorizing stale approval.
    const callerSnapshot = await transaction.get(callerRef);
    const targetSnapshot = await transaction.get(targetRef);

    if (!callerSnapshot.exists || callerSnapshot.get("status") !== "trusted") {
      throw new HttpsError("permission-denied", "The calling device is not trusted.");
    }
    if (!targetSnapshot.exists) {
      throw new HttpsError("not-found", "Device was not found.");
    }
    if (targetSnapshot.get("status") !== "pending") {
      throw new HttpsError("failed-precondition", "Only pending devices can be approved.");
    }

    const timestamp = FieldValue.serverTimestamp();
    transaction.update(targetRef, {
      status: "trusted",
      trustedAt: timestamp,
      approvedByDeviceId: callerDeviceId,
    });
    transaction.create(activityRef, {
      eventType: "security",
      actorType: "device",
      actorId: callerDeviceId,
      deviceId: callerDeviceId,
      tool: "device-management",
      action: "device_approved",
      targetType: "device",
      targetReference: targetDeviceId,
      outcome: "success",
      createdAt: timestamp,
    });
  });

  return { ok: true, deviceId: targetDeviceId, status: "trusted" };
});

export const revokeDevice = onCall(async (request) => {
  const uid = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const callerDeviceId = requireDeviceId(data.callerDeviceId);
  const targetDeviceId = requireDeviceId(data.targetDeviceId);
  const devicesRef = db.collection(`users/${uid}/devices`);
  const callerRef = devicesRef.doc(callerDeviceId);
  const targetRef = devicesRef.doc(targetDeviceId);
  const activityRef = db.collection(`users/${uid}/activity`).doc();

  await db.runTransaction(async (transaction) => {
    // Read caller authorization in the same transaction as the revocation.
    const callerSnapshot = await transaction.get(callerRef);
    const targetSnapshot = await transaction.get(targetRef);
    if (!callerSnapshot.exists || callerSnapshot.get("status") !== "trusted") {
      throw new HttpsError("permission-denied", "The calling device is not trusted.");
    }
    if (!targetSnapshot.exists) {
      throw new HttpsError("not-found", "Device not found.");
    }

    const targetStatus = targetSnapshot.get("status") as DeviceStatus | undefined;
    if (targetStatus === "revoked") {
      return;
    }

    if (targetStatus !== "trusted" && targetStatus !== "pending") {
      throw new HttpsError("failed-precondition", "The device cannot be revoked from its current state.");
    }

    if (targetStatus === "trusted") {
      const trustedSnapshot = await transaction.get(devicesRef.where("status", "==", "trusted"));
      if (trustedSnapshot.size <= 1) {
        throw new HttpsError("failed-precondition", "The last trusted device cannot be revoked.");
      }
    }

    const timestamp = FieldValue.serverTimestamp();
    transaction.update(targetRef, {
      status: "revoked",
      revokedAt: timestamp,
      revokedByDeviceId: callerDeviceId,
    });
    transaction.create(activityRef, {
      eventType: "security",
      actorType: "device",
      actorId: callerDeviceId,
      deviceId: callerDeviceId,
      tool: "device-management",
      action: "device_revoked",
      targetType: "device",
      targetReference: targetDeviceId,
      outcome: "success",
      createdAt: timestamp,
    });
  });

  return { ok: true, deviceId: targetDeviceId, status: "revoked" };
});

export const ensureUserProfile = onCall(async (request) => {
  const uid = requireAuth(request);
  const userRef = db.doc(`users/${uid}`);
  const existing = await userRef.get();

  const email = request.auth?.token.email;
  const displayName = request.auth?.token.name;

  if (!existing.exists) {
    await userRef.create({
      email: typeof email === "string" ? email.slice(0, 320) : null,
      displayName: typeof displayName === "string" ? displayName.slice(0, 100) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.set(
      {
        email: typeof email === "string" ? email.slice(0, 320) : existing.get("email") ?? null,
        displayName:
          typeof displayName === "string" ? displayName.slice(0, 100) : existing.get("displayName") ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return { ok: true, uid };
});

async function writeActivity(
  uid: string,
  deviceId: string,
  action: string,
  outcome: string,
  targetReference = deviceId,
) {
  await db.collection(`users/${uid}/activity`).add({
    eventType: "security",
    actorType: "user",
    deviceId,
    tool: "device-management",
    action,
    targetType: "device",
    targetReference,
    outcome,
    createdAt: FieldValue.serverTimestamp(),
  });
}
