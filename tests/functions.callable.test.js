import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

const PROJECT_ID = "demo-awwab";
const AUTH_BASE = "http://127.0.0.1:9099";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;

function newDeviceId(prefix = "web") {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

async function createAuthUser(label) {
  const response = await fetch(
    `${AUTH_BASE}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: `${label}-${randomUUID()}@example.test`,
        password: "Awwab-emulator-test-123!",
        returnSecureToken: true,
      }),
    },
  );
  const body = await response.json();
  assert.equal(response.ok, true, `Auth emulator sign-up failed: ${JSON.stringify(body)}`);
  assert.equal(typeof body.idToken, "string");
  return body;
}

async function signInAuthUser(email) {
  const response = await fetch(
    `${AUTH_BASE}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password: "Awwab-emulator-test-123!",
        returnSecureToken: true,
      }),
    },
  );
  const body = await response.json();
  assert.equal(response.ok, true, `Auth emulator sign-in failed: ${JSON.stringify(body)}`);
  assert.equal(typeof body.idToken, "string");
  return body;
}

async function invokeCallable(name, data, idToken) {
  const headers = { "content-type": "application/json" };
  if (idToken) headers.authorization = `Bearer ${idToken}`;

  const response = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });
  const body = await response.json();

  if (body.error) {
    return { ok: false, error: body.error, httpStatus: response.status };
  }
  return { ok: true, result: body.result, httpStatus: response.status };
}


async function listActivity(uid, idToken) {
  const response = await fetch(
    `http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}/activity?pageSize=100`,
    { headers: { authorization: `Bearer ${idToken}` } },
  );
  const body = await response.json();
  assert.equal(response.ok, true, `Activity read failed: ${JSON.stringify(body)}`);
  return (body.documents ?? []).map((document) => ({
    action: document.fields?.action?.stringValue,
    outcome: document.fields?.outcome?.stringValue,
    targetReference: document.fields?.targetReference?.stringValue,
  }));
}

function bootstrapPayload(deviceId) {
  return {
    deviceId,
    platform: "web",
    appVersion: "test",
    deviceName: "Awwab callable emulator test",
  };
}

test("first-device bootstrap is atomic and requires an authenticated first enrollment", async () => {
  const unauthenticated = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(newDeviceId()),
    null,
  );
  assert.equal(unauthenticated.ok, false);
  assert.equal(unauthenticated.error.status, "UNAUTHENTICATED");

  const user = await createAuthUser("bootstrap-race");
  const profile = await invokeCallable("ensureUserProfile", {}, user.idToken);
  assert.equal(profile.ok, true, JSON.stringify(profile));
  assert.equal(profile.result.ok, true);
  assert.equal(profile.result.uid, user.localId);

  const deviceA = newDeviceId();
  const deviceB = newDeviceId();

  const competingResults = await Promise.all([
    invokeCallable("bootstrapFirstDevice", bootstrapPayload(deviceA), user.idToken),
    invokeCallable("bootstrapFirstDevice", bootstrapPayload(deviceB), user.idToken),
  ]);

  const successes = competingResults.filter((result) => result.ok);
  const failures = competingResults.filter((result) => !result.ok);
  assert.equal(successes.length, 1, JSON.stringify(competingResults));
  assert.equal(failures.length, 1, JSON.stringify(competingResults));

  const winnerDeviceId = successes[0].result.deviceId;
  assert.equal(successes[0].result.ok, true);
  assert.equal(successes[0].result.status, "trusted");
  assert.ok([deviceA, deviceB].includes(winnerDeviceId));

  const listed = await invokeCallable("listDevices", { deviceId: winnerDeviceId }, user.idToken);
  assert.equal(listed.ok, true, JSON.stringify(listed));
  assert.equal(listed.result.ok, true);
  assert.equal(listed.result.callerDeviceId, winnerDeviceId);
  assert.equal(listed.result.devices.length, 1);
  assert.equal(listed.result.devices[0].deviceId, winnerDeviceId);
  assert.equal(listed.result.devices[0].platform, "web");
  assert.equal(typeof listed.result.devices[0].createdAt, "string");
  assert.equal(typeof listed.result.devices[0].lastSeenAt, "string");
  assert.equal(typeof listed.result.devices[0].trustedAt, "string");
  assert.equal(listed.result.devices[0].status, "trusted");

  const repeatedBootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(newDeviceId()),
    user.idToken,
  );
  assert.equal(repeatedBootstrap.ok, false);
  assert.equal(repeatedBootstrap.error.status, "FAILED_PRECONDITION");

  const legacyUser = await createAuthUser("bootstrap-legacy");
  const legacyDeviceId = newDeviceId();
  const registered = await invokeCallable(
    "registerDevice",
    bootstrapPayload(legacyDeviceId),
    legacyUser.idToken,
  );
  assert.equal(registered.ok, true, JSON.stringify(registered));
  assert.equal(registered.result.ok, true);
  assert.equal(registered.result.deviceId, legacyDeviceId);
  assert.equal(registered.result.status, "pending");

  const legacyBootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(newDeviceId()),
    legacyUser.idToken,
  );
  assert.equal(legacyBootstrap.ok, false);
  assert.equal(legacyBootstrap.error.status, "FAILED_PRECONDITION");
});

test("concurrent duplicate device registrations are idempotent and audit atomically", async () => {
  const user = await createAuthUser("registration-race");
  const deviceId = newDeviceId();
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      invokeCallable("registerDevice", bootstrapPayload(deviceId), user.idToken),
    ),
  );

  assert.equal(results.every((result) => result.ok), true, JSON.stringify(results));
  assert.equal(results.every((result) => result.result.deviceId === deviceId), true);
  assert.equal(results.every((result) => result.result.status === "pending"), true);

  const activity = await listActivity(user.localId, user.idToken);
  const registrationEvents = activity.filter((event) => event.action === "device_registered");
  const seenEvents = activity.filter((event) => event.action === "device_seen");
  assert.equal(registrationEvents.length, 1, JSON.stringify(activity));
  assert.equal(seenEvents.length, 4, JSON.stringify(activity));
  assert.equal(activity.length, 5);
});

test("concurrent revocations cannot remove the final trusted device", async () => {
  const user = await createAuthUser("revoke-race");
  const deviceA = newDeviceId();
  const deviceB = newDeviceId();

  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(deviceA),
    user.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));
  assert.equal(bootstrap.result.ok, true);
  assert.equal(bootstrap.result.deviceId, deviceA);
  assert.equal(bootstrap.result.status, "trusted");

  const registration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(deviceB),
    user.idToken,
  );
  assert.equal(registration.ok, true, JSON.stringify(registration));
  assert.equal(registration.result.ok, true);
  assert.equal(registration.result.deviceId, deviceB);
  assert.equal(registration.result.status, "pending");

  const approval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: deviceA, targetDeviceId: deviceB },
    user.idToken,
  );
  assert.equal(approval.ok, true, JSON.stringify(approval));
  assert.equal(approval.result.ok, true);
  assert.equal(approval.result.deviceId, deviceB);
  assert.equal(approval.result.status, "trusted");

  const revocations = await Promise.all([
    invokeCallable("revokeDevice", { callerDeviceId: deviceA, targetDeviceId: deviceA }, user.idToken),
    invokeCallable("revokeDevice", { callerDeviceId: deviceB, targetDeviceId: deviceB }, user.idToken),
  ]);

  const successes = revocations.filter((result) => result.ok);
  const failures = revocations.filter((result) => !result.ok);
  assert.equal(successes.length, 1, JSON.stringify(revocations));
  assert.equal(successes[0].result.ok, true);
  assert.equal(successes[0].result.status, "revoked");
  assert.equal(failures.length, 1, JSON.stringify(revocations));
  assert.equal(failures[0].error.status, "FAILED_PRECONDITION");

  const revokedDeviceId = successes[0].result.deviceId;
  const remainingDeviceId = revokedDeviceId === deviceA ? deviceB : deviceA;
  const listed = await invokeCallable(
    "listDevices",
    { deviceId: remainingDeviceId },
    user.idToken,
  );
  assert.equal(listed.ok, true, JSON.stringify(listed));
  assert.equal(listed.result.devices.length, 2);
  assert.equal(
    listed.result.devices.filter((device) => device.status === "trusted").length,
    1,
  );
  assert.equal(
    listed.result.devices.find((device) => device.status === "trusted").deviceId,
    remainingDeviceId,
  );
  assert.equal(
    listed.result.devices.find((device) => device.deviceId === revokedDeviceId).status,
    "revoked",
  );

  const finalDeviceRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: remainingDeviceId, targetDeviceId: remainingDeviceId },
    user.idToken,
  );
  assert.equal(finalDeviceRevoke.ok, false);
  assert.equal(finalDeviceRevoke.error.status, "FAILED_PRECONDITION");

  const repeatedRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: remainingDeviceId, targetDeviceId: revokedDeviceId },
    user.idToken,
  );
  assert.equal(repeatedRevoke.ok, true, JSON.stringify(repeatedRevoke));
  assert.equal(repeatedRevoke.result.ok, true);
  assert.equal(repeatedRevoke.result.deviceId, revokedDeviceId);
  assert.equal(repeatedRevoke.result.status, "revoked");

  const pendingDeviceId = newDeviceId();
  const pendingRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDeviceId),
    user.idToken,
  );
  assert.equal(pendingRegistration.ok, true, JSON.stringify(pendingRegistration));
  assert.equal(pendingRegistration.result.status, "pending");

  const pendingRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: remainingDeviceId, targetDeviceId: pendingDeviceId },
    user.idToken,
  );
  assert.equal(pendingRevoke.ok, true, JSON.stringify(pendingRevoke));
  assert.equal(pendingRevoke.result.status, "revoked");

  const reRegisterRevoked = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDeviceId),
    user.idToken,
  );
  assert.equal(reRegisterRevoked.ok, false);
  assert.equal(reRegisterRevoked.error.status, "PERMISSION_DENIED");
});

test("protected callables validate authentication, inputs, and device state", async () => {
  const health = await invokeCallable("health", {}, null);
  assert.equal(health.ok, true, JSON.stringify(health));
  assert.equal(health.result.ok, true);
  assert.equal(health.result.service, "awwab-functions");

  const user = await createAuthUser("callable-negative");
  const validId = newDeviceId();
  const unauthenticatedCalls = await Promise.all([
    invokeCallable("registerDevice", bootstrapPayload(validId), null),
    invokeCallable("listDevices", { deviceId: validId }, null),
    invokeCallable("approveDevice", { callerDeviceId: validId, targetDeviceId: newDeviceId() }, null),
    invokeCallable("revokeDevice", { callerDeviceId: validId, targetDeviceId: newDeviceId() }, null),
    invokeCallable("ensureUserProfile", {}, null),
  ]);
  assert.ok(unauthenticatedCalls.every((result) => !result.ok && result.error.status === "UNAUTHENTICATED"));

  const invalidId = await invokeCallable(
    "registerDevice",
    bootstrapPayload("short"),
    user.idToken,
  );
  assert.equal(invalidId.ok, false);
  assert.equal(invalidId.error.status, "INVALID_ARGUMENT");

  const invalidPlatform = await invokeCallable(
    "registerDevice",
    { ...bootstrapPayload(newDeviceId()), platform: "ios" },
    user.idToken,
  );
  assert.equal(invalidPlatform.ok, false);
  assert.equal(invalidPlatform.error.status, "INVALID_ARGUMENT");

  const invalidListId = await invokeCallable("listDevices", { deviceId: "short" }, user.idToken);
  assert.equal(invalidListId.ok, false);
  assert.equal(invalidListId.error.status, "INVALID_ARGUMENT");

  const invalidApproveId = await invokeCallable(
    "approveDevice",
    { callerDeviceId: "short", targetDeviceId: newDeviceId() },
    user.idToken,
  );
  assert.equal(invalidApproveId.ok, false);
  assert.equal(invalidApproveId.error.status, "INVALID_ARGUMENT");

  const invalidRevokeId = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: "short", targetDeviceId: newDeviceId() },
    user.idToken,
  );
  assert.equal(invalidRevokeId.ok, false);
  assert.equal(invalidRevokeId.error.status, "INVALID_ARGUMENT");

  const pendingDeviceId = newDeviceId();
  const pendingRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDeviceId),
    user.idToken,
  );
  assert.equal(pendingRegistration.ok, true);
  assert.equal(pendingRegistration.result.status, "pending");

  const repeatedRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDeviceId),
    user.idToken,
  );
  assert.equal(repeatedRegistration.ok, true);
  assert.equal(repeatedRegistration.result.deviceId, pendingDeviceId);
  assert.equal(repeatedRegistration.result.status, "pending");

  const pendingList = await invokeCallable(
    "listDevices",
    { deviceId: pendingDeviceId },
    user.idToken,
  );
  assert.equal(pendingList.ok, false);
  assert.equal(pendingList.error.status, "PERMISSION_DENIED");

  const pendingApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: pendingDeviceId, targetDeviceId: newDeviceId() },
    user.idToken,
  );
  assert.equal(pendingApproval.ok, false);
  assert.equal(pendingApproval.error.status, "PERMISSION_DENIED");

  const pendingRevokeAttempt = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: pendingDeviceId, targetDeviceId: pendingDeviceId },
    user.idToken,
  );
  assert.equal(pendingRevokeAttempt.ok, false);
  assert.equal(pendingRevokeAttempt.error.status, "PERMISSION_DENIED");

  const trustedUser = await createAuthUser("callable-state");
  const trustedDeviceId = newDeviceId();
  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(trustedDeviceId),
    trustedUser.idToken,
  );
  assert.equal(bootstrap.ok, true);

  const missingTargetId = newDeviceId();
  const missingApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId: missingTargetId },
    trustedUser.idToken,
  );
  assert.equal(missingApproval.ok, false);
  assert.equal(missingApproval.error.status, "NOT_FOUND");

  const selfApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId: trustedDeviceId },
    trustedUser.idToken,
  );
  assert.equal(selfApproval.ok, false);
  assert.equal(selfApproval.error.status, "INVALID_ARGUMENT");

  const targetDeviceId = newDeviceId();
  const targetRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(targetDeviceId),
    trustedUser.idToken,
  );
  assert.equal(targetRegistration.ok, true);

  const approval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId },
    trustedUser.idToken,
  );
  assert.equal(approval.ok, true);
  assert.equal(approval.result.status, "trusted");

  const duplicateApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId },
    trustedUser.idToken,
  );
  assert.equal(duplicateApproval.ok, false);
  assert.equal(duplicateApproval.error.status, "FAILED_PRECONDITION");

  const missingRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId: missingTargetId },
    trustedUser.idToken,
  );
  assert.equal(missingRevoke.ok, false);
  assert.equal(missingRevoke.error.status, "NOT_FOUND");

  const profileResults = await Promise.all(
    Array.from({ length: 6 }, () => invokeCallable("ensureUserProfile", {}, trustedUser.idToken)),
  );
  assert.equal(profileResults.every((result) => result.ok), true, JSON.stringify(profileResults));
  assert.equal(profileResults.every((result) => result.result.uid === trustedUser.localId), true);
});



test("device security audit records successful transitions without false success events", async () => {
  const user = await createAuthUser("audit-transitions");
  const firstDevice = newDeviceId();
  const secondDevice = newDeviceId();
  const thirdDevice = newDeviceId();

  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(firstDevice),
    user.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  const registration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(secondDevice),
    user.idToken,
  );
  assert.equal(registration.ok, true, JSON.stringify(registration));

  const approval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: firstDevice, targetDeviceId: secondDevice },
    user.idToken,
  );
  assert.equal(approval.ok, true, JSON.stringify(approval));

  const duplicateApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: firstDevice, targetDeviceId: secondDevice },
    user.idToken,
  );
  assert.equal(duplicateApproval.ok, false);
  assert.equal(duplicateApproval.error.status, "FAILED_PRECONDITION");

  const thirdRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(thirdDevice),
    user.idToken,
  );
  assert.equal(thirdRegistration.ok, true, JSON.stringify(thirdRegistration));

  const revokePending = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: firstDevice, targetDeviceId: thirdDevice },
    user.idToken,
  );
  assert.equal(revokePending.ok, true, JSON.stringify(revokePending));

  const revokeFirstTrusted = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: secondDevice, targetDeviceId: firstDevice },
    user.idToken,
  );
  assert.equal(revokeFirstTrusted.ok, true, JSON.stringify(revokeFirstTrusted));

  const finalTrustedRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: secondDevice, targetDeviceId: secondDevice },
    user.idToken,
  );
  assert.equal(finalTrustedRevoke.ok, false);
  assert.equal(finalTrustedRevoke.error.status, "FAILED_PRECONDITION");

  const activity = await listActivity(user.localId, user.idToken);
  const byAction = (action) => activity.filter((event) => event.action === action);

  assert.equal(byAction("device_bootstrapped").length, 1);
  assert.equal(byAction("device_registered").length, 2);
  assert.equal(byAction("device_approved").length, 1);
  assert.equal(byAction("device_revoked").length, 2);

  assert.equal(byAction("device_bootstrapped")[0].outcome, "success");
  assert.equal(byAction("device_registered").every((event) => event.outcome === "success"), true);
  assert.equal(byAction("device_approved")[0].outcome, "success");
  assert.equal(byAction("device_revoked")[0].outcome, "success");
  assert.deepEqual(
    byAction("device_revoked").map((event) => event.targetReference).sort(),
    [firstDevice, thirdDevice].sort(),
  );

  // Failed transitions currently fail closed and must never be represented as
  // successful audit events. Failed-attempt audit logging remains a separate policy decision.
  assert.equal(activity.some((event) => event.targetReference === secondDevice && event.action === "device_approved" && event.outcome !== "success"), false);
  assert.equal(activity.some((event) => event.targetReference === secondDevice && event.action === "device_revoked"), false);
});

test("a revoked device cannot approve or revoke devices", async () => {
  const user = await createAuthUser("revoked-caller");
  const originalDevice = newDeviceId();
  const replacementDevice = newDeviceId();
  const pendingDevice = newDeviceId();

  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(originalDevice),
    user.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  const replacementRegistration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(replacementDevice),
    user.idToken,
  );
  assert.equal(replacementRegistration.ok, true, JSON.stringify(replacementRegistration));

  const approval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: originalDevice, targetDeviceId: replacementDevice },
    user.idToken,
  );
  assert.equal(approval.ok, true, JSON.stringify(approval));

  const revokeOriginal = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: replacementDevice, targetDeviceId: originalDevice },
    user.idToken,
  );
  assert.equal(revokeOriginal.ok, true, JSON.stringify(revokeOriginal));

  const registerPending = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDevice),
    user.idToken,
  );
  assert.equal(registerPending.ok, true, JSON.stringify(registerPending));

  const staleApprove = await invokeCallable(
    "approveDevice",
    { callerDeviceId: originalDevice, targetDeviceId: pendingDevice },
    user.idToken,
  );
  assert.equal(staleApprove.ok, false);
  assert.equal(staleApprove.error.status, "PERMISSION_DENIED");

  const staleRevoke = await invokeCallable(
    "revokeDevice",
    { callerDeviceId: originalDevice, targetDeviceId: pendingDevice },
    user.idToken,
  );
  assert.equal(staleRevoke.ok, false);
  assert.equal(staleRevoke.error.status, "PERMISSION_DENIED");

  const listed = await invokeCallable(
    "listDevices",
    { deviceId: replacementDevice },
    user.idToken,
  );
  assert.equal(listed.ok, true, JSON.stringify(listed));
  assert.equal(listed.result.devices.find((device) => device.deviceId === pendingDevice).status, "pending");
});


async function seedMemoryAsEmulatorAdmin(uid, memoryId, overrides = {}) {
  const now = new Date();
  const expiresAt = Object.hasOwn(overrides, "expiresAt")
    ? overrides.expiresAt
    : null;
  const fields = {
    content: { stringValue: "I prefer concise project updates." },
    type: { stringValue: "explicit_preference" },
    sourceKind: { stringValue: "user_explicit" },
    confidence: { doubleValue: 1 },
    sensitivity: { stringValue: "normal" },
    createdAt: { timestampValue: now.toISOString() },
    updatedAt: { timestampValue: now.toISOString() },
    expiresAt: expiresAt
      ? { timestampValue: new Date(expiresAt).toISOString() }
      : { nullValue: null },
    userVisible: { booleanValue: true },
    confirmedByUser: { booleanValue: true },
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (key === "expiresAt") continue;
    if (typeof value === "string") fields[key] = { stringValue: value };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    else if (typeof value === "number") fields[key] = { doubleValue: value };
  }

  const response = await fetch(
    `http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}/memories/${memoryId}`,
    {
      method: "PATCH",
      headers: {
        authorization: "Bearer owner",
        "content-type": "application/json",
      },
      body: JSON.stringify({ fields }),
    },
  );
  const body = await response.json();
  assert.equal(response.ok, true, `Memory seed failed: ${JSON.stringify(body)}`);
}

test("known limitation: a second account session can claim a trusted caller device ID", async () => {
  // This is an explicit security-characterization test, not a passing security
  // guarantee: Firebase Auth identifies the account, while callerDeviceId is
  // still caller-supplied and is not cryptographic proof of device possession.
  const firstSession = await createAuthUser("device-id-spoof");
  const secondSession = await signInAuthUser(firstSession.email);
  const trustedDeviceId = newDeviceId();
  const pendingDeviceId = newDeviceId();

  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(trustedDeviceId),
    firstSession.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  const registration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(pendingDeviceId),
    secondSession.idToken,
  );
  assert.equal(registration.ok, true, JSON.stringify(registration));
  assert.equal(registration.result.status, "pending");

  const spoofedApproval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: trustedDeviceId, targetDeviceId: pendingDeviceId },
    secondSession.idToken,
  );
  assert.equal(spoofedApproval.ok, true, JSON.stringify(spoofedApproval));
  assert.equal(spoofedApproval.result.status, "trusted");
});

test("assistant memory context requires auth, explicit scope, and a trusted device", async () => {
  const deviceId = newDeviceId();
  const unauthenticated = await invokeCallable(
    "getAssistantMemoryContext",
    { deviceId, scope: "conversation_context" },
    null,
  );
  assert.equal(unauthenticated.ok, false);
  assert.equal(unauthenticated.error.status, "UNAUTHENTICATED");

  const user = await createAuthUser("memory-context");
  const untrusted = await invokeCallable(
    "getAssistantMemoryContext",
    { deviceId, scope: "conversation_context" },
    user.idToken,
  );
  assert.equal(untrusted.ok, false);
  assert.equal(untrusted.error.status, "NOT_FOUND");

  const trustedDeviceId = newDeviceId();
  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(trustedDeviceId),
    user.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  const missingScope = await invokeCallable(
    "getAssistantMemoryContext",
    { deviceId: trustedDeviceId },
    user.idToken,
  );
  assert.equal(missingScope.ok, false);
  assert.equal(missingScope.error.status, "INVALID_ARGUMENT");

  const empty = await invokeCallable(
    "getAssistantMemoryContext",
    { deviceId: trustedDeviceId, scope: "conversation_context" },
    user.idToken,
  );
  assert.equal(empty.ok, true, JSON.stringify(empty));
  assert.deepEqual(empty.result.memories, []);
});

test("assistant memory context excludes expired, hidden, unconfirmed, and sensitive records", async () => {
  const user = await createAuthUser("memory-filter");
  const deviceId = newDeviceId();
  const bootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(deviceId),
    user.idToken,
  );
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  await seedMemoryAsEmulatorAdmin(user.localId, "valid-memory");
  await seedMemoryAsEmulatorAdmin(user.localId, "sensitive-memory", {
    sensitivity: "sensitive",
  });
  await seedMemoryAsEmulatorAdmin(user.localId, "expired-memory", {
    expiresAt: "2020-01-01T00:00:00.000Z",
  });
  await seedMemoryAsEmulatorAdmin(user.localId, "hidden-memory", {
    userVisible: false,
  });
  await seedMemoryAsEmulatorAdmin(user.localId, "unconfirmed-memory", {
    confirmedByUser: false,
  });

  const result = await invokeCallable(
    "getAssistantMemoryContext",
    { deviceId, scope: "conversation_context" },
    user.idToken,
  );
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.result.memories.length, 1, JSON.stringify(result.result.memories));
  assert.equal(result.result.memories[0].id, "valid-memory");
  assert.equal(result.result.scope, "conversation_context");
  assert.ok(result.result.totalChars <= result.result.maxChars);
  assert.match(result.result.untrustedDataNotice, /not instructions or permissions/i);
});


test("assistant callable requires authentication and a trusted device", async () => {
  const request = {
    deviceId: newDeviceId(),
    requestId: randomUUID(),
    conversationId: randomUUID(),
    text: "Plan a small task",
    includeMemoryContext: false,
  };
  const unauthenticated = await invokeCallable("runAssistant", request, null);
  assert.equal(unauthenticated.ok, false);
  assert.equal(unauthenticated.error.status, "UNAUTHENTICATED");

  const user = await createAuthUser("assistant-untrusted");
  const untrusted = await invokeCallable("runAssistant", request, user.idToken);
  assert.equal(untrusted.ok, false);
  assert.equal(untrusted.error.status, "NOT_FOUND");

  const deviceId = newDeviceId();
  const bootstrap = await invokeCallable("bootstrapFirstDevice", bootstrapPayload(deviceId), user.idToken);
  assert.equal(bootstrap.ok, true, JSON.stringify(bootstrap));

  const notConfigured = await invokeCallable("runAssistant", { ...request, deviceId }, user.idToken);
  assert.equal(notConfigured.ok, false, JSON.stringify(notConfigured));
  assert.equal(notConfigured.error.status, "FAILED_PRECONDITION");
  assert.match(notConfigured.error.message, /Awwab\x27s own model has not been trained yet/i);
});
