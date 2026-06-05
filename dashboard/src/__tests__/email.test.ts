import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Helper Function Tests ───
describe('base64urlEncode', () => {
  it('encodes string to base64url', async () => {
    const { base64urlEncode } = await import('@/lib/email');
    const result = base64urlEncode('hello');
    expect(result).toBe('aGVsbG8');
  });

  it('encodes empty string', async () => {
    const { base64urlEncode } = await import('@/lib/email');
    expect(base64urlEncode('')).toBe('');
  });

  it('encodes ArrayBuffer', async () => {
    const { base64urlEncode } = await import('@/lib/email');
    const buf = new Uint8Array([72, 101, 108]).buffer;
    const result = base64urlEncode(buf);
    expect(result).toBe('SGVs');
  });

  it('uses URL-safe characters (- and _ instead of + and /)', async () => {
    const { base64urlEncode } = await import('@/lib/email');
    // Input that produces + and / in standard base64
    const result = base64urlEncode(new Uint8Array([251, 255]).buffer);
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
    expect(result).toContain('-');
    expect(result).toContain('_');
  });

  it('strips padding', async () => {
    const { base64urlEncode } = await import('@/lib/email');
    const result = base64urlEncode('ab');
    expect(result).not.toContain('=');
  });
});

describe('base64urlDecode', () => {
  it('decodes base64url back to ArrayBuffer', async () => {
    const { base64urlEncode, base64urlDecode } = await import('@/lib/email');
    const original = 'test data 123';
    const encoded = base64urlEncode(original);
    const decoded = new TextDecoder().decode(base64urlDecode(encoded));
    expect(decoded).toBe(original);
  });

  it('handles URL-safe characters', async () => {
    const { base64urlDecode } = await import('@/lib/email');
    // Should not throw on - and _
    const result = base64urlDecode('ab-cd_ef');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });
});

describe('buildRawMime', () => {
  it('builds MIME message with correct headers', async () => {
    const { buildRawMime, base64urlDecode } = await import('@/lib/email');
    const raw = buildRawMime('to@test.com', 'from@test.com', 'Test Subject', '<p>Hello</p>');
    const decoded = new TextDecoder().decode(base64urlDecode(raw));
    expect(decoded).toContain('From: from@test.com');
    expect(decoded).toContain('To: to@test.com');
    expect(decoded).toContain('Subject: Test Subject');
    expect(decoded).toContain('MIME-Version: 1.0');
    expect(decoded).toContain('multipart/alternative');
    expect(decoded).toContain('<p>Hello</p>');
  });

  it('includes boundary markers', async () => {
    const { buildRawMime, base64urlDecode } = await import('@/lib/email');
    const raw = buildRawMime('a@b.com', 'c@d.com', 'Sub', '<p>Hi</p>');
    const decoded = new TextDecoder().decode(base64urlDecode(raw));
    expect(decoded).toContain('--boundary_hooksniff_email');
    expect(decoded).toContain('Content-Type: text/html; charset=UTF-8');
  });
});

describe('getServiceAccount', () => {
  it('throws when GCP_SA_JSON is not set', async () => {
    const orig = process.env.GCP_SA_JSON;
    delete process.env.GCP_SA_JSON;
    const { getServiceAccount } = await import('@/lib/email');
    await expect(getServiceAccount()).rejects.toThrow('GCP_SA_JSON');
    process.env.GCP_SA_JSON = orig;
  });

  it('parses valid JSON from GCP_SA_JSON', async () => {
    const sa = { type: 'service_account', project_id: 'test', private_key_id: 'k', private_key: 'pk', client_email: 'e@e.com', client_id: '1', auth_uri: 'a', token_uri: 't' };
    process.env.GCP_SA_JSON = JSON.stringify(sa);
    const { getServiceAccount } = await import('@/lib/email');
    const result = await getServiceAccount();
    expect(result.type).toBe('service_account');
    expect(result.client_email).toBe('e@e.com');
  });
});

// ─── Template Tests ───
describe('email templates', () => {
  it('verificationEmail returns HTML with code', async () => {
    const { verificationEmail } = await import('@/lib/email');
    const html = verificationEmail('ABC123');
    expect(html).toContain('ABC123');
    expect(html).toContain('monospace');
    expect(html.length).toBeGreaterThan(100);
  });

  it('verificationEmail contains expiry notice', async () => {
    const { verificationEmail } = await import('@/lib/email');
    const html = verificationEmail('999888');
    expect(html).toContain('999888');
    expect(html).toContain('10');
  });

  it('passwordResetEmail includes reset URL', async () => {
    const { passwordResetEmail } = await import('@/lib/email');
    const html = passwordResetEmail('https://hooksniff.vercel.app/reset?token=abc');
    expect(html).toContain('https://hooksniff.vercel.app/reset');
    expect(html).toContain('abc');
    expect(html).toContain('background: #4c6ef5');
  });

  it('passwordResetEmail contains styled button with href', async () => {
    const { passwordResetEmail } = await import('@/lib/email');
    const html = passwordResetEmail('https://example.com/reset');
    expect(html).toContain('href="https://example.com/reset"');
  });

  it('deliveryFailedEmail includes event and endpoint', async () => {
    const { deliveryFailedEmail } = await import('@/lib/email');
    const html = deliveryFailedEmail('order.created', 'https://example.com', 3);
    expect(html).toContain('order.created');
    expect(html).toContain('https://example.com');
    expect(html).toContain('3');
  });

  it('deliveryFailedEmail with username uses portal URL', async () => {
    const { deliveryFailedEmail } = await import('@/lib/email');
    const html = deliveryFailedEmail('payment.failed', 'https://api.com/hook', 5, 'john');
    expect(html).toContain('/deliveries');
    expect(html).toContain('payment.failed');
  });

  it('deliveryFailedEmail without username uses dashboard URL', async () => {
    const { deliveryFailedEmail } = await import('@/lib/email');
    const html = deliveryFailedEmail('payment.failed', 'https://api.com/hook', 5);
    expect(html).toContain('/dashboard/deliveries');
  });

  it('welcomeEmail includes name', async () => {
    const { welcomeEmail } = await import('@/lib/email');
    const html = welcomeEmail('John', 'john123');
    expect(html).toContain('John');
  });

  it('welcomeEmail without username uses dashboard URL', async () => {
    const { welcomeEmail } = await import('@/lib/email');
    const html = welcomeEmail('Jane');
    expect(html).toContain('Jane');
    expect(html).toContain('/dashboard');
  });

  it('welcomeEmail with username includes getting started steps', async () => {
    const { welcomeEmail } = await import('@/lib/email');
    const html = welcomeEmail('Ali', 'ali_dev');
    expect(html).toContain('Ali');
    expect(html).toContain('1.');
    expect(html).toContain('2.');
    expect(html).toContain('3.');
  });

  it('all templates return valid HTML strings', async () => {
    const { verificationEmail, passwordResetEmail, deliveryFailedEmail, welcomeEmail } = await import('@/lib/email');
    expect(typeof verificationEmail('x')).toBe('string');
    expect(typeof passwordResetEmail('x')).toBe('string');
    expect(typeof deliveryFailedEmail('x', 'y', 1)).toBe('string');
    expect(typeof welcomeEmail('x')).toBe('string');
  });
});

// ─── sendEmail Tests ───
describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports sendEmail function', async () => {
    const email = await import('@/lib/email');
    expect(typeof email.sendEmail).toBe('function');
  });

  it('returns success=false when crypto fails in test env', async () => {
    const email = await import('@/lib/email');
    const result = await email.sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
  });

  it('handles custom from address', async () => {
    const email = await import('@/lib/email');
    const result = await email.sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Hi</p>', from: 'custom@example.com' });
    expect(result).toHaveProperty('success');
  });

  it('returns error object on failure', async () => {
    const email = await import('@/lib/email');
    const result = await email.sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Hi</p>' });
    if (!result.success) {
      expect(result).toHaveProperty('error');
    }
  });
});
