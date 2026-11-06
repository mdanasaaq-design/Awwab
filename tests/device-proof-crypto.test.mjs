import assert from "node:assert/strict";
import { generateKeyPairSync, sign, webcrypto } from "node:crypto";
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

function derEcdsaToP1363(der) {
  let offset = 0;
  const readLength = () => {
    const first = der[offset++];
    if (first === undefined) throw new Error("Truncated DER length");
    if (first < 0x80) return first;
    const count = first & 0x7f;
    if (count < 1 || count > 2 || offset + count > der.length) throw new Error("Invalid DER length");
    let length = 0;
    for (let i = 0; i < count; i++) length = (length * 256) + der[offset++];
    if (length < 0x80) throw new Error("Non-minimal DER length");
    return length;
  };
  if (der[offset++] !== 0x30) throw new Error("Expected DER sequence");
  const sequenceLength = readLength();
  if (offset + sequenceLength !== der.length) throw new Error("Invalid DER sequence length");
  const readInteger = () => {
    if (der[offset++] !== 0x02) throw new Error("Expected DER integer");
    const length = readLength();
    if (length < 1 || offset + length > der.length) throw new Error("Invalid DER integer length");
    let value = der.subarray(offset, offset + length);
    offset += length;
    if ((value[0] & 0x80) !== 0) throw new Error("Negative DER integer");
    if (value.length > 1 && value[0] === 0 && (value[1] & 0x80) === 0) {
      throw new Error("Non-minimal DER integer");
    }
    while (value.length > 1 && value[0] === 0) value = value.subarray(1);
    if (value.length > 32) throw new Error("ECDSA integer exceeds P-256 width");
    const padded = Buffer.alloc(32);
    value.copy(padded, 32 - value.length);
    return padded;
  };
  const r = readInteger();
  const s = readInteger();
  if (offset !== der.length) throw new Error("Unexpected DER trailing data");
  return Buffer.concat([r, s]);
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

test("Web Crypto P-256 signatures use the server's 64-byte P1363 wire format", async () => {
  const message = canonicalizeDeviceProofChallenge(makeChallenge());
  const pair = await webcrypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign", "verify"],
  );
  const publicKey = Buffer.from(await webcrypto.subtle.exportKey("spki", pair.publicKey));
  const signature = Buffer.from(await webcrypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    pair.privateKey,
    Buffer.from(message, "utf8"),
  ));
  assert.equal(signature.length, 64);
  assert.equal(verifyDeviceProofSignature({
    publicKeySpkiBase64: publicKey.toString("base64"),
    signatureBase64Url: b64url(signature),
    message,
  }), true);
});

test("DER ECDSA signatures normalize to the fixed-width P1363 reference format", () => {
  const message = canonicalizeDeviceProofChallenge(makeChallenge());
  const pair = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const publicKeySpkiBase64 = pair.publicKey.export({ type: "spki", format: "der" }).toString("base64");
  const derSignature = sign("sha256", Buffer.from(message, "utf8"), {
    key: pair.privateKey,
    dsaEncoding: "der",
  });
  const normalized = derEcdsaToP1363(derSignature);
  assert.equal(normalized.length, 64);
  assert.equal(verifyDeviceProofSignature({
    publicKeySpkiBase64,
    signatureBase64Url: b64url(normalized),
    message,
  }), true);
  assert.throws(() => derEcdsaToP1363(Buffer.from([0x30, 0x00])));
});
