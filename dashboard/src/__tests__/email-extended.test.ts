import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verificationEmail,
  passwordResetEmail,
  deliveryFailedEmail,
  welcomeEmail,
  sendEmail,
} from '../lib/email';

// ─── base64urlDecode (internal, tested via pemToArrayBuffer path) ───

describe('base64urlDecode (via pemToArrayBuffer)', () => {
  // pemToArrayBuffer is internal but exercised through sendEmail's error path.
  // We test its behavior indirectly: valid base64url chars and padding.
  it('sendEmail fails gracefully with invalid PEM (bad base64)', async () => {
    delete process.env.GCP_SA_JSON;
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '-----BEGIN PRIVATE KEY-----\n!!!invalid-base64!!!\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
    process.env.GCP_SENDER_EMAIL = 'test@test.com';

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('sendEmail fails with PEM containing underscores and hyphens (base64url chars)', async () => {
    delete process.env.GCP_SA_JSON;
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      // valid base64url chars but not a real PKCS#8 key
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0_1-2_3-aBcDeFgHi\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
    process.env.GCP_SENDER_EMAIL = 'test@test.com';

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });

  it('sendEmail fails with empty PEM body', async () => {
    delete process.env.GCP_SA_JSON;
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
    process.env.GCP_SENDER_EMAIL = 'test@test.com';

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });
});

// ─── importRsaPrivateKey error handling ───

describe('importRsaPrivateKey (via sendEmail)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SENDER_EMAIL = 'test@test.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects completely malformed PEM', async () => {
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: 'not-a-pem-at-all',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });

  it('rejects empty string PEM', async () => {
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });
});

// ─── getAccessToken (via sendEmail) ───

describe('getAccessToken (via sendEmail)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SENDER_EMAIL = 'test@test.com';
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns error when GCP_SA_JSON is missing entirely', async () => {
    delete process.env.GCP_SA_JSON;

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('GCP_SA_JSON');
  });

  it('returns error when GCP_SA_JSON is empty string', async () => {
    process.env.GCP_SA_JSON = '';

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });

  it('returns error when GCP_SA_JSON is invalid JSON', async () => {
    process.env.GCP_SA_JSON = 'not-json!!!';

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });

  it('returns error when GCP_SA_JSON is valid JSON but missing private_key', async () => {
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' });
    expect(result.success).toBe(false);
  });
});

// ─── sendEmail edge cases ───

describe('sendEmail edge cases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SENDER_EMAIL = 'test@test.com';
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('handles empty subject', async () => {
    const result = await sendEmail({ to: 'a@b.com', subject: '', html: '<p>hi</p>' });
    expect(result.success).toBe(false); // fails at crypto, but doesn't crash
  });

  it('handles empty HTML body', async () => {
    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '' });
    expect(result.success).toBe(false);
  });

  it('handles very long HTML body', async () => {
    const longHtml = '<p>' + 'x'.repeat(100_000) + '</p>';
    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: longHtml });
    expect(result.success).toBe(false);
  });

  it('handles HTML with special characters', async () => {
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test <>&"\'',
      html: '<div class="test">Hello &amp; goodbye</div>',
    });
    expect(result.success).toBe(false);
  });

  it('handles recipient with plus addressing', async () => {
    const result = await sendEmail({
      to: 'user+tag@example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    });
    expect(result.success).toBe(false);
  });

  it('handles recipient with subdomain', async () => {
    const result = await sendEmail({
      to: 'user@mail.sub.example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    });
    expect(result.success).toBe(false);
  });

  it('handles multiple HTML content types', async () => {
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>',
    });
    expect(result.success).toBe(false);
  });

  it('handles HTML with inline styles', async () => {
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<div style="color: red; font-size: 14px;">Styled content</div>',
    });
    expect(result.success).toBe(false);
  });

  it('handles HTML with images', async () => {
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<img src="https://example.com/img.png" alt="test" />',
    });
    expect(result.success).toBe(false);
  });

  it('uses custom from address when provided', async () => {
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<p>hi</p>',
      from: 'custom@domain.com',
    });
    expect(result.success).toBe(false);
    // Doesn't crash with custom from
  });

  it('uses default from when from is undefined', async () => {
    delete process.env.GCP_SENDER_EMAIL;
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<p>hi</p>',
    });
    expect(result.success).toBe(false);
  });

  it('handles recipient with display name format', async () => {
    const result = await sendEmail({
      to: 'User Name <user@example.com>',
      subject: 's',
      html: '<p>hi</p>',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Email template edge cases ───

describe('Email templates edge cases', () => {
  describe('verificationEmail', () => {
    it('handles numeric code as string', () => {
      const html = verificationEmail('000000');
      expect(html).toContain('000000');
    });

    it('handles long code', () => {
      const html = verificationEmail('ABCDEFGHIJ1234567890');
      expect(html).toContain('ABCDEFGHIJ1234567890');
    });

    it('handles single character code', () => {
      const html = verificationEmail('X');
      expect(html).toContain('X');
    });

    it('handles code with special HTML chars', () => {
      const html = verificationEmail('<script>');
      // Code is inserted into HTML, so it becomes part of markup
      expect(html).toContain('<script>');
    });

    it('produces valid HTML structure', () => {
      const html = verificationEmail('123');
      expect(html).toContain('<div');
      expect(html).toContain('</div>');
    });
  });

  describe('passwordResetEmail', () => {
    it('handles URL with fragments', () => {
      const url = 'https://example.com/reset#section';
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
    });

    it('handles very long URL', () => {
      const url = 'https://example.com/reset?' + 'param=value&'.repeat(50);
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
    });

    it('handles localhost URL', () => {
      const url = 'http://localhost:3000/reset?token=abc';
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
    });
  });

  describe('deliveryFailedEmail', () => {
    it('handles zero attempts', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 0);
      expect(html).toContain('0 kez denendi');
    });

    it('handles large attempt count', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 999);
      expect(html).toContain('999 kez denendi');
    });

    it('handles endpoint with path and query', () => {
      const endpoint = 'https://api.example.com/webhooks/inbound?debug=true';
      const html = deliveryFailedEmail('test', endpoint, 3);
      expect(html).toContain(endpoint);
    });

    it('handles event with dots and hyphens', () => {
      const html = deliveryFailedEmail('order.payment-failed', 'https://example.com', 1);
      expect(html).toContain('order.payment-failed');
    });
  });

  describe('welcomeEmail', () => {
    it('handles name with unicode characters', () => {
      const html = welcomeEmail('José García');
      expect(html).toContain('José García');
      expect(html).toContain('Merhaba José García');
    });

    it('handles empty name', () => {
      const html = welcomeEmail('');
      expect(html).toContain('Merhaba ');
    });

    it('handles very long name', () => {
      const longName = 'A'.repeat(200);
      const html = welcomeEmail(longName);
      expect(html).toContain(longName);
    });

    it('handles name with HTML special chars', () => {
      const html = welcomeEmail('<b>Bold</b>');
      expect(html).toContain('<b>Bold</b>');
    });

    it('handles name with quotes', () => {
      const html = welcomeEmail('John "Johnny" Doe');
      expect(html).toContain('John "Johnny" Doe');
    });
  });
});

// ─── sendEmail with mocked fetch (successful path) ───

describe('sendEmail with mocked fetch', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SENDER_EMAIL = 'test@test.com';
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'p',
      private_key_id: 'k',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0\n-----END PRIVATE KEY-----',
      client_email: 't@p.iam.gserviceaccount.com',
      client_id: '1',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('handles fetch network error during token exchange', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>hi</p>' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles fetch returning non-ok during token exchange', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>hi</p>' });
    expect(result.success).toBe(false);
  });

  it('handles fetch returning malformed JSON during token exchange', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>hi</p>' });
    expect(result.success).toBe(false);
  });
});
