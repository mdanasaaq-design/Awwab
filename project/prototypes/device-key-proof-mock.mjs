/**
 * LOCAL-ONLY cryptographic protocol model.
 * Synthetic data only: no network, Firebase/Cloudflare SDK, secrets, or persistence.
 * This models Ed25519 proof-of-possession and one-time challenges; it is NOT a
 * production authentication server, hardware attestation, or cross-process store.
 */
import {
  createPublicKey,
  randomUUID,
  verify as verifySignature,
} from 'node:crypto';

const DEVICE_ID = /^[A-Za-z0-9_-]{16,128}$/;
const ACTIONS = new Set(['list_devices', 'approve_device', 'revoke_device']);
const MAX_CHALLENGE_TTL_MS = 60_000;

export function canonicalPayload({ challengeId, uid, deviceId, action, targetId, expiresAt }) {
  return JSON.stringify({
    version: 1,
    challengeId,
    uid,
    deviceId,
    action,
    targetId: targetId ?? null,
    expiresAt,
  });
}

export class DeviceKeyProofMock {
  #devices = new Map();
  #challenges = new Map();
  #audit = [];

  #key(uid, deviceId) { return uid + ':' + deviceId; }

  #requireUid(uid) {
    if (typeof uid !== 'string' || uid.trim().length === 0 || uid.length > 128) {
      throw new Error('unauthenticated');
    }
    return uid;
  }

  #requireDeviceId(deviceId) {
    if (typeof deviceId !== 'string' || !DEVICE_ID.test(deviceId)) {
      throw new Error('invalid-device-id');
    }
    return deviceId;
  }

  #parsePublicKey(publicKeyPem) {
    if (typeof publicKeyPem !== 'string' || publicKeyPem.length > 2048) {
      throw new Error('invalid-public-key');
    }
    let key;
    try {
      key = createPublicKey(publicKeyPem);
    } catch {
      throw new Error('invalid-public-key');
    }
    if (key.asymmetricKeyType !== 'ed25519') throw new Error('invalid-public-key');
    return key.export({ type: 'spki', format: 'pem' }).toString();
  }

  #record(uid, action, deviceId, targetId = null) {
    this.#audit.push({ uid, action, deviceId, targetId, synthetic: true });
  }

  enrollFirstDevice({ uid, deviceId, publicKeyPem, now = Date.now() }) {
    this.#requireUid(uid);
    this.#requireDeviceId(deviceId);
    const publicKey = this.#parsePublicKey(publicKeyPem);
    if ([...this.#devices.values()].some((d) => d.uid === uid)) {
      throw new Error('bootstrap-already-used');
    }
    this.#devices.set(this.#key(uid, deviceId), {
      uid, deviceId, publicKey, status: 'trusted', keyVersion: 1, createdAt: now,
    });
    this.#record(uid, 'device_key_enrolled', deviceId);
    return { deviceId, status: 'trusted', keyVersion: 1 };
  }

  registerPendingDevice({ uid, deviceId, publicKeyPem, now = Date.now() }) {
    this.#requireUid(uid);
    this.#requireDeviceId(deviceId);
    const publicKey = this.#parsePublicKey(publicKeyPem);
    const key = this.#key(uid, deviceId);
    const existing = this.#devices.get(key);
    if (existing?.status === 'revoked') throw new Error('revoked-device');
    if (existing) {
      if (existing.publicKey !== publicKey) throw new Error('key-replacement-requires-rotation');
      return { deviceId, status: existing.status, keyVersion: existing.keyVersion };
    }
    this.#devices.set(key, {
      uid, deviceId, publicKey, status: 'pending', keyVersion: 1, createdAt: now,
    });
    this.#record(uid, 'device_key_registered_pending', deviceId);
    return { deviceId, status: 'pending', keyVersion: 1 };
  }

  approvePendingDevice({ uid, callerDeviceId, targetDeviceId }) {
    this.#requireUid(uid);
    this.#requireDeviceId(callerDeviceId);
    this.#requireDeviceId(targetDeviceId);
    if (callerDeviceId === targetDeviceId) throw new Error('self-approval-denied');
    const caller = this.#devices.get(this.#key(uid, callerDeviceId));
    const target = this.#devices.get(this.#key(uid, targetDeviceId));
    if (!caller || caller.status !== 'trusted') throw new Error('caller-not-trusted');
    if (!target || target.status !== 'pending') throw new Error('target-not-pending');
    target.status = 'trusted';
    this.#record(uid, 'device_key_approved', callerDeviceId, targetDeviceId);
    return { deviceId: targetDeviceId, status: 'trusted' };
  }

  revokeDevice({ uid, callerDeviceId, targetDeviceId }) {
    this.#requireUid(uid);
    this.#requireDeviceId(callerDeviceId);
    this.#requireDeviceId(targetDeviceId);
    const caller = this.#devices.get(this.#key(uid, callerDeviceId));
    const target = this.#devices.get(this.#key(uid, targetDeviceId));
    if (!caller || caller.status !== 'trusted') throw new Error('caller-not-trusted');
    if (!target) throw new Error('target-not-found');
    if (target.status === 'revoked') return { deviceId: targetDeviceId, status: 'revoked' };
    if (target.status === 'trusted') {
      const trustedCount = [...this.#devices.values()].filter((d) => d.uid === uid && d.status === 'trusted').length;
      if (trustedCount <= 1) throw new Error('last-trusted-device');
    }
    target.status = 'revoked';
    this.#record(uid, 'device_key_revoked', callerDeviceId, targetDeviceId);
    return { deviceId: targetDeviceId, status: 'revoked' };
  }

  issueChallenge({ uid, deviceId, action, targetId = null, now = Date.now(), ttlMs = 30_000 }) {
    this.#requireUid(uid);
    this.#requireDeviceId(deviceId);
    if (!ACTIONS.has(action)) throw new Error('invalid-action');
    if (targetId !== null) this.#requireDeviceId(targetId);
    if (!Number.isSafeInteger(now) || !Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > MAX_CHALLENGE_TTL_MS) {
      throw new Error('invalid-challenge-lifetime');
    }
    const device = this.#devices.get(this.#key(uid, deviceId));
    if (!device || device.status !== 'trusted') throw new Error('device-not-trusted');
    const challengeId = randomUUID();
    const challenge = {
      challengeId, uid, deviceId, action, targetId, keyVersion: device.keyVersion,
      issuedAt: now, expiresAt: now + ttlMs, consumed: false,
    };
    this.#challenges.set(challengeId, challenge);
    return { ...challenge };
  }

  authorizeAndConsume({ uid, deviceId, action, targetId = null, challengeId, signature, now = Date.now() }) {
    this.#requireUid(uid);
    this.#requireDeviceId(deviceId);
    if (!ACTIONS.has(action)) throw new Error('invalid-action');
    if (targetId !== null) this.#requireDeviceId(targetId);
    if (typeof challengeId !== 'string' || typeof signature !== 'string' || signature.length > 512) {
      throw new Error('invalid-proof');
    }
    const challenge = this.#challenges.get(challengeId);
    if (!challenge) throw new Error('unknown-challenge');
    if (challenge.consumed) throw new Error('challenge-replayed');
    if (!Number.isSafeInteger(now) || now > challenge.expiresAt || now < challenge.issuedAt) {
      throw new Error('challenge-expired-or-invalid-time');
    }
    if (challenge.uid !== uid || challenge.deviceId !== deviceId ||
        challenge.action !== action || challenge.targetId !== targetId) {
      throw new Error('challenge-context-mismatch');
    }
    const device = this.#devices.get(this.#key(uid, deviceId));
    if (!device || device.status !== 'trusted') throw new Error('device-not-trusted');
    if (device.keyVersion !== challenge.keyVersion) throw new Error('key-version-mismatch');

    let signatureBytes;
    try {
      signatureBytes = Buffer.from(signature, 'base64');
      if (signatureBytes.length !== 64 || signatureBytes.toString('base64') !== signature) {
        throw new Error('bad-signature-encoding');
      }
    } catch {
      throw new Error('invalid-proof');
    }
    const payload = canonicalPayload(challenge);
    const valid = verifySignature(null, Buffer.from(payload, 'utf8'), createPublicKey(device.publicKey), signatureBytes);
    if (!valid) throw new Error('invalid-signature');

    // Model-only atomic consume: a real backend must consume this and perform the
    // privileged state change in one transactional/atomic server-side operation.
    challenge.consumed = true;
    this.#record(uid, 'device_key_proof_verified', deviceId, targetId);
    return { ok: true, uid, deviceId, action, targetId, challengeId };
  }

  getDevice(uid, deviceId) {
    this.#requireUid(uid);
    this.#requireDeviceId(deviceId);
    const device = this.#devices.get(this.#key(uid, deviceId));
    if (!device) return null;
    const { publicKey: _publicKey, ...safe } = device;
    return { ...safe };
  }

  auditEvents(uid) {
    this.#requireUid(uid);
    return this.#audit.filter((event) => event.uid === uid).map(({ uid: _uid, ...event }) => ({ ...event }));
  }
}
