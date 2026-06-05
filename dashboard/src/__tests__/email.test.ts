import { describe, it, expect } from 'vitest';

describe('email templates', () => {
  it('verificationEmail returns HTML string', async () => {
    const { verificationEmail } = await import('@/lib/email');
    const html = verificationEmail('ABC123');
    expect(typeof html).toBe('string');
    expect(html).toContain('ABC123');
    expect(html.length).toBeGreaterThan(100);
  });

  it('passwordResetEmail includes reset URL', async () => {
    const { passwordResetEmail } = await import('@/lib/email');
    const html = passwordResetEmail('https://hooksniff.vercel.app/reset?token=abc');
    expect(html).toContain('https://hooksniff.vercel.app/reset');
    expect(html.length).toBeGreaterThan(100);
  });

  it('deliveryFailedEmail includes event and endpoint', async () => {
    const { deliveryFailedEmail } = await import('@/lib/email');
    const html = deliveryFailedEmail('order.created', 'https://example.com', 3);
    expect(html).toContain('order.created');
    expect(html).toContain('https://example.com');
  });

  it('welcomeEmail includes name', async () => {
    const { welcomeEmail } = await import('@/lib/email');
    const html = welcomeEmail('John', 'john123');
    expect(html).toContain('John');
  });

  it('welcomeEmail works without username', async () => {
    const { welcomeEmail } = await import('@/lib/email');
    const html = welcomeEmail('Jane');
    expect(html).toContain('Jane');
  });
});
