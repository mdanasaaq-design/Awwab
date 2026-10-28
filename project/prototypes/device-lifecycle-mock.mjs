/**
 * LOCAL-ONLY prototype. Synthetic data only; no Firebase, Cloudflare, network,
 * persistence, secrets, or production imports. This models business rules but
 * does not prove Firestore transaction/concurrency behavior.
 */
export class DeviceLifecycleMock {
  #devices = new Map();
  #bootstrappedUsers = new Set();
  #audit = [];

  #key(uid, deviceId) { return `${uid}:${deviceId}`; }
  #requireUid(uid) {
    if (typeof uid !== 'string' || uid.trim().length === 0) throw new Error('unauthenticated');
    return uid;
  }
  #requireDeviceId(deviceId) {
    if (typeof deviceId !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(deviceId)) throw new Error('invalid-argument');
    return deviceId;
  }
  #parse(uid, input) {
    this.#requireUid(uid);
    const deviceId = this.#requireDeviceId(input?.deviceId);
    if (input?.platform !== 'web' && input?.platform !== 'android') throw new Error('invalid-argument');
    return {
      uid, deviceId, platform: input.platform,
      appVersion: typeof input.appVersion === 'string' ? input.appVersion.slice(0, 32) : 'unknown',
      deviceName: typeof input.deviceName === 'string' ? input.deviceName.slice(0, 100) : 'Awwab test device',
    };
  }
  #get(uid, deviceId) {
    const device = this.#devices.get(this.#key(uid, deviceId));
    if (!device) throw new Error('not-found');
    return device;
  }
  #trustedCaller(uid, deviceId) {
    const caller = this.#get(uid, this.#requireDeviceId(deviceId));
    if (caller.status !== 'trusted') throw new Error('permission-denied');
    return caller;
  }
  #record(uid, action, targetDeviceId, actorDeviceId = null) {
    this.#audit.push({ uid, action, targetDeviceId, actorDeviceId, outcome: 'success', synthetic: true });
  }

  bootstrapFirstDevice(uid, input) {
    const data = this.#parse(uid, input);
    const userHasDevices = [...this.#devices.values()].some((device) => device.uid === uid);
    if (userHasDevices || this.#bootstrappedUsers.has(uid)) throw new Error('failed-precondition');
    const device = { ...data, status: 'trusted' };
    this.#devices.set(this.#key(uid, data.deviceId), device);
    this.#bootstrappedUsers.add(uid);
    this.#record(uid, 'device_bootstrapped', data.deviceId);
    return { deviceId: data.deviceId, status: device.status };
  }

  registerDevice(uid, input) {
    const data = this.#parse(uid, input);
    const key = this.#key(uid, data.deviceId);
    const existing = this.#devices.get(key);
    if (existing?.status === 'revoked') throw new Error('permission-denied');
    if (existing) {
      Object.assign(existing, { appVersion: data.appVersion, deviceName: data.deviceName });
      this.#record(uid, 'device_seen', data.deviceId);
      return { deviceId: data.deviceId, status: existing.status };
    }
    this.#devices.set(key, { ...data, status: 'pending' });
    this.#record(uid, 'device_registered', data.deviceId);
    return { deviceId: data.deviceId, status: 'pending' };
  }

  listDevices(uid, callerDeviceId) {
    this.#requireUid(uid);
    this.#trustedCaller(uid, callerDeviceId);
    return [...this.#devices.values()]
      .filter((device) => device.uid === uid)
      .map(({ uid: _uid, ...device }) => ({ ...device }));
  }

  approveDevice(uid, callerDeviceId, targetDeviceId) {
    this.#requireUid(uid);
    this.#requireDeviceId(callerDeviceId);
    this.#requireDeviceId(targetDeviceId);
    if (callerDeviceId === targetDeviceId) throw new Error('invalid-argument');
    this.#trustedCaller(uid, callerDeviceId);
    const target = this.#get(uid, targetDeviceId);
    if (target.status !== 'pending') throw new Error('failed-precondition');
    target.status = 'trusted';
    this.#record(uid, 'device_approved', targetDeviceId, callerDeviceId);
    return { deviceId: targetDeviceId, status: target.status };
  }

  revokeDevice(uid, callerDeviceId, targetDeviceId) {
    this.#requireUid(uid);
    this.#requireDeviceId(callerDeviceId);
    this.#requireDeviceId(targetDeviceId);
    this.#trustedCaller(uid, callerDeviceId);
    const target = this.#get(uid, targetDeviceId);
    if (target.status === 'revoked') return { deviceId: targetDeviceId, status: 'revoked' };
    if (target.status !== 'trusted' && target.status !== 'pending') throw new Error('failed-precondition');
    if (target.status === 'trusted') {
      const trustedCount = [...this.#devices.values()].filter((device) => device.uid === uid && device.status === 'trusted').length;
      if (trustedCount <= 1) throw new Error('failed-precondition');
    }
    target.status = 'revoked';
    this.#record(uid, 'device_revoked', targetDeviceId, callerDeviceId);
    return { deviceId: targetDeviceId, status: target.status };
  }

  auditEvents(uid) {
    this.#requireUid(uid);
    return this.#audit.filter((event) => event.uid === uid).map(({ uid: _uid, ...event }) => ({ ...event }));
  }
}
