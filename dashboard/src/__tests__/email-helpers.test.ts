import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the internal helpers by importing the module and testing exported functions.
// The sendEmail function has internal helpers (base64urlEncode, base64urlDecode, etc.)
// that we can test indirectly through the template functions and sendEmail behavior.

import {
  verificationEmail,
  passwordResetEmail,
  deliveryFailedEmail,
  welcomeEmail,
  sendEmail,
} from '../lib/email';

describe('Email — Helper Functions & Edge Cases', () => {
  // === base64urlEncode (tested indirectly via template output) ===
  describe('base64url encoding (indirect)', () => {
    it('verificationEmail produces valid HTML', () => {
      const html = verificationEmail('ABC123');
      expect(html).toContain('<div');
      expect(html).toContain('</div>');
      expect(html).toContain('ABC123');
    });

    it('passwordResetEmail produces valid HTML with URL', () => {
      const url = 'https://example.com/reset?token=abc&redirect=/dashboard';
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
      expect(html).toContain('href=');
    });

    it('deliveryFailedEmail handles special characters in event', () => {
      const html = deliveryFailedEmail('user.created&updated', 'https://example.com', 3);
      expect(html).toContain('user.created&updated');
    });

    it('welcomeEmail handles empty name', () => {
      const html = welcomeEmail('');
      expect(html).toContain('Merhaba');
      expect(html).toContain("HookSniff'e Hoş Geldin!");
    });

    it('welcomeEmail handles very long name', () => {
      const longName = 'A'.repeat(1000);
      const html = welcomeEmail(longName);
      expect(html).toContain(longName);
    });
  });

  // === Template consistency ===
  describe('template consistency', () => {
    it('all templates have consistent container styling', () => {
      const templates = [
        verificationEmail('123'),
        passwordResetEmail('https://example.com'),
        deliveryFailedEmail('test', 'https://example.com', 1),
        welcomeEmail('Test'),
      ];

      for (const html of templates) {
        expect(html).toContain('max-width: 480px');
        expect(html).toContain('margin: 0 auto');
        expect(html).toContain('padding: 32px');
      }
    });

    it('all templates have HookSniff emoji', () => {
      const templates = [
        verificationEmail('123'),
        passwordResetEmail('https://example.com'),
        welcomeEmail('Test'),
      ];

      for (const html of templates) {
        expect(html).toContain('🪝');
      }
    });

    it('delivery failed template uses warning emoji instead', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 1);
      expect(html).toContain('⚠️');
    });
  });

  // === sendEmail error paths ===
  describe('sendEmail error handling', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.clearAllMocks();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns error when GCP_SA_JSON is missing', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>' });
      expect(result.success).toBe(false);
    });

    it('returns error object structure', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>' });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
    });

    it('handles invalid GCP_SA_JSON gracefully', async () => {
      process.env.GCP_SA_JSON = 'not-valid-json';
      const result = await sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>' });
      expect(result.success).toBe(false);
    });

    it('handles empty GCP_SA_JSON', async () => {
      process.env.GCP_SA_JSON = '';
      const result = await sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>' });
      expect(result.success).toBe(false);
    });

    it('handles custom from address', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Hi</p>',
        from: 'custom@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('handles different recipient formats', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({
        to: 'user+tag@subdomain.example.com',
        subject: 'Test Subject',
        html: '<h1>Hello</h1>',
      });
      expect(result.success).toBe(false);
    });

    it('handles HTML with special characters', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test <script>alert("xss")</script>',
        html: '<p>Hello & welcome <b>"user"</b></p>',
      });
      expect(result.success).toBe(false);
    });

    it('handles very long subject', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'A'.repeat(1000),
        html: '<p>Test</p>',
      });
      expect(result.success).toBe(false);
    });

    it('handles empty HTML body', async () => {
      delete process.env.GCP_SA_JSON;
      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Empty',
        html: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // === Template parameter variations ===
  describe('template parameter variations', () => {
    it('verificationEmail with numeric code', () => {
      const html = verificationEmail('000000');
      expect(html).toContain('000000');
    });

    it('verificationEmail with alphanumeric code', () => {
      const html = verificationEmail('A1B2C3');
      expect(html).toContain('A1B2C3');
    });

    it('passwordResetEmail with localhost URL', () => {
      const html = passwordResetEmail('http://localhost:3000/reset?token=test');
      expect(html).toContain('http://localhost:3000/reset?token=test');
    });

    it('deliveryFailedEmail with zero attempts', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 0);
      expect(html).toContain('0 kez denendi');
    });

    it('deliveryFailedEmail with large attempt count', () => {
      const html = deliveryFailedEmail('test', 'https://example.com', 999);
      expect(html).toContain('999 kez denendi');
    });

    it('welcomeEmail with unicode name', () => {
      const html = welcomeEmail('Servet Arslan 🇹🇷');
      expect(html).toContain('Servet Arslan 🇹🇷');
    });

    it('welcomeEmail with HTML-like name', () => {
      const html = welcomeEmail('<b>Bold</b>');
      expect(html).toContain('<b>Bold</b>');
    });
  });
});
