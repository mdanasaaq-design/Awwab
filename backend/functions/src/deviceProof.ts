import { createHash, createPublicKey, verify, type KeyObject } from "node:crypto";

export const DEVICE_PROOF_PROTOCOL = "awwab-device-proof-v1";
export const DEVICE_PROOF_ALGORITHM = "ECDSA-P256-SHA256" as const;
export const DEVICE_PROOF_MAX_CHALLENGE_LIFETIME_MS = 120_000;
export const DEVICE_PROOF_MAX_PAYLOAD_BYTES = 16_384;

const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
const CHALLENGE_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

const PROTECTED_OPERATIONS = new Set([
  "registerDevice",
  "bootstrapFirstDevice",
  "listDevices",
  "approveDevice",
  "revokeDevice",
  "getAssistantMemoryContext",
  "runAssistant",
]);

export interface DeviceProofChallenge {
  challengeId: string;
  nonce: string;
  uid: string;
  deviceId: string;
  keyVersion: number;
  operation: string;
  targetId: string | null;
  payloadHash: string;
  issuedAtMs: number;
  expiresAtMs: number;
}

export interface DeviceProofVerificationInput {
  publicKeySpkiBase64: string;
  signatureBase64Url: string;
  message: string;
}

function isSafeTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function decodeCanonicalBase64(value: string): Buffer | null {
  if (!BASE64_PATTERN.test(value)) return null;
  const decoded = Buffer.from(value, "base64");
  return decoded.length > 0 && decoded.toString("base64") === value ? decoded : null;
}

function decodeCanonicalBase64Url(value: string): Buffer | null {
  if (!BASE64URL_PATTERN.test(value)) return null;
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const decoded = Buffer.from(padded, "base64");
  const canonical = decoded.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return decoded.length > 0 && canonical === value ? decoded : null;
}

/**
 * Serialize a challenge as a fixed-position JSON array with a protocol prefix.
 * The array avoids object-key ordering ambiguity; the prefix provides domain
 * separation from signatures created for unrelated Awwab protocols.
 */
export function canonicalizeDeviceProofChallenge(challenge: DeviceProofChallenge): string {
  if (!challenge || typeof challenge !== "object") {
    throw new TypeError("A device proof challenge is required.");
  }
  if (typeof challenge.challengeId !== "string" || !CHALLENGE_ID_PATTERN.test(challenge.challengeId)) {
    throw new TypeError("challengeId is invalid.");
  }
  const nonce = typeof challenge.nonce === "string" ? decodeCanonicalBase64Url(challenge.nonce) : null;
  if (!nonce || nonce.length !== 32) {
    throw new TypeError("nonce must be a canonical 256-bit base64url value.");
  }
  if (typeof challenge.uid !== "string" || challenge.uid.length < 1 || challenge.uid.length > 128) {
    throw new TypeError("uid is invalid.");
  }
  if (typeof challenge.deviceId !== "string" || !DEVICE_ID_PATTERN.test(challenge.deviceId)) {
    throw new TypeError("deviceId is invalid.");
  }
  if (!Number.isSafeInteger(challenge.keyVersion) || challenge.keyVersion < 1) {
    throw new TypeError("keyVersion must be a positive safe integer.");
  }
  if (typeof challenge.operation !== "string" || !PROTECTED_OPERATIONS.has(challenge.operation)) {
    throw new TypeError("operation is not in the protected operation allowlist.");
  }
  if (challenge.targetId !== null &&
      (typeof challenge.targetId !== "string" || !DEVICE_ID_PATTERN.test(challenge.targetId))) {
    throw new TypeError("targetId must be null or a valid device identifier.");
  }
  if (typeof challenge.payloadHash !== "string" || !HASH_PATTERN.test(challenge.payloadHash)) {
    throw new TypeError("payloadHash must be a lowercase SHA-256 hex digest.");
  }
  if (!isSafeTimestamp(challenge.issuedAtMs) || !isSafeTimestamp(challenge.expiresAtMs) ||
      challenge.expiresAtMs <= challenge.issuedAtMs) {
    throw new TypeError("Challenge timestamps are invalid.");
  }
  if (challenge.expiresAtMs - challenge.issuedAtMs > DEVICE_PROOF_MAX_CHALLENGE_LIFETIME_MS) {
    throw new TypeError("Challenge lifetime exceeds the protocol maximum.");
  }

  return `${DEVICE_PROOF_PROTOCOL}\n${JSON.stringify([
    challenge.challengeId,
    challenge.nonce,
    challenge.uid,
    challenge.deviceId,
    challenge.keyVersion,
    challenge.operation,
    challenge.targetId,
    challenge.payloadHash,
    challenge.issuedAtMs,
    challenge.expiresAtMs,
  ])}`;
}

/** Hash the exact canonical payload string that the server bound to a challenge. */
export function hashCanonicalDeviceProofPayload(canonicalPayload: string): string {
  if (typeof canonicalPayload !== "string" || canonicalPayload.length === 0) {
    throw new TypeError("A non-empty canonical payload string is required.");
  }
  const bytes = Buffer.from(canonicalPayload, "utf8");
  if (bytes.length > DEVICE_PROOF_MAX_PAYLOAD_BYTES) {
    throw new TypeError("Canonical payload exceeds the protocol size limit.");
  }
  return createHash("sha256").update(bytes).digest("hex");
}

function importP256PublicKey(spkiBase64: string): KeyObject | null {
  if (typeof spkiBase64 !== "string" || spkiBase64.length > 2048) return null;
  const der = decodeCanonicalBase64(spkiBase64);
  if (!der) return null;

  try {
    const key = createPublicKey({ key: der, format: "der", type: "spki" });
    if (key.asymmetricKeyType !== "ec" ||
        key.asymmetricKeyDetails?.namedCurve !== "prime256v1") return null;
    return key;
  } catch {
    return null;
  }
}

/**
 * Verify the protocol's canonical 64-byte IEEE-P1363 ECDSA signature.
 * Browser Web Crypto returns this fixed-width form. Android clients must
 * normalize the DER signature returned by Android Keystore to this wire form.
 * Invalid or unsupported input fails closed without exposing parser details.
 */
export function verifyDeviceProofSignature(input: DeviceProofVerificationInput): boolean {
  if (!input || typeof input !== "object" ||
      typeof input.message !== "string" ||
      !input.message.startsWith(`${DEVICE_PROOF_PROTOCOL}\\n`) ||
      Buffer.byteLength(input.message, "utf8") > 32_768) return false;

  const key = importP256PublicKey(input.publicKeySpkiBase64);
  const signature = typeof input.signatureBase64Url === "string"
    ? decodeCanonicalBase64Url(input.signatureBase64Url)
    : null;
  if (!key || !signature || signature.length !== 64) return false;

  try {
    return verify(
      "sha256",
      Buffer.from(input.message, "utf8"),
      { key, dsaEncoding: "ieee-p1363" },
      signature,
    );
  } catch {
    return false;
  }
}
