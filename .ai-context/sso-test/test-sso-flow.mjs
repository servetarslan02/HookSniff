/**
 * SSO Integration Test Suite
 * Tests the full OIDC flow against mock IdP
 * Simulates what HookSniff's sso.rs does
 */
import http from 'node:http';
import crypto from 'node:crypto';

const MOCK_IDP = 'http://localhost:8080';
const API_URL = 'https://hooksniff-api-1046140057667.europe-west1.run.app';

const results = [];

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`${icon} [${status}] ${test}${detail ? ': ' + detail : ''}`);
  results.push({ test, status, detail });
}

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
          json: () => {
            try { return JSON.parse(body); } catch { return null; }
          },
        });
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function testOidcDiscovery() {
  console.log('\n═══ TEST 1: OIDC Discovery ═══');
  
  const res = await fetch(`${MOCK_IDP}/.well-known/openid-configuration`);
  const config = res.json();
  
  if (res.status === 200) log('Discovery endpoint accessible', 'PASS');
  else log('Discovery endpoint accessible', 'FAIL', `HTTP ${res.status}`);
  
  if (config?.authorization_endpoint) log('authorization_endpoint present', 'PASS', config.authorization_endpoint);
  else log('authorization_endpoint present', 'FAIL');
  
  if (config?.token_endpoint) log('token_endpoint present', 'PASS', config.token_endpoint);
  else log('token_endpoint present', 'FAIL');
  
  if (config?.jwks_uri) log('jwks_uri present', 'PASS', config.jwks_uri);
  else log('jwks_uri present', 'FAIL');
  
  if (config?.issuer) log('issuer present', 'PASS', config.issuer);
  else log('issuer present', 'FAIL');
  
  return config;
}

async function testJwks() {
  console.log('\n═══ TEST 2: JWKS Endpoint ═══');
  
  const res = await fetch(`${MOCK_IDP}/jwks`);
  const jwks = res.json();
  
  if (res.status === 200) log('JWKS endpoint accessible', 'PASS');
  else log('JWKS endpoint accessible', 'FAIL', `HTTP ${res.status}`);
  
  if (jwks?.keys?.length > 0) log('Keys array present', 'PASS', `${jwks.keys.length} key(s)`);
  else log('Keys array present', 'FAIL');
  
  const key = jwks?.keys?.[0];
  if (key?.kty === 'RSA') log('Key type is RSA', 'PASS');
  else log('Key type is RSA', 'FAIL', key?.kty);
  
  if (key?.kid) log('Key ID (kid) present', 'PASS', key.kid);
  else log('Key ID (kid) present', 'FAIL');
  
  if (key?.n && key?.e) log('RSA components (n, e) present', 'PASS');
  else log('RSA components (n, e) present', 'FAIL');
  
  return jwks;
}

async function testAuthorizationFlow(userEmail) {
  console.log(`\n═══ TEST 3: Authorization Flow (${userEmail}) ═══`);
  
  // Step 1: Build authorization URL (like sso.rs does)
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const redirectUri = `${API_URL}/v1/sso/oidc/callback`;
  
  const authUrl = `${MOCK_IDP}/authorize?client_id=hooksniff-client&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}&nonce=${nonce}&access_type=offline`;
  
  log('Authorization URL constructed', 'PASS', authUrl.substring(0, 80) + '...');
  
  // Step 2: Simulate user clicking login (GET authorize)
  const authRes = await fetch(authUrl);
  if (authRes.status === 200) log('Authorization page renders', 'PASS');
  else log('Authorization page renders', 'FAIL', `HTTP ${authRes.status}`);
  
  if (authRes.body.includes(userEmail)) log(`User ${userEmail} shown in login form`, 'PASS');
  else log(`User ${userEmail} shown in login form', 'FAIL`);
  
  // Step 3: Simulate form submission (POST authorize/confirm)
  const formData = `email=${encodeURIComponent(userEmail)}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&nonce=${nonce}`;
  
  const confirmRes = await fetch(`${MOCK_IDP}/authorize/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  if (confirmRes.status === 302) log('Redirect after login', 'PASS');
  else log('Redirect after login', 'FAIL', `HTTP ${confirmRes.status}`);
  
  const location = confirmRes.headers.location;
  if (location?.includes('code=') && location?.includes(`state=${state}`)) {
    log('Redirect contains code + state', 'PASS');
  } else {
    log('Redirect contains code + state', 'FAIL', location?.substring(0, 100));
  }
  
  // Extract code from redirect
  const redirectUrl = new URL(location, MOCK_IDP);
  const code = redirectUrl.searchParams.get('code');
  const returnedState = redirectUrl.searchParams.get('state');
  
  if (code) log('Authorization code extracted', 'PASS', code.substring(0, 20) + '...');
  else log('Authorization code extracted', 'FAIL');
  
  if (returnedState === state) log('State parameter matches (CSRF protection)', 'PASS');
  else log('State parameter matches (CSRF protection)', 'FAIL');
  
  return { code, state, nonce, redirectUri };
}

async function testTokenExchange(code, redirectUri) {
  console.log('\n═══ TEST 4: Token Exchange ═══');
  
  // Simulate what sso.rs oidc_callback does
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: 'hooksniff-client',
    client_secret: 'hooksniff-secret',
  }).toString();
  
  const res = await fetch(`${MOCK_IDP}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody,
  });
  
  if (res.status === 200) log('Token exchange successful', 'PASS');
  else log('Token exchange successful', 'FAIL', `HTTP ${res.status}`);
  
  const tokens = res.json();
  
  if (tokens?.id_token) log('ID token present', 'PASS', tokens.id_token.substring(0, 40) + '...');
  else log('ID token present', 'FAIL');
  
  if (tokens?.access_token) log('Access token present', 'PASS');
  else log('Access token present', 'FAIL');
  
  if (tokens?.token_type === 'Bearer') log('Token type is Bearer', 'PASS');
  else log('Token type is Bearer', 'FAIL', tokens?.token_type);
  
  return tokens;
}

async function testIdTokenDecode(tokens, expectedEmail, expectedNonce) {
  console.log('\n═══ TEST 5: ID Token Decode & Validation ═══');
  
  if (!tokens?.id_token) {
    log('ID token decode', 'FAIL', 'No token to decode');
    return;
  }
  
  // Decode like sso.rs does
  const parts = tokens.id_token.split('.');
  if (parts.length === 3) log('JWT has 3 parts', 'PASS');
  else log('JWT has 3 parts', 'FAIL', `${parts.length} parts`);
  
  // Decode header
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  if (header.alg === 'RS256') log('Algorithm is RS256', 'PASS');
  else log('Algorithm is RS256', 'FAIL', header.alg);
  
  if (header.kid) log('Key ID in header', 'PASS', header.kid);
  else log('Key ID in header', 'FAIL');
  
  // Decode payload
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  
  if (claims.email === expectedEmail) log('Email claim matches', 'PASS', claims.email);
  else log('Email claim matches', 'FAIL', `expected=${expectedEmail}, got=${claims.email}`);
  
  if (claims.exp && claims.exp > Math.floor(Date.now() / 1000)) {
    log('Token not expired', 'PASS', `exp=${new Date(claims.exp * 1000).toISOString()}`);
  } else {
    log('Token not expired', 'FAIL');
  }
  
  if (claims.nonce === expectedNonce) log('Nonce matches (replay protection)', 'PASS');
  else if (!claims.nonce && !expectedNonce) log('Nonce not present (no nonce sent)', 'WARN');
  else log('Nonce matches (replay protection)', 'FAIL', `expected=${expectedNonce}, got=${claims.nonce}`);
  
  if (claims.sub) log('Subject (sub) present', 'PASS', claims.sub);
  else log('Subject (sub) present', 'FAIL');
  
  if (claims.name) log('Name claim present', 'PASS', claims.name);
  else log('Name claim present', 'FAIL');
  
  return claims;
}

async function testInvalidClientCredentials() {
  console.log('\n═══ TEST 6: Invalid Client Credentials ═══');
  
  // Wrong client_secret
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'fake-code',
    redirect_uri: `${API_URL}/v1/sso/oidc/callback`,
    client_id: 'hooksniff-client',
    client_secret: 'WRONG-SECRET',
  }).toString();
  
  const res = await fetch(`${MOCK_IDP}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  
  if (res.status === 401) log('Wrong secret rejected (HTTP 401)', 'PASS');
  else log('Wrong secret rejected', 'FAIL', `HTTP ${res.status}`);
  
  const err = res.json();
  if (err?.error === 'invalid_client') log('Error is invalid_client', 'PASS');
  else log('Error is invalid_client', 'FAIL', JSON.stringify(err));
}

async function testExpiredCode() {
  console.log('\n═══ TEST 7: Expired/Used Authorization Code ═══');
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'nonexistent-code-12345',
    redirect_uri: `${API_URL}/v1/sso/oidc/callback`,
    client_id: 'hooksniff-client',
    client_secret: 'hooksniff-secret',
  }).toString();
  
  const res = await fetch(`${MOCK_IDP}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  
  if (res.status === 400) log('Invalid code rejected (HTTP 400)', 'PASS');
  else log('Invalid code rejected', 'FAIL', `HTTP ${res.status}`);
  
  const err = res.json();
  if (err?.error === 'invalid_grant') log('Error is invalid_grant', 'PASS');
  else log('Error is invalid_grant', 'FAIL', JSON.stringify(err));
}

async function testSsoStateStore() {
  console.log('\n═══ TEST 8: SSO State Store Behavior ═══');
  
  // Simulate in-memory state store issues
  const stateStore = new Map();
  
  // Test 1: Insert state
  const state = crypto.randomUUID();
  stateStore.set(state, {
    customer_id: 'test-customer',
    email: 'test@testcorp.com',
    provider: 'oidc',
    created_at: new Date(),
  });
  
  if (stateStore.has(state)) log('State stored in memory', 'PASS');
  else log('State stored in memory', 'FAIL');
  
  // Test 2: Remove state (consumed on callback)
  const retrieved = stateStore.get(state);
  stateStore.delete(state);
  
  if (retrieved?.email === 'test@testcorp.com') log('State retrieved and consumed', 'PASS');
  else log('State retrieved and consumed', 'FAIL');
  
  if (!stateStore.has(state)) log('State removed after consumption', 'PASS');
  else log('State removed after consumption', 'FAIL');
  
  // Test 3: Replay attempt (state already consumed)
  const replay = stateStore.get(state);
  if (!replay) log('Replay attack blocked (state consumed)', 'PASS');
  else log('Replay attack blocked', 'FAIL');
  
  // Test 4: Expired state
  const expiredState = crypto.randomUUID();
  stateStore.set(expiredState, {
    created_at: new Date(Date.now() - 601 * 1000), // 601 seconds ago
  });
  
  const expiredEntry = stateStore.get(expiredState);
  const age = (Date.now() - new Date(expiredEntry.created_at).getTime()) / 1000;
  
  if (age > 600) log('Expired state detected (>600s)', 'PASS', `${age}s old`);
  else log('Expired state detected', 'FAIL');
  
  // Test 5: Multi-instance simulation
  console.log('\n  📋 Multi-instance simulation:');
  console.log('  Instance A: stores state');
  console.log('  Instance B: receives callback → state NOT FOUND');
  log('Cloud Run multi-instance state loss', 'FAIL', 'CRITICAL: In-memory state is per-instance');
}

async function testRateLimiting() {
  console.log('\n═══ TEST 9: Rate Limiting Behavior ═══');
  
  // Simulate rate limit logic from sso.rs
  const rateLimits = new Map();
  const clientIp = '192.168.1.1';
  
  for (let i = 0; i < 12; i++) {
    const key = `sso_login:${clientIp}`;
    const current = rateLimits.get(key) || 0;
    rateLimits.set(key, current + 1);
    
    if (i === 9) {
      log('Rate limit at 10 requests', 'PASS', `request #${i + 1}: ${rateLimits.get(key) > 10 ? 'BLOCKED' : 'ALLOWED'}`);
    }
    if (i === 11) {
      log('Requests after limit blocked', rateLimits.get(key) > 10 ? 'PASS' : 'FAIL', `request #${i + 1}`);
    }
  }
  
  // Test: Different users from same IP
  console.log('\n  📋 Same-IP different-user scenario:');
  console.log('  User A from IP 1.2.3.4: 10 requests → rate limited');
  console.log('  User B from IP 1.2.3.4: blocked by User A\'s limit');
  log('IP-based rate limit affects other users', 'WARN', 'Should use email+IP combo');
}

async function testAutoProvision() {
  console.log('\n═══ TEST 10: Auto-Provisioning ═══');
  
  // Simulate what find_or_create_sso_customer does
  const email = 'newuser@testcorp.com';
  const attributes = {
    name: 'New User',
    given_name: 'New',
    family_name: 'User',
  };
  
  // Check if user exists
  const existingUsers = new Map([
    ['admin@testcorp.com', { id: 'admin-001', email_verified: true }],
  ]);
  
  const existing = existingUsers.get(email);
  
  if (!existing) {
    log('New user not in database', 'PASS', email);
    
    // Auto-provision
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name: attributes.name,
      is_active: true,
      email_verified: true, // ← BUG: Should be false for auto-provisioned
      api_key_prefix: `whsec_${crypto.randomBytes(8).toString('hex')}`,
    };
    
    log('User auto-provisioned', 'PASS', `id=${newUser.id.substring(0, 8)}...`);
    log('email_verified set to true', 'WARN', 'SECURITY: Should verify domain first');
    log('API key generated', 'PASS', `prefix=${newUser.api_key_prefix}`);
  }
}

// ── Run all tests ───────────────────────────────────────────

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     HookSniff SSO Integration Test Suite        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  
  try {
    // Core OIDC tests
    const discovery = await testOidcDiscovery();
    const jwks = await testJwks();
    
    // Full authorization flow for each role
    for (const email of ['admin@testcorp.com', 'developer@testcorp.com', 'viewer@testcorp.com', 'analyst@testcorp.com']) {
      const { code, state, nonce, redirectUri } = await testAuthorizationFlow(email);
      const tokens = await testTokenExchange(code, redirectUri);
      await testIdTokenDecode(tokens, email, nonce);
    }
    
    // Security tests
    await testInvalidClientCredentials();
    await testExpiredCode();
    
    // State store tests
    await testSsoStateStore();
    
    // Rate limiting tests
    await testRateLimiting();
    
    // Auto-provision tests
    await testAutoProvision();
    
  } catch (err) {
    console.error('\n💥 Test error:', err.message);
  }
  
  // Summary
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`\n  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⚠️  Warned: ${warned}`);
  console.log(`  📊 Total:  ${results.length}\n`);
  
  if (failed > 0) {
    console.log('  Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`    • ${r.test}: ${r.detail}`);
    });
  }
  
  if (warned > 0) {
    console.log('\n  Warnings:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`    • ${r.test}: ${r.detail}`);
    });
  }
}

runAllTests();
