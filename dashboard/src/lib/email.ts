// ─── Gmail API Email Client ───
// Uses GCP Service Account (GCP_SA_JSON env var) for authentication via JWT.
// Compatible with Next.js Edge Runtime (Web Crypto API only, no Node.js deps).

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

const DEFAULT_FROM = process.env.GCP_SENDER_EMAIL || 'noreply@hooksniff.vercel.app';
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

// ─── Helpers ───

function base64urlEncode(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Parse PKCS#8 PEM private key for Web Crypto importKey.
 * Handles both PKCS#8 and PKCS#1 (traditional RSA) PEM formats.
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Strip PEM headers/footers and newlines
  const base64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s+/g, '');
  return base64urlDecode(base64.replace(/-/g, '+').replace(/_/g, '/'));
}

async function importRsaPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function signJwt(privateKey: CryptoKey, header: object, payload: object): Promise<string> {
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  );
  return `${data}.${base64urlEncode(signature)}`;
}

// ─── Token Cache ───

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getServiceAccount(): Promise<ServiceAccountKey> {
  const saJson = process.env.GCP_SA_JSON;
  if (!saJson) {
    throw new Error('GCP_SA_JSON environment variable is not set');
  }
  return JSON.parse(saJson) as ServiceAccountKey;
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5-min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300_000) {
    return cachedToken.token;
  }

  const sa = await getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const privateKey = await importRsaPrivateKey(sa.private_key);

  const jwt = await signJwt(
    privateKey,
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      scope: SCOPES,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }
  );

  // Exchange JWT for access token
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ─── Core Send ───

function buildRawMime(to: string, from: string, subject: string, html: string): string {
  const boundary = 'boundary_hooksniff_email';
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    `--${boundary}--`,
  ].join('\r\n');

  return base64urlEncode(mime);
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const senderEmail = from || DEFAULT_FROM;

  try {
    const accessToken = await getAccessToken();
    const raw = buildRawMime(to, senderEmail, subject, html);

    const resp = await fetch(GMAIL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Gmail API error:', resp.status, text);
      return { success: false, error: `Gmail API returned ${resp.status}: ${text}` };
    }

    const data = await resp.json();
    return { success: true, data };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err };
  }
}

// ─── Email Templates ───

export function verificationEmail(code: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Email Doğrulama</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        HookSniff hesabını doğrulamak için aşağıdaki kodu kullan:
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Bu kod 10 dakika geçerlidir. Eğer bu sen değilsen, bu emaili görmezden gel.
      </p>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Şifre Sıfırlama</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Şifreni sıfırlamak için aşağıdaki butona tıkla:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Şifremi Sıfırla
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Bu link 1 saat geçerlidir. Eğer bu sen değilsen, bu emaili görmezden gel.
      </p>
    </div>
  `;
}

export function deliveryFailedEmail(event: string, endpoint: string, attempts: number) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">⚠️</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Webhook Teslimatı Başarısız</h1>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="color: #991b1b; font-size: 14px; margin: 0;">
          <strong>Event:</strong> ${event}<br/>
          <strong>Endpoint:</strong> ${endpoint}<br/>
          <strong>Deneme:</strong> ${attempts} kez denendi
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Webhook endpoint'inize teslimat yapılamadı. Lütfen endpoint durumunu kontrol edin.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://hooksniff.vercel.app/dashboard/deliveries" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Teslimatları Görüntüle
        </a>
      </div>
    </div>
  `;
}

export function welcomeEmail(name: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">HookSniff'e Hoş Geldin!</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Merhaba ${name},<br/><br/>
        HookSniff'e kayıt olduğun için teşekkürler! Webhook teslimatlarını güvenilir bir şekilde yönetmeye hemen başlayabilirsin.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://hooksniff.vercel.app/dashboard" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Dashboard'a Git
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Başlamak için:<br/>
        1. Bir endpoint oluştur<br/>
        2. API key al<br/>
        3. İlk webhook'unu gönder
      </p>
    </div>
  `;
}
