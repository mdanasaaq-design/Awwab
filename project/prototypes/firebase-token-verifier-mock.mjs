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

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeJson(segment) {
  try {
    const parsed = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
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
 * Production must obtain/cache keys from Google's official JWKS endpoint and
 * respect cache headers. This function intentionally performs no network I/O.
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
  if (typeof projectId !== 'string' || !projectId || !Array.isArray(keys)) {
    throw new Error('verifier-misconfigured');
  }
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) throw new Error('invalid-token');
  const header = decodeJson(parts[0]);
  const claims = decodeJson(parts[1]);

  if (header.alg !== 'RS256') throw new Error('invalid-algorithm');
  if (typeof header.kid !== 'string' || !header.kid) throw new Error('invalid-kid');
  const keyRecord = keys.find((item) => item.kid === header.kid);
  if (!keyRecord) throw new Error('unknown-kid');

  let publicKey;
  try {
    publicKey = createPublicKey(keyRecord.publicKey);
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
  let validSignature = false;
  try {
    validSignature = verifier.verify(publicKey, Buffer.from(parts[2], 'base64url'));
  } catch {
    validSignature = false;
  }
  if (!validSignature) throw new Error('invalid-signature');

  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('wrong-issuer');
  if (claims.aud !== projectId) throw new Error('wrong-audience');
  if (typeof claims.sub !== 'string' || claims.sub.length === 0 || claims.sub.length > 128) {
    throw new Error('invalid-subject');
  }
  if (!Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.iat) ||
      (claims.nbf !== undefined && !Number.isSafeInteger(claims.nbf))) {
    throw new Error('invalid-time-claims');
  }
  if (claims.exp <= now - clockSkewSeconds) throw new Error('token-expired');
  if (claims.iat > now + clockSkewSeconds) throw new Error('issued-in-future');
  if (claims.nbf !== undefined && claims.nbf > now + clockSkewSeconds) {
    throw new Error('not-yet-valid');
  }
  if (claims.iat > claims.exp) throw new Error('invalid-time-order');

  return Object.freeze({ uid: claims.sub, projectId, issuer: claims.iss });
}
