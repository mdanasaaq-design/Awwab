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
  const listed = await invokeCallable("listDevices", { deviceId: winnerDeviceId }, user.idToken);
  assert.equal(listed.ok, true, JSON.stringify(listed));
  assert.equal(listed.result.devices.length, 1);
  assert.equal(listed.result.devices[0].deviceId, winnerDeviceId);
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

  const legacyBootstrap = await invokeCallable(
    "bootstrapFirstDevice",
    bootstrapPayload(newDeviceId()),
    legacyUser.idToken,
  );
  assert.equal(legacyBootstrap.ok, false);
  assert.equal(legacyBootstrap.error.status, "FAILED_PRECONDITION");
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

  const registration = await invokeCallable(
    "registerDevice",
    bootstrapPayload(deviceB),
    user.idToken,
  );
  assert.equal(registration.ok, true, JSON.stringify(registration));

  const approval = await invokeCallable(
    "approveDevice",
    { callerDeviceId: deviceA, targetDeviceId: deviceB },
    user.idToken,
  );
  assert.equal(approval.ok, true, JSON.stringify(approval));

  const revocations = await Promise.all([
    invokeCallable("revokeDevice", { callerDeviceId: deviceA, targetDeviceId: deviceA }, user.idToken),
    invokeCallable("revokeDevice", { callerDeviceId: deviceB, targetDeviceId: deviceB }, user.idToken),
  ]);

  const successes = revocations.filter((result) => result.ok);
  const failures = revocations.filter((result) => !result.ok);
  assert.equal(successes.length, 1, JSON.stringify(revocations));
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
});
