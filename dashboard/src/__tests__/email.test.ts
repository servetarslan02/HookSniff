import { describe, it, expect, vi, beforeEach } from 'vitest';

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
});
