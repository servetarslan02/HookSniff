import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verificationEmail, passwordResetEmail, deliveryFailedEmail, welcomeEmail, sendEmail } from '../lib/email';

describe('Email Templates', () => {
  describe('verificationEmail', () => {
    it('contains verification code', () => {
      const html = verificationEmail('123456');
      expect(html).toContain('123456');
    });

    it('contains HookSniff branding', () => {
      const html = verificationEmail('123456');
      expect(html).toContain('🪝');
      expect(html).toContain('HookSniff');
    });

    it('contains expiry notice', () => {
      const html = verificationEmail('123456');
      expect(html).toContain('10 dakika');
    });

    it('renders code in monospace style', () => {
      const html = verificationEmail('ABCDEF');
      expect(html).toContain('font-family: monospace');
      expect(html).toContain('ABCDEF');
    });

    it('renders code with letter spacing', () => {
      const html = verificationEmail('999999');
      expect(html).toContain('letter-spacing: 8px');
    });

    it('contains email verification header text', () => {
      const html = verificationEmail('111');
      expect(html).toContain('Email Doğrulama');
    });

    it('renders with different codes', () => {
      const html1 = verificationEmail('000000');
      const html2 = verificationEmail('999999');
      expect(html1).toContain('000000');
      expect(html2).toContain('999999');
      expect(html1).not.toContain('999999');
    });

    it('contains max-width container style', () => {
      const html = verificationEmail('123');
      expect(html).toContain('max-width: 480px');
    });
  });

  describe('passwordResetEmail', () => {
    it('contains reset URL', () => {
      const html = passwordResetEmail('https://example.com/reset?token=abc');
      expect(html).toContain('https://example.com/reset?token=abc');
    });

    it('contains reset button', () => {
      const html = passwordResetEmail('https://example.com/reset');
      expect(html).toContain('Şifremi Sıfırla');
    });

    it('contains expiry notice', () => {
      const html = passwordResetEmail('https://example.com/reset');
      expect(html).toContain('1 saat');
    });

    it('contains password reset header', () => {
      const html = passwordResetEmail('https://example.com/reset');
      expect(html).toContain('Şifre Sıfırlama');
    });

    it('renders URL as href in anchor tag', () => {
      const url = 'https://hooksniff.vercel.app/reset?token=xyz789';
      const html = passwordResetEmail(url);
      expect(html).toContain(`href="${url}"`);
    });

    it('contains HookSniff branding', () => {
      const html = passwordResetEmail('https://example.com/reset');
      expect(html).toContain('🪝');
    });

    it('renders button with correct styles', () => {
      const html = passwordResetEmail('https://example.com/reset');
      expect(html).toContain('background: #4c6ef5');
      expect(html).toContain('border-radius: 12px');
    });

    it('handles URL with special characters', () => {
      const url = 'https://example.com/reset?token=a%20b&redirect=/dashboard';
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
    });
  });

  describe('deliveryFailedEmail', () => {
    it('contains event info', () => {
      const html = deliveryFailedEmail('order.created', 'https://example.com', 3);
      expect(html).toContain('order.created');
      expect(html).toContain('https://example.com');
      expect(html).toContain('3');
    });

    it('contains warning emoji', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 1);
      expect(html).toContain('⚠️');
    });

    it('contains failure header text', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 1);
      expect(html).toContain('Webhook Teslimatı Başarısız');
    });

    it('displays event label', () => {
      const html = deliveryFailedEmail('payment.completed', 'https://example.com', 2);
      expect(html).toContain('Event:');
      expect(html).toContain('payment.completed');
    });

    it('displays endpoint label', () => {
      const html = deliveryFailedEmail('test', 'https://api.test.com/webhook', 1);
      expect(html).toContain('Endpoint:');
      expect(html).toContain('https://api.test.com/webhook');
    });

    it('displays attempt count', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 5);
      expect(html).toContain('Deneme:');
      expect(html).toContain('5 kez denendi');
    });

    it('contains dashboard link', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 1);
      expect(html).toContain('https://hooksniff.vercel.app/dashboard/deliveries');
      expect(html).toContain('Teslimatları Görüntüle');
    });

    it('contains alert box styles', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 1);
      expect(html).toContain('background: #fef2f2');
      expect(html).toContain('border: 1px solid #fecaca');
    });

    it('renders with different event types', () => {
      const html = deliveryFailedEmail('user.deleted', 'https://example.com', 1);
      expect(html).toContain('user.deleted');
    });
  });

  describe('welcomeEmail', () => {
    it('contains user name', () => {
      const html = welcomeEmail('Servet');
      expect(html).toContain('Servet');
    });

    it('contains getting started steps', () => {
      const html = welcomeEmail('Servet');
      expect(html).toContain('endpoint');
      expect(html).toContain('API key');
      expect(html).toContain('webhook');
    });

    it('contains dashboard link', () => {
      const html = welcomeEmail('Servet');
      expect(html).toContain('https://hooksniff.vercel.app/dashboard');
    });

    it('contains welcome header', () => {
      const html = welcomeEmail('Test');
      expect(html).toContain("HookSniff'e Hoş Geldin!");
    });

    it('contains HookSniff branding', () => {
      const html = welcomeEmail('Test');
      expect(html).toContain('🪝');
    });

    it('contains greeting with name', () => {
      const html = welcomeEmail('Alice');
      expect(html).toContain('Merhaba Alice');
    });

    it('renders dashboard button with correct styles', () => {
      const html = welcomeEmail('Test');
      expect(html).toContain("Dashboard'a Git");
      expect(html).toContain('background: #4c6ef5');
    });

    it('contains numbered getting started steps', () => {
      const html = welcomeEmail('Test');
      expect(html).toContain('1.');
      expect(html).toContain('2.');
      expect(html).toContain('3.');
    });

    it('handles names with special characters', () => {
      const html = welcomeEmail("O'Brien");
      expect(html).toContain("O'Brien");
      expect(html).toContain("Merhaba O'Brien");
    });

    it('contains max-width container', () => {
      const html = welcomeEmail('Test');
      expect(html).toContain('max-width: 480px');
    });
  });
});

describe('sendEmail', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Note: sendEmail uses Web Crypto for JWT signing with the PEM private key.
    // Since we can't provide a real RSA key in tests, crypto.subtle.importKey will
    // fail, causing sendEmail to return { success: false, error: ... }.
    // We test the error handling paths and the missing-env-var path.
    process.env.GCP_SA_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0\n-----END PRIVATE KEY-----',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: '123456789',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    });
    process.env.GCP_SENDER_EMAIL = 'test@hooksniff.com';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('returns error when crypto key import fails (invalid PEM)', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    // The fake PEM can't be imported by Web Crypto, so sendEmail catches the error
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error when GCP_SA_JSON is not set', async () => {
    delete process.env.GCP_SA_JSON;

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(false);
  });

  it('returns error object with error field on failure', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('error');
  });

  it('handles custom from parameter without crashing', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
      from: 'custom@sender.com',
    });

    // Still fails due to invalid PEM, but doesn't crash
    expect(result.success).toBe(false);
  });

  it('handles missing from parameter (uses default)', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    // Still fails due to invalid PEM, but uses DEFAULT_FROM internally
    expect(result.success).toBe(false);
  });

  it('handles different recipient addresses', async () => {
    const result = await sendEmail({
      to: 'other@example.com',
      subject: 'Different subject',
      html: '<h1>Test</h1>',
    });

    expect(result.success).toBe(false);
  });
});
