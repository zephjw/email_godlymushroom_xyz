import { beforeEach, describe, expect, it } from 'vitest';
import { sessionService } from '../services';
import { requireSession } from '../middleware/auth';

describe('Session Service', () => {
  beforeEach(() => {
    sessionService.clear();
  });

  it('creates and retrieves a valid session', () => {
    const token = sessionService.createSession('admin@godlymushroom.xyz', 'secretpass');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    const session = sessionService.getSession(token);
    expect(session).not.toBeNull();
    expect(session.email).toBe('admin@godlymushroom.xyz');
    expect(session.password).toBe('secretpass');
  });

  it('deletes an existing session', () => {
    const token = sessionService.createSession('user@godlymushroom.xyz', 'pwd');
    expect(sessionService.deleteSession(token)).toBe(true);
    expect(sessionService.getSession(token)).toBeNull();
  });

  it('returns null for non-existent token', () => {
    expect(sessionService.getSession('non-existent-token')).toBeNull();
  });
});

describe('RequireSession Middleware', () => {
  beforeEach(() => {
    sessionService.clear();
  });

  it('returns 401 when no session cookie is provided', () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireSession(req, res, next);
    expect(statusSent).toBe(401);
    expect(jsonSent).toEqual({ message: 'Your session has expired' });
    expect(nextCalled).toBe(false);
  });

  it('attaches mailSession and calls next for valid cookie', () => {
    const token = sessionService.createSession('user@godlymushroom.xyz', 'pwd');
    const req = {
      headers: {
        cookie: `wm_session=${token}`,
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    const res = {};

    requireSession(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.mailSession).toBeDefined();
    expect(req.mailSession.email).toBe('user@godlymushroom.xyz');
  });
});
