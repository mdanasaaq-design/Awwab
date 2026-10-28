/**
 * LOCAL-ONLY Firebase ID-token verification model.
 * Uses synthetic RSA keys/tokens only. No network, provider SDK, secrets, or live tokens.
 * This is a test harness, NOT a production JWKS fetch/cache implementation.
 */
import {
  createPublicKey,
  createSign,
  createVerify,
  generateKeyPairSync,
} from 'node:crypto';

const MAX_TOKEN_LENGTH = 16_384;
const CLOCK_SKEW_SECONDS = 60;
const MAX_CLOCK_SKEW_SECONDS = 300;

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function decodeBase64url(segment) {
  if (typeof segment !== 'string' || !segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error('invalid-token');
  }
  const decoded = Buffer.from(segment, 'base64url');
  if (decoded.toString('base64url') !== segment) throw new Error('invalid-token');
  return decoded;
}

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeJson(segment) {
  try {
    const bytes = decodeBase64url(segment);
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const parsed = JSON.parse(json);
    if (!isPlainObject(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error('invalid-token');
  }
}

export function createSyntheticKey(kid = 'synthetic-key-1') {
  const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return { kid, privateKey: pair.privateKey, publicKey: pair.publicKey };
}

export function signSyntheticFirebaseToken({
  key,
  projectId = 'synthetic-project',
  uid = 'synthetic-user',
  now = 1_800_000_000,
  header = {},
  claims = {},
} = {}) {
  const encodedHeader = encodeJson({ alg: 'RS256', typ: 'JWT', kid: key.kid, ...header });
  const encodedClaims = encodeJson({
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    sub: uid,
    iat: now,
    auth_time: now,
    exp: now + 3600,
    ...claims,
  });
  const signingInput = `${encodedHeader}.${encodedClaims}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  return `${signingInput}.${signer.sign(key.privateKey).toString('base64url')}`;
}

/**
 * Verifies a JWT against an explicitly supplied key set.
 * Production must obtain/cache keys from Google's official certificate endpoint and
 * respect Cache-Control max-age. This function intentionally performs no network I/O.
 * Configuration and parser checks here are defense-in-depth for this synthetic model;
 * they do not replace a maintained JWT library or Firebase Admin SDK.
 */
export function verifySyntheticFirebaseIdToken(token, {
  projectId,
  keys,
  now = Math.floor(Date.now() / 1000),
  clockSkewSeconds = CLOCK_SKEW_SECONDS,
} = {}) {
  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    throw new Error('invalid-token');
  }
  if (typeof projectId !== 'string' || !/^[a-z0-9][a-z0-9-]{0,127}$/.test(projectId) ||
      !Array.isArray(keys) || !Number.isSafeInteger(now) || now < 0 ||
      !Number.isSafeInteger(clockSkewSeconds) || clockSkewSeconds < 0 ||
      clockSkewSeconds > MAX_CLOCK_SKEW_SECONDS) {
    throw new Error('verifier-misconfigured');
  }
  const seenKids = new Set();
  for (const item of keys) {
    if (!isPlainObject(item) || typeof item.kid !== 'string' ||
        !/^[A-Za-z0-9._-]{1,256}$/.test(item.kid) || !item.publicKey || seenKids.has(item.kid)) {
      throw new Error('verifier-misconfigured');
    }
    seenKids.add(item.kid);
  }
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) throw new Error('invalid-token');
  const header = decodeJson(parts[0]);
  const claims = decodeJson(parts[1]);

  if (header.alg !== 'RS256') throw new Error('invalid-algorithm');
  if (header.typ !== 'JWT') throw new Error('invalid-token-type');
  if (typeof header.kid !== 'string' || !/^[A-Za-z0-9._-]{1,256}$/.test(header.kid)) {
    throw new Error('invalid-kid');
  }
  const keyRecord = keys.find((item) => item.kid === header.kid);
  if (!keyRecord) throw new Error('unknown-kid');

  let publicKey;
  try {
    // createPublicKey() rejects an existing public KeyObject in some Node versions;
    // accept it directly, while still importing PEM/DER-style key material when supplied.
    publicKey = keyRecord.publicKey?.type === 'public'
      ? keyRecord.publicKey
      : createPublicKey(keyRecord.publicKey);
  } catch {
    throw new Error('invalid-verification-key');
  }
  if (publicKey.asymmetricKeyType !== 'rsa' ||
      (publicKey.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
    throw new Error('invalid-verification-key');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  let signature;
  try {
    signature = decodeBase64url(parts[2]);
  } catch {
    throw new Error('invalid-signature');
  }
  let validSignature = false;
  try {
    validSignature = verifier.verify(publicKey, signature);
  } catch {
    validSignature = false;
  }
  if (!validSignature) throw new Error('invalid-signature');

  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('wrong-issuer');
  if (claims.aud !== projectId) throw new Error('wrong-audience');
  if (typeof claims.sub !== 'string' || claims.sub.length === 0 || claims.sub.length > 128) {
    throw new Error('invalid-subject');
  }
  if (!Number.isSafeInteger(claims.exp) || claims.exp < 0 ||
      !Number.isSafeInteger(claims.iat) || claims.iat < 0 ||
      !Number.isSafeInteger(claims.auth_time) || claims.auth_time < 0 ||
      (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf < 0))) {
    throw new Error('invalid-time-claims');
  }
  if (claims.exp <= now - clockSkewSeconds) throw new Error('token-expired');
  if (claims.iat > now + clockSkewSeconds) throw new Error('issued-in-future');
  if (claims.auth_time > now + clockSkewSeconds) throw new Error('auth-time-in-future');
  if (claims.auth_time > claims.iat + clockSkewSeconds) throw new Error('invalid-time-order');
  if (claims.nbf !== undefined && claims.nbf > now + clockSkewSeconds) {
    throw new Error('not-yet-valid');
  }
  if (claims.iat > claims.exp) throw new Error('invalid-time-order');

  return Object.freeze({ uid: claims.sub, projectId, issuer: claims.iss });
}
