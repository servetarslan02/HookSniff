import { describe, it, expect } from 'vitest';
import { verificationEmail, passwordResetEmail, deliveryFailedEmail, welcomeEmail } from '../lib/email';

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
  });
});
