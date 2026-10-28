import test from 'node:test';
import assert from 'node:assert/strict';
import { DeviceLifecycleMock } from './device-lifecycle-mock.mjs';

const first = { deviceId: 'web_device_00000001', platform: 'web', appVersion: 'test', deviceName: 'Synthetic web' };
const second = { deviceId: 'android_device_0002', platform: 'android', appVersion: 'test', deviceName: 'Synthetic Android' };
const third = { deviceId: 'web_device_00000003', platform: 'web' };
const setup = () => { const store = new DeviceLifecycleMock(); store.bootstrapFirstDevice('synthetic-user', first); return store; };

test('bootstrap establishes one trusted first device and synthetic audit event', () => {
  const store = new DeviceLifecycleMock();
  assert.deepEqual(store.bootstrapFirstDevice('synthetic-user', first), { deviceId: first.deviceId, status: 'trusted' });
  assert.throws(() => store.bootstrapFirstDevice('synthetic-user', second), /failed-precondition/);
  assert.equal(store.auditEvents('synthetic-user')[0].action, 'device_bootstrapped');
});

test('device identifiers and platform are validated', () => {
  const store = new DeviceLifecycleMock();
  assert.throws(() => store.bootstrapFirstDevice('synthetic-user', { ...first, deviceId: 'short' }), /invalid-argument/);
  assert.throws(() => store.bootstrapFirstDevice('synthetic-user', { ...first, platform: 'desktop' }), /invalid-argument/);
  assert.throws(() => store.bootstrapFirstDevice('', first), /unauthenticated/);
});

test('new device is pending and cannot perform trusted operations', () => {
  const store = setup();
  store.registerDevice('synthetic-user', second);
  assert.throws(() => store.listDevices('synthetic-user', second.deviceId), /permission-denied/);
  assert.throws(() => store.approveDevice('synthetic-user', second.deviceId, third.deviceId), /permission-denied/);
});

test('trusted device can approve a pending device but cannot approve itself', () => {
  const store = setup();
  store.registerDevice('synthetic-user', second);
  assert.throws(() => store.approveDevice('synthetic-user', first.deviceId, first.deviceId), /invalid-argument/);
  assert.deepEqual(store.approveDevice('synthetic-user', first.deviceId, second.deviceId), { deviceId: second.deviceId, status: 'trusted' });
});

test('last trusted device cannot be revoked; another trusted device can be revoked', () => {
  const store = setup();
  assert.throws(() => store.revokeDevice('synthetic-user', first.deviceId, first.deviceId), /failed-precondition/);
  store.registerDevice('synthetic-user', second);
  store.approveDevice('synthetic-user', first.deviceId, second.deviceId);
  assert.deepEqual(store.revokeDevice('synthetic-user', first.deviceId, second.deviceId), { deviceId: second.deviceId, status: 'revoked' });
  assert.throws(() => store.revokeDevice('synthetic-user', first.deviceId, first.deviceId), /failed-precondition/);
});

test('revoked device cannot self-reactivate and cannot authorize calls', () => {
  const store = setup();
  store.registerDevice('synthetic-user', second);
  store.approveDevice('synthetic-user', first.deviceId, second.deviceId);
  store.revokeDevice('synthetic-user', first.deviceId, second.deviceId);
  assert.throws(() => store.registerDevice('synthetic-user', second), /permission-denied/);
  assert.throws(() => store.listDevices('synthetic-user', second.deviceId), /permission-denied/);
});

test('user data is isolated and audit events are synthetic', () => {
  const store = setup();
  store.bootstrapFirstDevice('other-user', { ...first, deviceId: 'other_web_device_01' });
  assert.equal(store.listDevices('synthetic-user', first.deviceId).length, 1);
  assert.equal(store.listDevices('other-user', 'other_web_device_01').length, 1);
  assert.ok(store.auditEvents('synthetic-user').every((event) => event.synthetic === true));
});

test('simultaneous-style bootstrap attempts yield only one successful first device', async () => {
  const store = new DeviceLifecycleMock();
  const results = await Promise.allSettled([
    Promise.resolve().then(() => store.bootstrapFirstDevice('synthetic-user', first)),
    Promise.resolve().then(() => store.bootstrapFirstDevice('synthetic-user', second)),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
  assert.equal(store.listDevices('synthetic-user', first.deviceId).length, 1);
});

test('pending devices can be revoked without risking the last trusted device', () => {
  const store = setup();
  store.registerDevice('synthetic-user', second);
  assert.deepEqual(store.revokeDevice('synthetic-user', first.deviceId, second.deviceId), {
    deviceId: second.deviceId,
    status: 'revoked',
  });
  assert.equal(store.listDevices('synthetic-user', first.deviceId).length, 2);
  assert.throws(() => store.approveDevice('synthetic-user', first.deviceId, second.deviceId), /failed-precondition/);
});

test('repeating revocation is idempotent and does not add a second success audit event', () => {
  const store = setup();
  store.registerDevice('synthetic-user', second);
  const before = store.auditEvents('synthetic-user').length;
  store.revokeDevice('synthetic-user', first.deviceId, second.deviceId);
  const afterFirstRevoke = store.auditEvents('synthetic-user').length;
  assert.equal(afterFirstRevoke, before + 1);
  assert.deepEqual(store.revokeDevice('synthetic-user', first.deviceId, second.deviceId), {
    deviceId: second.deviceId,
    status: 'revoked',
  });
  assert.equal(store.auditEvents('synthetic-user').length, afterFirstRevoke);
});

test('a trusted caller cannot approve or revoke another user’s device by guessing its ID', () => {
  const store = setup();
  store.bootstrapFirstDevice('other-user', { ...first, deviceId: 'other_web_device_01' });
  assert.throws(
    () => store.approveDevice('synthetic-user', first.deviceId, 'other_web_device_01'),
    /not-found/,
  );
  assert.throws(
    () => store.revokeDevice('synthetic-user', first.deviceId, 'other_web_device_01'),
    /not-found/,
  );
  assert.equal(store.listDevices('other-user', 'other_web_device_01')[0].status, 'trusted');
});

test('metadata is bounded and invalid caller identifiers fail closed', () => {
  const store = setup();
  store.registerDevice('synthetic-user', {
    ...second,
    appVersion: 'v'.repeat(100),
    deviceName: 'n'.repeat(200),
  });
  const registered = store.listDevices('synthetic-user', first.deviceId)
    .find((device) => device.deviceId === second.deviceId);
  assert.equal(registered.appVersion.length, 32);
  assert.equal(registered.deviceName.length, 100);
  assert.throws(() => store.listDevices('synthetic-user', 'short'), /invalid-argument/);
  assert.throws(() => store.listDevices('', first.deviceId), /unauthenticated/);
});
