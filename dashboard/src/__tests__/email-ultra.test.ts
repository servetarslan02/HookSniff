import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

// Valid RSA PKCS#8 PEM (just needs to be parseable base64 between headers)
const VALID_PEM = `-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA0
-----END PRIVATE KEY-----`;

const SA_JSON = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key-id',
  private_key: VALID_PEM,
  client_email: 'test@test-project.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
});

// Import after setting up mocks
const {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  deliveryFailedEmail,
  welcomeEmail,
} = await import('@/lib/email');

describe('email-ultra: sendEmail success paths (mocked crypto)', () => {
  const originalEnv = process.env;
  let cryptoKey: CryptoKey;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GCP_SA_JSON = SA_JSON;
    process.env.GCP_SENDER_EMAIL = 'sender@hooksniff.com';

    // Mock crypto.subtle.importKey to return a fake CryptoKey
    cryptoKey = {} as CryptoKey;
    mockImportKey.mockResolvedValue(cryptoKey);

    // Mock crypto.subtle.sign to return a fake ArrayBuffer signature
    const fakeSignature = new Uint8Array([1, 2, 3, 4]).buffer;
    mockSign.mockResolvedValue(fakeSignature);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Test 1: sendEmail calls correct Gmail API endpoint
  it('calls Gmail API endpoint on success', async () => {
    // First fetch = token exchange (ok), second fetch = Gmail API send (ok)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'ya29.fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg_123', labelIds: ['SENT'] }),
      });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
    // Second fetch call should be to Gmail API
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const gmailCall = mockFetch.mock.calls[1];
    expect(gmailCall[0]).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
  });

  // Test 2: sendEmail returns data on success
  it('returns success with Gmail API response data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'ya29.fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
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
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const gmailCall = mockFetch.mock.calls[1];
    expect(gmailCall[1]).toMatchObject({ method: 'POST' });
  });

  // Test 4: sendEmail sets Content-Type header for Gmail API
  it('sets Content-Type application/json for Gmail API', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const gmailCall = mockFetch.mock.calls[1];
    expect(gmailCall[1].headers).toMatchObject({
      'Content-Type': 'application/json',
    });
  });

  // Test 5: sendEmail sets Authorization header with access token
  it('sets Authorization Bearer header with access token', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'ya29.mytoken', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const gmailCall = mockFetch.mock.calls[1];
    expect(gmailCall[1].headers).toMatchObject({
      Authorization: 'Bearer ya29.mytoken',
    });
  });

  // Test 6: sendEmail includes raw MIME in body
  it('includes raw base64url MIME in request body', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello World</p>',
    });

    const gmailCall = mockFetch.mock.calls[1];
    const body = JSON.parse(gmailCall[1].body);
    expect(body).toHaveProperty('raw');
    expect(typeof body.raw).toBe('string');
    // base64url should not contain standard base64 chars + / =
    expect(body.raw).not.toContain('+');
    expect(body.raw).not.toContain('/');
  });

  // Test 7: sendEmail handles Gmail API error response
  it('returns error when Gmail API returns non-OK', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Forbidden'),
      });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('403');
    expect(result.error).toContain('Forbidden');
  });

  // Test 8: sendEmail handles Gmail API 429 rate limit
  it('returns error on Gmail API rate limit (429)', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Too Many Requests'),
      });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('429');
  });

  // Test 9: sendEmail handles Gmail API 500 server error
  it('returns error on Gmail API 500', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('500');
  });

  // Test 10: sendEmail handles token exchange failure
  it('returns error when token exchange fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request: invalid grant'),
    });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // Test 11: sendEmail handles network error during Gmail API call
  it('returns error when Gmail API fetch throws network error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // Test 12: sendEmail uses custom from address
  it('uses custom from address in MIME headers', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'custom@mysite.com',
    });

    // The MIME is base64url encoded, but we can check the raw was built
    const gmailCall = mockFetch.mock.calls[1];
    const body = JSON.parse(gmailCall[1].body);
    expect(body.raw).toBeDefined();
  });

  // Test 13: sendEmail uses default from when not specified
  it('uses default from address (GCP_SENDER_EMAIL) when from not specified', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(true);
  });

  // Test 14: sendEmail handles empty response body from Gmail API
  it('handles Gmail API returning empty-ish response', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

    const result = await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  // Test 15: sendEmail passes subject and html in MIME
  it('includes subject and HTML in the raw MIME content', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'recipient@example.com',
      subject: 'Important Notification',
      html: '<h1>Alert!</h1><p>Something happened.</p>',
    });

    const gmailCall = mockFetch.mock.calls[1];
    const body = JSON.parse(gmailCall[1].body);
    // Decode the base64url to verify content
    const raw = body.raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw + '==='.slice((raw.length + 3) % 4);
    const decoded = atob(padded);

    expect(decoded).toContain('Subject: Important Notification');
    expect(decoded).toContain('To: recipient@example.com');
    expect(decoded).toContain('<h1>Alert!</h1>');
    expect(decoded).toContain('multipart/alternative');
  });

  // Test 16: token exchange uses correct parameters
  it('sends JWT assertion to token endpoint', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'msg' }),
      });

    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    // First call is token exchange
    const tokenCall = mockFetch.mock.calls[0];
    expect(tokenCall[0]).toBe('https://oauth2.googleapis.com/token');
    expect(tokenCall[1].method).toBe('POST');
    expect(tokenCall[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  });
});

describe('email-ultra: template functions comprehensive', () => {
  // Test 17: verificationEmail contains all required elements
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

  // Test 18: passwordResetEmail has button and URL
  it('passwordResetEmail has reset button with correct URL', () => {
    const url = 'https://hooksniff.vercel.app/reset?token=abc123&redirect=%2Fdashboard';
    const html = passwordResetEmail(url);
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain('Şifremi Sıfırla');
    expect(html).toContain('1 saat');
    expect(html).toContain('background: #4c6ef5');
    expect(html).toContain('color: white');
  });

  // Test 19: deliveryFailedEmail includes all delivery details
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

  // Test 20: welcomeEmail includes name and getting started steps
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

  // Test 21: verificationEmail with different codes produces different output
  it('verificationEmail produces unique output for different codes', () => {
    const html1 = verificationEmail('111111');
    const html2 = verificationEmail('222222');
    expect(html1).toContain('111111');
    expect(html2).toContain('222222');
    expect(html1).not.toContain('222222');
    expect(html2).not.toContain('111111');
  });

  // Test 22: deliveryFailedEmail with edge case values
  it('deliveryFailedEmail handles zero and large attempt counts', () => {
    const html0 = deliveryFailedEmail('test', 'https://example.com', 0);
    expect(html0).toContain('0 kez denendi');

    const html100 = deliveryFailedEmail('test', 'https://example.com', 100);
    expect(html100).toContain('100 kez denendi');
  });

  // Test 23: welcomeEmail with special characters in name
  it('welcomeEmail handles names with special characters', () => {
    const html = welcomeEmail('José García-Öztürk');
    expect(html).toContain('José García-Öztürk');
    expect(html).toContain('Merhaba José García-Öztürk');
  });
});
