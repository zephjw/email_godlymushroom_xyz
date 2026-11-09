import { describe, expect, it } from 'vitest';
import { isValidMailbox, isValidRecipient, validateSendPayload } from '../utils/validator';
import { serializeCookie, parseCookie } from '../utils/cookie';
import { sanitizeEmailHtml } from '../utils/sanitizer';

describe('Validator Utilities', () => {
  it('validates mailbox domain correctly', () => {
    expect(isValidMailbox('user@godlymushroom.xyz', 'godlymushroom.xyz')).toBe(true);
    expect(isValidMailbox('USER@GODLYMUSHROOM.XYZ', 'godlymushroom.xyz')).toBe(true);
    expect(isValidMailbox('invalid-email', 'godlymushroom.xyz')).toBe(false);
    expect(isValidMailbox('user@otherdomain.com', 'godlymushroom.xyz')).toBe(false);
    expect(isValidMailbox('', 'godlymushroom.xyz')).toBe(false);
  });

  it('validates recipient email address syntax', () => {
    expect(isValidRecipient('test@example.com')).toBe(true);
    expect(isValidRecipient('not-an-email')).toBe(false);
    expect(isValidRecipient('')).toBe(false);
  });

  it('validates send payload correctly', () => {
    const valid = {
      to: 'recipient@example.com',
      subject: 'Hello',
      text: 'Message body',
    };
    expect(validateSendPayload(valid)).toEqual({ valid: true });

    expect(validateSendPayload({ ...valid, to: 'bad' })).toEqual({
      valid: false,
      message: 'Enter a valid recipient',
    });

    expect(validateSendPayload({ ...valid, subject: '' })).toEqual({
      valid: false,
      message: 'Subject and message are required',
    });

    expect(validateSendPayload({ ...valid, text: '   ' })).toEqual({
      valid: false,
      message: 'Subject and message are required',
    });
  });
});

describe('Cookie Utilities', () => {
  it('serializes and parses cookies correctly', () => {
    const cookieHeader = serializeCookie('wm_session', 'test-token-123', 3600);
    expect(cookieHeader).toContain('wm_session=test-token-123');
    expect(cookieHeader).toContain('Max-Age=3600');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Strict');

    const parsed = parseCookie('other=1; wm_session=test-token-123; foo=bar', 'wm_session');
    expect(parsed).toBe('test-token-123');

    const missing = parseCookie('other=1; foo=bar', 'wm_session');
    expect(missing).toBeNull();
  });
});

describe('Sanitizer Utility', () => {
  it('strips malicious script tags from HTML', () => {
    const dirty = '<p>Hello <script>alert("xss")</script>world</p>';
    const clean = sanitizeEmailHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello world</p>');
  });

  it('handles empty or null html safely', () => {
    expect(sanitizeEmailHtml('')).toBe('');
    expect(sanitizeEmailHtml(null)).toBe('');
  });
});
