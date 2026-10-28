import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSyntheticKey,
  signSyntheticFirebaseToken,
  verifySyntheticFirebaseIdToken,
} from './firebase-token-verifier-mock.mjs';

const now = 1_800_000_000;
const key = createSyntheticKey();
const otherKey = createSyntheticKey('other-key');
const keys = [{ kid: key.kid, publicKey: key.publicKey }];

function verify(token, overrides = {}) {
  return verifySyntheticFirebaseIdToken(token, {
    projectId: 'synthetic-project',
    keys,
    now,
    ...overrides,
  });
}
function token(overrides = {}) {
  return signSyntheticFirebaseToken({ key, now, ...overrides });
}

test('accepts a correctly signed synthetic Firebase-style token and derives UID from sub', () => {
  const result = verify(token({ uid: 'user-from-signed-sub' }));
  assert.equal(result.uid, 'user-from-signed-sub');
  assert.equal(result.projectId, 'synthetic-project');
});

test('rejects malformed, oversized, and non-three-part tokens', () => {
  assert.throws(() => verify('nope'), /invalid-token/);
  assert.throws(() => verify('a.b.c.d'), /invalid-token/);
  assert.throws(() => verify('x'.repeat(16_385)), /invalid-token/);
});

test('rejects unknown kid and invalid signatures', () => {
  assert.throws(() => verify(token({ header: { kid: 'missing-key' } })), /unknown-kid/);
  const signedByOther = signSyntheticFirebaseToken({ key: otherKey, now });
  assert.throws(() => verify(signedByOther), /unknown-kid/);
  const parts = token().split('.');
  parts[1] = Buffer.from(JSON.stringify({
    iss: 'https://securetoken.google.com/synthetic-project',
    aud: 'synthetic-project', sub: 'tampered-user', iat: now, exp: now + 3600,
  })).toString('base64url');
  assert.throws(() => verify(parts.join('.')), /invalid-signature/);
});

test('rejects non-RS256 algorithms', () => {
  assert.throws(() => verify(token({ header: { alg: 'none' } })), /invalid-algorithm/);
  assert.throws(() => verify(token({ header: { alg: 'HS256' } })), /invalid-algorithm/);
});

test('rejects wrong issuer, audience, empty subject, and oversized subject', () => {
  assert.throws(() => verify(token({ claims: { iss: 'https://attacker.invalid' } })), /wrong-issuer/);
  assert.throws(() => verify(token({ claims: { aud: 'other-project' } })), /wrong-audience/);
  assert.throws(() => verify(token({ claims: { sub: '' } })), /invalid-subject/);
  assert.throws(() => verify(token({ claims: { sub: 'x'.repeat(129) } })), /invalid-subject/);
});

test('rejects expired, future-issued, not-yet-valid, malformed, and inconsistent time claims', () => {
  assert.throws(() => verify(token({ claims: { iat: now - 3600, auth_time: now - 3600, exp: now - 61 } })), /token-expired/);
  assert.throws(() => verify(token({ claims: { iat: now + 61 } })), /issued-in-future/);
  assert.throws(() => verify(token({ claims: { nbf: now + 61 } })), /not-yet-valid/);
  assert.throws(() => verify(token({ claims: { exp: 'later' } })), /invalid-time-claims/);
  assert.throws(() => verify(token({ claims: { iat: now + 20, auth_time: now, exp: now + 10 } })), /invalid-time-order/);
});

test('fails closed when verifier configuration is absent', () => {
  assert.throws(() => verifySyntheticFirebaseIdToken(token(), { projectId: '', keys, now }), /verifier-misconfigured/);
  assert.throws(() => verifySyntheticFirebaseIdToken(token(), { projectId: 'synthetic-project', now }), /verifier-misconfigured/);
});

test('small clock skew is tolerated but does not bypass expiry indefinitely', () => {
  // Keep iat before exp so these cases test expiry/skew rather than inconsistent claims.
  assert.equal(verify(token({ claims: { iat: now - 3600, auth_time: now - 3600, exp: now - 30 } })).uid, 'synthetic-user');
  assert.throws(
    () => verify(token({ claims: { iat: now - 3600, auth_time: now - 3600, exp: now - 61 } })),
    /token-expired/,
  );
});


test('requires a valid auth_time claim and rejects future authentication times', () => {
  assert.throws(() => verify(token({ claims: { auth_time: undefined } })), /invalid-time-claims/);
  assert.throws(() => verify(token({ claims: { auth_time: 'recently' } })), /invalid-time-claims/);
  assert.throws(() => verify(token({ claims: { auth_time: now + 61 } })), /auth-time-in-future/);
  assert.throws(() => verify(token({ claims: { iat: now - 10, auth_time: now } })), /invalid-time-order/);
  assert.equal(verify(token({ claims: { auth_time: now - 10 } })).uid, 'synthetic-user');
});

test('rejects invalid verifier clock configuration and unsafe skew values', () => {
  for (const badNow of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 'now']) {
    assert.throws(() => verify(token(), { now: badNow }), /verifier-misconfigured/);
  }
  for (const badSkew of [-1, 1.5, 301, Infinity, '60']) {
    assert.throws(() => verify(token(), { clockSkewSeconds: badSkew }), /verifier-misconfigured/);
  }
  assert.throws(() => verify(token(), { clockSkewSeconds: 0.5 }), /verifier-misconfigured/);
});

test('rejects invalid token segment encodings and malformed UTF-8', () => {
  assert.throws(() => verify('a!.b.c'), /invalid-token/);
  const malformedUtf8 = Buffer.from([0xff, 0xfe]).toString('base64url');
  const validParts = token().split('.');
  assert.throws(() => verify([malformedUtf8, validParts[1], validParts[2]].join('.')), /invalid-token/);
  assert.throws(() => verify([validParts[0], validParts[1], '%%%'].join('.')), /invalid-signature/);
});

test('requires JWT type and rejects duplicate or malformed key records', () => {
  assert.throws(() => verify(token({ header: { typ: 'JWE' } })), /invalid-token-type/);
  assert.throws(() => verify(token(), { keys: [...keys, ...keys] }), /verifier-misconfigured/);
  assert.throws(() => verify(token(), { keys: [{ kid: '', publicKey: key.publicKey }] }), /verifier-misconfigured/);
  assert.throws(() => verify(token(), { keys: [{ kid: key.kid }] }), /verifier-misconfigured/);
});
