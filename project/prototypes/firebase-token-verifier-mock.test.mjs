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
  assert.throws(() => verify(token({ claims: { exp: now - 61 } })), /token-expired/);
  assert.throws(() => verify(token({ claims: { iat: now + 61 } })), /issued-in-future/);
  assert.throws(() => verify(token({ claims: { nbf: now + 61 } })), /not-yet-valid/);
  assert.throws(() => verify(token({ claims: { exp: 'later' } })), /invalid-time-claims/);
  assert.throws(() => verify(token({ claims: { iat: now + 20, exp: now + 10 } })), /invalid-time-order/);
});

test('fails closed when verifier configuration is absent', () => {
  assert.throws(() => verifySyntheticFirebaseIdToken(token(), { projectId: '', keys, now }), /verifier-misconfigured/);
  assert.throws(() => verifySyntheticFirebaseIdToken(token(), { projectId: 'synthetic-project', now }), /verifier-misconfigured/);
});

test('small clock skew is tolerated but does not bypass expiry indefinitely', () => {
  // Keep iat before exp so these cases test expiry/skew rather than inconsistent claims.
  assert.equal(verify(token({ claims: { iat: now - 3600, exp: now - 30 } })).uid, 'synthetic-user');
  assert.throws(
    () => verify(token({ claims: { iat: now - 3600, exp: now - 61 } })),
    /token-expired/,
  );
});
