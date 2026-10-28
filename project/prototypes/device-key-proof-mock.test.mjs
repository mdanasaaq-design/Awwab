import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { canonicalPayload, DeviceKeyProofMock } from './device-key-proof-mock.mjs';

const firstId = 'web_device_00000001';
const secondId = 'android_device_0002';
const targetId = 'web_device_00000003';
const makeKey = () => generateKeyPairSync('ed25519');
const publicPem = (pair) => pair.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const signed = (pair, challenge) => sign(null, Buffer.from(canonicalPayload(challenge)), pair.privateKey).toString('base64');

function setup() {
  const store = new DeviceKeyProofMock();
  const firstKey = makeKey();
  const secondKey = makeKey();
  const thirdKey = makeKey();
  store.enrollFirstDevice({ uid: 'synthetic-user', deviceId: firstId, publicKeyPem: publicPem(firstKey), now: 1000 });
  return { store, firstKey, secondKey, thirdKey };
}

function challengeFor(store, overrides = {}) {
  return store.issueChallenge({
    uid: 'synthetic-user', deviceId: firstId, action: 'approve_device',
    targetId, now: 2000, ...overrides,
  });
}

test('valid Ed25519 proof succeeds and challenge can be consumed only once', () => {
  const { store, firstKey } = setup();
  const challenge = challengeFor(store);
  const proof = { uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId, challengeId: challenge.challengeId, signature: signed(firstKey, challenge), now: 2001 };
  assert.equal(store.authorizeAndConsume(proof).ok, true);
  assert.throws(() => store.authorizeAndConsume(proof), /challenge-replayed/);
});

test('wrong private key cannot prove possession of the enrolled key', () => {
  const { store, secondKey } = setup();
  const challenge = challengeFor(store);
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId,
    challengeId: challenge.challengeId, signature: signed(secondKey, challenge), now: 2001,
  }), /invalid-signature/);
});

test('proof is bound to user, device, action, and target', () => {
  const { store, firstKey } = setup();
  const cases = [
    { uid: 'other-user', deviceId: firstId, action: 'approve_device', targetId },
    { uid: 'synthetic-user', deviceId: secondId, action: 'approve_device', targetId },
    { uid: 'synthetic-user', deviceId: firstId, action: 'revoke_device', targetId },
    { uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId: secondId },
  ];
  for (const mismatch of cases) {
    const challenge = challengeFor(store);
    assert.throws(() => store.authorizeAndConsume({
      ...mismatch, challengeId: challenge.challengeId, signature: signed(firstKey, challenge), now: 2001,
    }), /challenge-context-mismatch|device-not-trusted/);
  }
});

test('expired and future-dated challenges fail closed', () => {
  const { store, firstKey } = setup();
  const challenge = challengeFor(store, { ttlMs: 100 });
  const proof = { uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId, challengeId: challenge.challengeId, signature: signed(firstKey, challenge) };
  assert.throws(() => store.authorizeAndConsume({ ...proof, now: 2100 }), /challenge-expired-or-invalid-time/);
  assert.throws(() => store.authorizeAndConsume({ ...proof, now: 2101 }), /challenge-expired-or-invalid-time/);
  assert.throws(() => store.authorizeAndConsume({ ...proof, now: 1999 }), /challenge-expired-or-invalid-time/);
});

test('pending devices cannot issue trusted challenges or authorize proofs', () => {
  const { store, secondKey } = setup();
  store.registerPendingDevice({ uid: 'synthetic-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 1000 });
  assert.throws(() => store.issueChallenge({ uid: 'synthetic-user', deviceId: secondId, action: 'list_devices', now: 2000 }), /device-not-trusted/);
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: secondId, action: 'list_devices', challengeId: 'unknown',
    signature: 'x', now: 2000,
  }), /unknown-challenge/);
});

test('revoked devices cannot issue or use challenges', () => {
  const { store, firstKey, secondKey } = setup();
  store.registerPendingDevice({ uid: 'synthetic-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 1000 });
  store.approvePendingDevice({ uid: 'synthetic-user', callerDeviceId: firstId, targetDeviceId: secondId });
  store.revokeDevice({ uid: 'synthetic-user', callerDeviceId: firstId, targetDeviceId: secondId });
  assert.throws(() => store.issueChallenge({ uid: 'synthetic-user', deviceId: secondId, action: 'list_devices', now: 2000 }), /device-not-trusted/);
  const challenge = challengeFor(store);
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: secondId, action: 'list_devices', challengeId: challenge.challengeId,
    signature: signed(secondKey, challenge), now: 2001,
  }), /challenge-context-mismatch|device-not-trusted/);
});

test('a different public key cannot silently replace an existing binding', () => {
  const { store, secondKey } = setup();
  assert.throws(() => store.registerPendingDevice({
    uid: 'synthetic-user', deviceId: firstId, publicKeyPem: publicPem(secondKey), now: 2000,
  }), /key-replacement-requires-rotation/);
});

test('re-registering the same key is idempotent and revoked IDs cannot re-enroll', () => {
  const { store, secondKey } = setup();
  assert.deepEqual(store.registerPendingDevice({
    uid: 'synthetic-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 2000,
  }), { deviceId: secondId, status: 'pending', keyVersion: 1 });
  assert.deepEqual(store.registerPendingDevice({
    uid: 'synthetic-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 3000,
  }), { deviceId: secondId, status: 'pending', keyVersion: 1 });
  store.registerPendingDevice({ uid: 'synthetic-user', deviceId: targetId, publicKeyPem: publicPem(generateKeyPairSync('ed25519')), now: 2000 });
  store.revokeDevice({ uid: 'synthetic-user', callerDeviceId: firstId, targetDeviceId: targetId });
  assert.throws(() => store.registerPendingDevice({
    uid: 'synthetic-user', deviceId: targetId, publicKeyPem: publicPem(generateKeyPairSync('ed25519')), now: 4000,
  }), /revoked-device/);
});

test('unknown actions, malformed keys, and non-Ed25519 keys are rejected', () => {
  const { store } = setup();
  assert.throws(() => store.issueChallenge({ uid: 'synthetic-user', deviceId: firstId, action: 'delete_everything', now: 2000 }), /invalid-action/);
  assert.throws(() => store.enrollFirstDevice({ uid: 'another-user', deviceId: secondId, publicKeyPem: 'not a key' }), /invalid-public-key/);
  const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 });
  assert.throws(() => store.enrollFirstDevice({ uid: 'another-user', deviceId: secondId, publicKeyPem: publicPem(rsa) }), /invalid-public-key/);
});

test('challenge lifetime is capped and malformed signatures fail closed', () => {
  const { store } = setup();
  assert.throws(() => store.issueChallenge({ uid: 'synthetic-user', deviceId: firstId, action: 'list_devices', ttlMs: 60_001, now: 2000 }), /invalid-challenge-lifetime/);
  const challenge = challengeFor(store);
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId,
    challengeId: challenge.challengeId, signature: 'bad', now: 2001,
  }), /invalid-proof|invalid-signature/);
});

test('challenge payload cannot be altered without invalidating signature', () => {
  const { store, firstKey } = setup();
  const challenge = challengeFor(store);
  const altered = { ...challenge, targetId: secondId };
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId,
    challengeId: challenge.challengeId, signature: signed(firstKey, altered), now: 2001,
  }), /invalid-signature/);
});

test('audit events contain only synthetic model events and are user scoped', () => {
  const { store, secondKey } = setup();
  store.enrollFirstDevice({ uid: 'other-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 1000 });
  assert.ok(store.auditEvents('synthetic-user').every((event) => event.synthetic === true));
  assert.equal(store.auditEvents('other-user').length, 1);
  assert.equal(store.auditEvents('synthetic-user').length, 1);
});


test('a failed signature does not consume the challenge, so the legitimate key can retry', () => {
  const { store, firstKey, secondKey } = setup();
  const challenge = challengeFor(store);
  const request = {
    uid: 'synthetic-user', deviceId: firstId, action: 'approve_device', targetId,
    challengeId: challenge.challengeId, now: 2001,
  };
  assert.throws(() => store.authorizeAndConsume({ ...request, signature: signed(secondKey, challenge) }), /invalid-signature/);
  assert.equal(store.authorizeAndConsume({ ...request, signature: signed(firstKey, challenge) }).ok, true);
});

test('revocation invalidates an outstanding challenge for that device', () => {
  const { store, firstKey, secondKey } = setup();
  store.registerPendingDevice({ uid: 'synthetic-user', deviceId: secondId, publicKeyPem: publicPem(secondKey), now: 1000 });
  store.approvePendingDevice({ uid: 'synthetic-user', callerDeviceId: firstId, targetDeviceId: secondId });
  const challenge = store.issueChallenge({ uid: 'synthetic-user', deviceId: secondId, action: 'list_devices', now: 2000 });
  store.revokeDevice({ uid: 'synthetic-user', callerDeviceId: firstId, targetDeviceId: secondId });
  assert.throws(() => store.authorizeAndConsume({
    uid: 'synthetic-user', deviceId: secondId, action: 'list_devices',
    challengeId: challenge.challengeId, signature: signed(secondKey, challenge), now: 2001,
  }), /device-not-trusted/);
  assert.equal(store.getDevice('synthetic-user', secondId).status, 'revoked');
  assert.ok(firstKey);
});

test('challenge creation rejects unsafe expiry arithmetic', () => {
  const { store } = setup();
  assert.throws(() => store.issueChallenge({
    uid: 'synthetic-user', deviceId: firstId, action: 'list_devices',
    now: Number.MAX_SAFE_INTEGER - 10, ttlMs: 30,
  }), /invalid-challenge-lifetime/);
});
