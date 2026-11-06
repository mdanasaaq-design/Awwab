import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { test } from "node:test";
import {
  DEVICE_PROOF_MAX_CHALLENGE_LIFETIME_MS,
  canonicalizeDeviceProofChallenge,
  hashCanonicalDeviceProofPayload,
  verifyDeviceProofSignature,
} from "../backend/functions/lib/deviceProof.js";

const b64url = (value) => Buffer.from(value).toString("base64")
  .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

function makeChallenge(overrides = {}) {
  return {
    challengeId: "challenge_1234567890",
    nonce: b64url(Buffer.alloc(32, 7)),
    uid: "firebase-user-123",
    deviceId: "device_123456789012",
    keyVersion: 1,
    operation: "approveDevice",
    targetId: "device_abcdefghijkl",
    payloadHash: "a".repeat(64),
    issuedAtMs: 1_800_000_000_000,
    expiresAtMs: 1_800_000_060_000,
    ...overrides,
  };
}

function createSignedMessage(message) {
  const pair = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const publicKeySpkiBase64 = pair.publicKey.export({ type: "spki", format: "der" }).toString("base64");
  const signature = sign("sha256", Buffer.from(message, "utf8"), {
    key: pair.privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return { publicKeySpkiBase64, signatureBase64Url: b64url(signature) };
}

test("canonical challenge serialization is deterministic and domain-separated", () => {
  const challenge = makeChallenge();
  const first = canonicalizeDeviceProofChallenge(challenge);
  assert.equal(first, canonicalizeDeviceProofChallenge({ ...challenge }));
  assert.ok(first.startsWith("awwab-device-proof-v1\n"));
  assert.notEqual(first, canonicalizeDeviceProofChallenge({ ...challenge, operation: "revokeDevice" }));
  assert.notEqual(first, canonicalizeDeviceProofChallenge({ ...challenge, targetId: null }));
});

test("canonical challenge rejects malformed fields and unsafe lifetimes", () => {
  const invalid = [
    { challengeId: "short" },
    { nonce: "not-a-nonce" },
    { uid: "" },
    { deviceId: "short" },
    { keyVersion: 0 },
    { operation: "deleteEverything" },
    { targetId: "short" },
    { payloadHash: "A".repeat(64) },
    { issuedAtMs: 1_800_000_000_000, expiresAtMs: 1_800_000_000_000 },
    { expiresAtMs: 1_800_000_000_000 + DEVICE_PROOF_MAX_CHALLENGE_LIFETIME_MS + 1 },
  ];
  for (const override of invalid) {
    assert.throws(() => canonicalizeDeviceProofChallenge(makeChallenge(override)));
  }
});

test("payload hashing is deterministic and enforces the byte budget", () => {
  assert.equal(
    hashCanonicalDeviceProofPayload('{"operation":"listDevices","payload":{}}'),
    hashCanonicalDeviceProofPayload('{"operation":"listDevices","payload":{}}'),
  );
  assert.throws(() => hashCanonicalDeviceProofPayload(""));
  assert.throws(() => hashCanonicalDeviceProofPayload("x".repeat(16_385)));
});

test("P-256 signatures verify only for the exact canonical message", () => {
  const message = canonicalizeDeviceProofChallenge(makeChallenge());
  const signed = createSignedMessage(message);
  assert.equal(verifyDeviceProofSignature({ ...signed, message }), true);
  assert.equal(verifyDeviceProofSignature({ ...signed, message: message + "x" }), false);
  assert.equal(verifyDeviceProofSignature({ ...signed, message: "unrelated-protocol\\n" + message }), false);
});

test("signature verification rejects malformed, wrong-curve and wrong-length inputs", () => {
  const message = canonicalizeDeviceProofChallenge(makeChallenge());
  const valid = createSignedMessage(message);
  assert.equal(verifyDeviceProofSignature({ ...valid, message, signatureBase64Url: "!" }), false);
  assert.equal(verifyDeviceProofSignature({ ...valid, message, signatureBase64Url: b64url(Buffer.alloc(63)) }), false);
  assert.equal(verifyDeviceProofSignature({ ...valid, message, publicKeySpkiBase64: "not-base64" }), false);

  const wrongCurve = generateKeyPairSync("ec", { namedCurve: "secp384r1" });
  const wrongPublicKey = wrongCurve.publicKey.export({ type: "spki", format: "der" }).toString("base64");
  assert.equal(verifyDeviceProofSignature({ ...valid, message, publicKeySpkiBase64: wrongPublicKey }), false);
  assert.equal(verifyDeviceProofSignature({ ...valid, message: "", }), false);
});
