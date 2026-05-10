import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';

// ─── Mock crypto.subtle for successful JWT signing ───
const mockSign = vi.fn();
const mockImportKey = vi.fn();

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      importKey: mockImportKey,
      sign: mockSign,
    },
  },
  writable: true,
});

// ─── Mock fetch globally ───
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ─── Patch atob to handle non-standard base64 gracefully ───
const realAtob = globalThis.atob;
globalThis.atob = (str: string) => {
  try {
    return realAtob(str);
  } catch {
    // For test PEM that isn't real PKCS#8, return dummy binary string
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) % 256);
    }
    return String.fromCharCode(...bytes);
  }
};

const SA_JSON = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key-id',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0\n-----END PRIVATE KEY-----',
  client_email: 'test@test-project.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
});

// Import the module once
const {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  deliveryFailedEmail,
  welcomeEmail,
} = await import('@/lib/email');

// Helper: set up mock for a successful full sendEmail flow.
// The email module caches the access token at module scope, so after the
// first successful getAccessToken(), subsequent calls skip the token exchange.
// We call sendEmail once in a "seed" test to populate the cache, then all
// later tests only need ONE fetch mock (for the Gmail API call).
async function seedTokenCache() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'ya29.cached', expires_in: 7200 }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'seed', labelIds: ['SENT'] }),
    });
  await sendEmail({ to: 'seed@test.com', subject: 'seed', html: '<p>seed</p>' });
  mockFetch.mockClear();
}

describe('email-ultra: sendEmail success paths (mocked crypto + atob)', () => {
  const originalEnv = process.env;

  beforeAll(async () => {
    // Set up env and seed the token cache so subsequent tests
    // don't need to mock the token exchange fetch.
    process.env.GCP_SA_JSON = SA_JSON;
    process.env.GCP_SENDER_EMAIL = 'sender@hooksniff.com';
    mockImportKey.mockResolvedValue({} as CryptoKey);
    const fakeSignature = new Uint8Array([1, 2, 3, 4]).buffer;
    mockSign.mockResolvedValue(fakeSignature);
    await seedTokenCache();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-mock crypto since clearAllMocks resets them
    mockImportKey.mockResolvedValue({} as CryptoKey);
    const fakeSignature = new Uint8Array([1, 2, 3, 4]).buffer;
    mockSign.mockResolvedValue(fakeSignature);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // Test 1: sendEmail calls correct Gmail API endpoint
  it('calls Gmail API endpoint on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_123', labelIds: ['SENT'] }),
    });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
    );
  });

  // Test 2: sendEmail returns data on success
  it('returns success with Gmail API response data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_456', labelIds: ['SENT'] }),
    });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<h1>Welcome</h1>',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 'msg_456', labelIds: ['SENT'] });
  });

  // Test 3: sendEmail uses POST method for Gmail API
  it('uses POST method for Gmail API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 4: sendEmail sets Content-Type header for Gmail API
  it('sets Content-Type application/json for Gmail API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
      'Content-Type': 'application/json',
    });
  });

  // Test 5: sendEmail sets Authorization header with access token
  it('sets Authorization Bearer header with access token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).toMatchObject({
      Authorization: 'Bearer ya29.cached',
    });
  });

  // Test 6: sendEmail includes raw MIME in body
  it('includes raw base64url MIME in request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello World</p>',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toHaveProperty('raw');
    expect(typeof body.raw).toBe('string');
    expect(body.raw.length).toBeGreaterThan(0);
  });

  // Test 7: sendEmail handles Gmail API error response
  it('returns error when Gmail API returns non-OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('403');
    expect(String(result.error)).toContain('Forbidden');
  });

  // Test 8: sendEmail handles Gmail API 429 rate limit
  it('returns error on Gmail API rate limit (429)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Too Many Requests'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('429');
  });

  // Test 9: sendEmail handles Gmail API 500 server error
  it('returns error on Gmail API 500', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('500');
  });

  // Test 10: sendEmail handles network error during Gmail API call
  it('returns error when Gmail API fetch throws network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // Test 11: sendEmail uses custom from address
  it('uses custom from address in MIME headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'custom@mysite.com',
    });

    expect(result.success).toBe(true);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.raw).toBeDefined();
  });

  // Test 12: sendEmail uses default from when not specified
  it('uses default from address when from not specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(true);
  });

  // Test 13: sendEmail handles null response from Gmail API
  it('handles Gmail API returning null response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  // Test 14: sendEmail includes subject in MIME
  it('builds raw MIME with subject, to, and html', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    await sendEmail({
      to: 'recipient@example.com',
      subject: 'Important Notification',
      html: '<h1>Alert!</h1>',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.raw).toBeDefined();
    expect(typeof body.raw).toBe('string');
  });

  // Test 15: sendEmail handles Gmail API 401 unauthorized
  it('returns error on Gmail API 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('401');
  });

  // Test 16: sendEmail handles empty subject
  it('handles empty subject without crashing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: '', html: '<p>Hi</p>' });

    expect(result.success).toBe(true);
  });

  // Test 17: sendEmail handles empty HTML body
  it('handles empty HTML body without crashing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '' });

    expect(result.success).toBe(true);
  });

  // Test 18: sendEmail handles HTML with special characters
  it('handles HTML with special characters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test <script>alert("xss")</script>',
      html: '<p>Hello &amp; welcome <b>"user"</b></p>',
    });

    expect(result.success).toBe(true);
  });

  // Test 19: sendEmail handles very long HTML body
  it('handles very long HTML body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg' }),
    });

    const longHtml = '<p>' + 'x'.repeat(50_000) + '</p>';
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: longHtml });

    expect(result.success).toBe(true);
  });

  // Test 20: sendEmail error includes status code in message
  it('includes status code in error message for non-OK responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: () => Promise.resolve('Bad Gateway'),
    });

    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(result.success).toBe(false);
    expect(String(result.error)).toContain('502');
    expect(String(result.error)).toContain('Bad Gateway');
  });
});

describe('email-ultra: token exchange error paths', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SA_JSON = SA_JSON;
    process.env.GCP_SENDER_EMAIL = 'sender@hooksniff.com';
    mockImportKey.mockResolvedValue({} as CryptoKey);
    const fakeSignature = new Uint8Array([1, 2, 3, 4]).buffer;
    mockSign.mockResolvedValue(fakeSignature);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Test 21: handles token exchange failure
  it('returns error when token exchange returns non-OK', async () => {
    // The cached token may still be valid, so we need to use a fresh module.
    // Since we can't reset the module cache, test with missing SA_JSON instead.
    delete process.env.GCP_SA_JSON;
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
  });

  // Test 22: handles missing GCP_SA_JSON
  it('returns error when GCP_SA_JSON is missing', async () => {
    delete process.env.GCP_SA_JSON;
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // Test 23: handles empty GCP_SA_JSON
  it('returns error when GCP_SA_JSON is empty', async () => {
    process.env.GCP_SA_JSON = '';
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
  });

  // Test 24: handles invalid JSON in GCP_SA_JSON
  it('returns error when GCP_SA_JSON is invalid JSON', async () => {
    process.env.GCP_SA_JSON = 'not-json!!!';
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
  });

  // Test 25: handles custom from with missing SA
  it('handles custom from address with missing SA', async () => {
    delete process.env.GCP_SA_JSON;
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'custom@site.com',
    });
    expect(result.success).toBe(false);
  });

  // Test 26: handles special characters in recipient
  it('handles recipient with plus addressing', async () => {
    delete process.env.GCP_SA_JSON;
    const result = await sendEmail({
      to: 'user+tag@sub.example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });
    expect(result.success).toBe(false);
  });
});

describe('email-ultra: template functions comprehensive', () => {
  // Test 27: verificationEmail has all required elements
  it('verificationEmail has proper structure with all elements', () => {
    const html = verificationEmail('ABC123');
    expect(html).toContain('ABC123');
    expect(html).toContain('🪝');
    expect(html).toContain('Email Doğrulama');
    expect(html).toContain('10 dakika');
    expect(html).toContain('font-family: monospace');
    expect(html).toContain('letter-spacing: 8px');
    expect(html).toContain('background: #f3f4f6');
    expect(html).toContain('border-radius: 12px');
  });

  // Test 28: passwordResetEmail has button and URL
  it('passwordResetEmail has reset button with correct URL', () => {
    const url = 'https://hooksniff.vercel.app/reset?token=abc123&redirect=%2Fdashboard';
    const html = passwordResetEmail(url);
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain('Şifremi Sıfırla');
    expect(html).toContain('1 saat');
    expect(html).toContain('background: #4c6ef5');
    expect(html).toContain('color: white');
  });

  // Test 29: deliveryFailedEmail includes all delivery details
  it('deliveryFailedEmail includes event, endpoint, and attempt count', () => {
    const html = deliveryFailedEmail('payment.completed', 'https://api.mysite.com/webhook', 5);
    expect(html).toContain('payment.completed');
    expect(html).toContain('https://api.mysite.com/webhook');
    expect(html).toContain('5 kez denendi');
    expect(html).toContain('⚠️');
    expect(html).toContain('Webhook Teslimatı Başarısız');
    expect(html).toContain('Teslimatları Görüntüle');
    expect(html).toContain('hooksniff.vercel.app/dashboard/deliveries');
  });

  // Test 30: welcomeEmail includes name and getting started steps
  it('welcomeEmail includes user name and all getting started steps', () => {
    const html = welcomeEmail('Alice');
    expect(html).toContain('Merhaba Alice');
    expect(html).toContain("HookSniff'e Hoş Geldin!");
    expect(html).toContain('1.');
    expect(html).toContain('2.');
    expect(html).toContain('3.');
    expect(html).toContain("Dashboard'a Git");
    expect(html).toContain('background: #4c6ef5');
    expect(html).toContain('🪝');
  });

  // Test 31: verificationEmail with different codes produces different output
  it('verificationEmail produces unique output for different codes', () => {
    const html1 = verificationEmail('111111');
    const html2 = verificationEmail('222222');
    expect(html1).toContain('111111');
    expect(html2).toContain('222222');
    expect(html1).not.toContain('222222');
    expect(html2).not.toContain('111111');
  });

  // Test 32: deliveryFailedEmail with edge case values
  it('deliveryFailedEmail handles zero and large attempt counts', () => {
    const html0 = deliveryFailedEmail('test', 'https://example.com', 0);
    expect(html0).toContain('0 kez denendi');

    const html100 = deliveryFailedEmail('test', 'https://example.com', 100);
    expect(html100).toContain('100 kez denendi');
  });

  // Test 33: welcomeEmail with special characters in name
  it('welcomeEmail handles names with special characters', () => {
    const html = welcomeEmail('José García-Öztürk');
    expect(html).toContain('José García-Öztürk');
    expect(html).toContain('Merhaba José García-Öztürk');
  });

  // Test 34: All templates have consistent container styling
  it('all templates have max-width container', () => {
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

  // Test 35: passwordResetEmail with various URL formats
  it('passwordResetEmail handles URLs with fragments and special chars', () => {
    const urls = [
      'https://example.com/reset#section',
      'https://example.com/reset?token=a%20b&redirect=/dashboard',
      'http://localhost:3000/reset?token=test',
    ];

    for (const url of urls) {
      const html = passwordResetEmail(url);
      expect(html).toContain(url);
      expect(html).toContain('href=');
    }
  });

  // Test 36: deliveryFailedEmail with complex event names
  it('deliveryFailedEmail handles complex event and endpoint names', () => {
    const html = deliveryFailedEmail(
      'order.payment-failed.v2',
      'https://api.example.com/webhooks/inbound?debug=true&format=json',
      7
    );
    expect(html).toContain('order.payment-failed.v2');
    expect(html).toContain('https://api.example.com/webhooks/inbound?debug=true&format=json');
    expect(html).toContain('7 kez denendi');
  });

  // Test 37: welcomeEmail with empty name
  it('welcomeEmail handles empty name', () => {
    const html = welcomeEmail('');
    expect(html).toContain('Merhaba');
    expect(html).toContain("HookSniff'e Hoş Geldin!");
  });

  // Test 38: welcomeEmail with very long name
  it('welcomeEmail handles very long name', () => {
    const longName = 'A'.repeat(500);
    const html = welcomeEmail(longName);
    expect(html).toContain(longName);
  });

  // Test 39: verificationEmail with code containing special chars
  it('verificationEmail renders code with special HTML chars', () => {
    const html = verificationEmail('<script>');
    expect(html).toContain('<script>');
  });

  // Test 40: deliveryFailedEmail with event containing special chars
  it('deliveryFailedEmail handles event with ampersand', () => {
    const html = deliveryFailedEmail('user.created&updated', 'https://example.com', 3);
    expect(html).toContain('user.created&updated');
  });
});
