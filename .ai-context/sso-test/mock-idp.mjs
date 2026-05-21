/**
 * Mock OIDC IdP — simulates Keycloak for SSO testing
 * Runs on port 8080
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { URL } from 'node:url';
import { generateKeyPairSync, sign } from 'node:crypto';

// Generate RSA key pair for JWT signing
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Extract public key components for JWKS
const publicKeyObj = crypto.createPublicKey(publicKey);
const keyDetails = publicKeyObj.asymmetricKeyDetails;
const pubKeyExport = publicKeyObj.export({ type: 'spki', format: 'der' });

// Simple base64url encode
function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

// Create JWKS
function getJwks() {
  const n = base64url(pubKeyExport.subarray(pubKeyExport.length - 256));
  const e = base64url(Buffer.from([0x01, 0x00, 0x01])); // 65537
  return {
    keys: [{
      kty: 'RSA',
      kid: 'mock-key-1',
      use: 'sig',
      alg: 'RS256',
      n,
      e,
    }]
  };
}

// Create a signed JWT
function createJwt(claims) {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'mock-key-1' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'http://localhost:8080',
    aud: 'hooksniff-client',
    iat: now,
    exp: now + 3600,
    ...claims,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = sign('RSA-SHA256', Buffer.from(signingInput), privateKey);
  const sigB64 = base64url(signature);

  return `${signingInput}.${sigB64}`;
}

// Test users
const USERS = {
  'admin@testcorp.com': {
    id: 'user-admin-001',
    email: 'admin@testcorp.com',
    name: 'Admin User',
    given_name: 'Admin',
    family_name: 'User',
    role: 'admin',
  },
  'developer@testcorp.com': {
    id: 'user-dev-001',
    email: 'developer@testcorp.com',
    name: 'Developer User',
    given_name: 'Dev',
    family_name: 'User',
    role: 'developer',
  },
  'viewer@testcorp.com': {
    id: 'user-viewer-001',
    email: 'viewer@testcorp.com',
    name: 'Viewer User',
    given_name: 'View',
    family_name: 'User',
    role: 'viewer',
  },
  'analyst@testcorp.com': {
    id: 'user-analyst-001',
    email: 'analyst@testcorp.com',
    name: 'Analyst User',
    given_name: 'Ana',
    family_name: 'User',
    role: 'analyst',
  },
  'newuser@testcorp.com': {
    id: 'user-new-001',
    email: 'newuser@testcorp.com',
    name: 'New User',
    given_name: 'New',
    family_name: 'User',
    role: 'viewer',
  },
};

// In-memory auth codes
const authCodes = new Map();
// In-memory login states
const loginStates = new Map();

const PORT = 8080;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

  // OIDC Discovery
  if (path === '/.well-known/openid-configuration') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      issuer: `http://localhost:${PORT}`,
      authorization_endpoint: `http://localhost:${PORT}/authorize`,
      token_endpoint: `http://localhost:${PORT}/token`,
      userinfo_endpoint: `http://localhost:${PORT}/userinfo`,
      jwks_uri: `http://localhost:${PORT}/jwks`,
      scopes_supported: ['openid', 'email', 'profile'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
    }));
    return;
  }

  // JWKS endpoint
  if (path === '/jwks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getJwks()));
    return;
  }

  // Authorization endpoint — shows login form
  if (path === '/authorize') {
    const email = url.searchParams.get('email') || '';
    const state = url.searchParams.get('state') || '';
    const redirectUri = url.searchParams.get('redirect_uri') || '';
    const nonce = url.searchParams.get('nonce') || '';

    // Show a simple login form
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html><head><title>Mock IdP — Login</title>
<style>
  body { font-family: system-ui; max-width: 500px; margin: 60px auto; background: #f5f5f5; }
  .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  h1 { color: #333; font-size: 20px; }
  .user-list { list-style: none; padding: 0; }
  .user-list li { margin: 8px 0; }
  .user-list button { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;
    background: white; cursor: pointer; text-align: left; font-size: 14px; transition: all 0.2s; }
  .user-list button:hover { border-color: #4f46e5; background: #f0f0ff; }
  .role { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;
    font-weight: bold; text-transform: uppercase; }
  .role-admin { background: #fee2e2; color: #dc2626; }
  .role-developer { background: #dbeafe; color: #2563eb; }
  .role-viewer { background: #f3f4f6; color: #6b7280; }
  .role-analyst { background: #fef3c7; color: #d97706; }
  .info { background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 8px;
    font-size: 12px; color: #166534; margin-bottom: 16px; }
</style></head><body>
<div class="card">
  <h1>🔐 Mock IdP — Test Login</h1>
  <div class="info">
    <strong>HookSniff SSO Test</strong><br>
    State: ${state.substring(0, 16)}...<br>
    Redirect: ${redirectUri}
  </div>
  <p>Select a user to login as:</p>
  <ul class="user-list">
    ${Object.entries(USERS).map(([email, user]) => `
    <li>
      <form method="POST" action="/authorize/confirm">
        <input type="hidden" name="email" value="${email}">
        <input type="hidden" name="state" value="${state}">
        <input type="hidden" name="redirect_uri" value="${redirectUri}">
        <input type="hidden" name="nonce" value="${nonce}">
        <button type="submit">
          <strong>${user.name}</strong> (${email})<br>
          <span class="role role-${user.role}">${user.role}</span>
        </button>
      </form>
    </li>`).join('')}
  </ul>
</div>
</body></html>`);
    return;
  }

  // Authorization confirm — generates code and redirects
  if (path === '/authorize/confirm' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const email = params.get('email');
      const state = params.get('state');
      const redirectUri = params.get('redirect_uri');
      const nonce = params.get('nonce');

      const user = USERS[email];
      if (!user) {
        res.writeHead(400);
        res.end('Unknown user');
        return;
      }

      // Generate auth code
      const code = `code-${crypto.randomBytes(16).toString('hex')}`;
      authCodes.set(code, {
        email,
        user,
        nonce,
        createdAt: Date.now(),
      });

      // Redirect back to HookSniff with code
      const redirectUrl = `${redirectUri}?code=${code}&state=${state}`;
      console.log(`  → Redirecting to: ${redirectUrl.substring(0, 100)}...`);
      res.writeHead(302, { Location: redirectUrl });
      res.end();
    });
    return;
  }

  // Token endpoint — exchanges code for tokens
  if (path === '/token' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const code = params.get('code');
      const grantType = params.get('grant_type');
      const clientId = params.get('client_id');
      const clientSecret = params.get('client_secret');

      console.log(`  → Token request: grant=${grantType}, client=${clientId}, code=${code?.substring(0, 20)}...`);

      if (grantType !== 'authorization_code') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'unsupported_grant_type' }));
        return;
      }

      // Validate client credentials
      if (clientId !== 'hooksniff-client' || clientSecret !== 'hooksniff-secret') {
        console.log(`  → Invalid client credentials: id=${clientId}, secret=${clientSecret?.substring(0, 8)}...`);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_client' }));
        return;
      }

      const codeData = authCodes.get(code);
      if (!codeData) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_grant' }));
        return;
      }

      authCodes.delete(code);

      const { user, nonce } = codeData;

      // Create ID token
      const idToken = createJwt({
        sub: user.id,
        email: user.email,
        name: user.name,
        given_name: user.given_name,
        family_name: user.family_name,
        nonce: nonce || undefined,
        email_verified: true,
      });

      console.log(`  → Token issued for: ${user.email}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        access_token: `access-${crypto.randomBytes(16).toString('hex')}`,
        id_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
      }));
    });
    return;
  }

  // Userinfo endpoint
  if (path === '/userinfo') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      sub: 'user-001',
      email: 'user@testcorp.com',
      name: 'Test User',
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found', path }));
});

server.listen(PORT, () => {
  console.log(`\n🔐 Mock OIDC IdP running on http://localhost:${PORT}`);
  console.log(`   Discovery: http://localhost:${PORT}/.well-known/openid-configuration`);
  console.log(`   JWKS:      http://localhost:${PORT}/jwks`);
  console.log(`   Users:     ${Object.keys(USERS).join(', ')}\n`);
});
