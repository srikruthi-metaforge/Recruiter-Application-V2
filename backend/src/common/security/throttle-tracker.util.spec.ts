import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { accountTracker, isCredentialRequest, sessionTracker } from './throttle-tracker.util';

describe('throttle tracker', () => {
  it('counts each recruiter login separately even from the same office IP', () => {
    const shared = { method: 'POST', originalUrl: '/api/v1/auth/login', ip: '203.0.113.10' };
    const a = accountTracker({ ...shared, body: { email: 'Recruiter.A@company.com' } });
    const b = accountTracker({ ...shared, body: { email: 'recruiter.b@company.com' } });
    assert.equal(a, 'acct:recruiter.a@company.com');
    assert.notEqual(a, b);
    assert.equal(isCredentialRequest(shared), true);
  });

  it('counts signed-in work per user, not per shared IP', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/requirements',
      ip: '203.0.113.10',
      user: { userId: 'user-22', id: 'abc' },
    };
    assert.equal(sessionTracker(req), 'user:user-22');
    assert.equal(isCredentialRequest(req), false);
  });

  it('falls back to the access cookie when req.user is not set yet', () => {
    const payload = Buffer.from(JSON.stringify({ userId: 'user-9', sub: 'mongo' })).toString('base64url');
    const token = `hdr.${payload}.sig`;
    const tracker = sessionTracker({
      method: 'GET',
      url: '/api/v1/users',
      ip: '203.0.113.10',
      headers: { cookie: `access_token=${token}` },
    });
    assert.equal(tracker, 'user:user-9');
  });
});
