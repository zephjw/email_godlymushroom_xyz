import { describe, expect, it } from 'vitest';
import { UserSession, EmailSummary, EmailDetail } from '../models';

describe('Models', () => {
  it('creates UserSession with normalized email', () => {
    const session = new UserSession('  Alice@GodlyMushroom.XYZ  ', 'pass123');
    expect(session.email).toBe('alice@godlymushroom.xyz');
    expect(session.password).toBe('pass123');
    expect(session.createdAt).toBeInstanceOf(Date);
    expect(session.toJSON()).toEqual({
      email: 'alice@godlymushroom.xyz',
      createdAt: session.createdAt,
    });
  });

  it('creates EmailSummary with default values', () => {
    const summary = new EmailSummary({
      uid: 101,
      from: 'sender@example.com',
      subject: 'Test Subject',
    });
    expect(summary.uid).toBe(101);
    expect(summary.from).toBe('sender@example.com');
    expect(summary.subject).toBe('Test Subject');
    expect(summary.to).toBe('');
    expect(summary.date).toBe('');
    expect(summary.preview).toBe('');
  });

  it('creates EmailDetail with all fields', () => {
    const detail = new EmailDetail({
      uid: 202,
      from: 'sender@example.com',
      to: 'me@godlymushroom.xyz',
      subject: 'Detailed Subject',
      date: '2026-11-09',
      text: 'Hello text',
      html: '<p>Hello html</p>',
    });
    expect(detail.uid).toBe(202);
    expect(detail.text).toBe('Hello text');
    expect(detail.html).toBe('<p>Hello html</p>');
  });
});
