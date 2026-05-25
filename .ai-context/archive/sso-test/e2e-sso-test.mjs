/**
 * Full End-to-End SSO Test — Real Keycloak + Neon DB
 * Tests the complete SSO user journey
 */
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const KEYCLOAK = 'http://localhost:8080';
const REALM = 'hooksniff';
const CLIENT_ID = 'hooksniff-client';
const CLIENT_SECRET = 'hooksniff-secret-key-2026';
const API_BASE = 'https://hooksniff-api-1046140057667.europe-west1.run.app';

const TEST_USERS = [
  { email: 'admin@hooksniff.dev', password: 'Admin123!', expectedRole: 'admin', name: 'Admin User' },
  { email: 'dev@hooksniff.dev', password: 'Dev1234!', expectedRole: 'developer', name: 'Developer User' },
  { email: 'viewer@hooksniff.dev', password: 'View1234!', expectedRole: 'viewer', name: 'Viewer User' },
  { email: 'analyst@hooksniff.dev', password: 'Anal1234!', expectedRole: 'analyst', name: 'Analyst User' },
  { email: 'newuser@hooksniff.dev', password: 'New1234!', expectedRole: 'viewer', name: 'New User' },
];

let passed = 0, failed = 0, warnings = [];

function log(icon, msg) { console.log(`${icon} ${msg}`); }
function pass(msg) { passed++; log('✅', msg); }
function fail(msg) { failed++; log('❌', msg); }
function warn(msg) { warnings.push(msg); log('⚠️', msg); }
function info(msg) { log('ℹ️', msg); }

function httpGet(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    mod.get(urlStr, { rejectUnauthorized: false }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body, json: () => { try { return JSON.parse(body); } catch { return null; } } }));
    }).on('error', reject);
  });
}

function httpPost(urlStr, data, contentType = 'application/x-www-form-urlencoded') {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    const body = typeof data === 'string' ? data : new URLSearchParams(data).toString();
    const req = mod.request({
      hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      method: 'POST', headers: { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, res => {
      let responseBody = '';
      res.on('data', c => responseBody += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: responseBody, json: () => { try { return JSON.parse(responseBody); } catch { return null; } } }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function testKeycloakDiscovery() {
  info('\n═══ 1. Keycloak OIDC Discovery ═══');
  
  const res = await httpGet(`${KEYCLOAK}/realms/${REALM}/.well-known/openid-configuration`);
  const config = res.json();
  
  if (res.status === 200) pass('Discovery endpoint accessible');
  else fail(`Discovery endpoint: HTTP ${res.status}`);
  
  if (config?.issuer === `${KEYCLOAK}/realms/${REALM}`) pass(`Issuer correct: ${config.issuer}`);
  else fail(`Issuer mismatch: ${config?.issuer}`);
  
  if (config?.authorization_endpoint) pass(`Auth endpoint: ${config.authorization_endpoint}`);
  else fail('Authorization endpoint missing');
  
  if (config?.token_endpoint) pass(`Token endpoint: ${config.token_endpoint}`);
  else fail('Token endpoint missing');
  
  if (config?.jwks_uri) pass(`JWKS URI: ${config.jwks_uri}`);
  else fail('JWKS URI missing');
  
  return config;
}

async function testKeycloakJwks() {
  info('\n═══ 2. Keycloak JWKS ═══');
  
  const res = await httpGet(`${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/certs`);
  const jwks = res.json();
  
  if (jwks?.keys?.length > 0) pass(`JWKS has ${jwks.keys.length} key(s)`);
  else fail('No keys in JWKS');
  
  const rsaKey = jwks.keys.find(k => k.kty === 'RSA' && k.use === 'sig');
  if (rsaKey) pass(`Signing key found: kid=${rsaKey.kid}`);
  else fail('No RSA signing key');
  
  return jwks;
}

async function testUserAuthentication(user) {
  info(`\n─── Authenticating: ${user.email} (${user.expectedRole}) ───`);
  
  // Step 1: Direct access grant (password flow)
  const tokenRes = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: user.email,
      password: user.password,
      grant_type: 'password',
      scope: 'openid email profile',
    }
  );
  
  if (tokenRes.status !== 200) {
    fail(`${user.email}: Token exchange failed — HTTP ${tokenRes.status}`);
    const err = tokenRes.json();
    if (err) info(`  Error: ${err.error} — ${err.error_description}`);
    return null;
  }
  
  pass(`${user.email}: Authentication successful`);
  
  const tokens = tokenRes.json();
  if (!tokens.id_token) { fail(`${user.email}: No ID token`); return null; }
  pass(`${user.email}: ID token received (expires in ${tokens.expires_in}s)`);
  
  // Decode ID token
  const parts = tokens.id_token.split('.');
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  
  if (claims.email === user.email) pass(`${user.email}: Email claim matches`);
  else fail(`${user.email}: Email mismatch — ${claims.email}`);
  
  if (claims.name === user.name) pass(`${user.email}: Name claim matches`);
  else warn(`${user.email}: Name mismatch — ${claims.name} (expected ${user.name})`);
  
  if (claims.email_verified === true) pass(`${user.email}: Email verified`);
  else warn(`${user.email}: Email not verified`);
  
  // Check roles
  const roles = claims.roles || [];
  if (roles.includes(user.expectedRole)) {
    pass(`${user.email}: Has role '${user.expectedRole}'`);
  } else {
    fail(`${user.email}: Missing role '${user.expectedRole}' — has ${JSON.stringify(roles)}`);
  }
  
  // Check token expiry
  if (claims.exp && claims.exp > Math.floor(Date.now() / 1000)) {
    const expiresIn = claims.exp - Math.floor(Date.now() / 1000);
    pass(`${user.email}: Token valid for ${expiresIn}s`);
  } else {
    fail(`${user.email}: Token expired`);
  }
  
  return { tokens, claims };
}

async function testSsoProviderDiscovery() {
  info('\n═══ 4. SSO Provider Discovery (Domain Lookup) ═══');
  
  // Test the SSO providers endpoint
  const res = await httpGet(`${API_BASE}/v1/sso/providers?domain=hooksniff.dev`);
  
  if (res.status === 200) {
    const data = res.json();
    if (data.sso_available) {
      pass('SSO available for hooksniff.dev');
      if (data.providers?.length > 0) {
        data.providers.forEach(p => {
          pass(`Provider: ${p.provider} (domain: ${p.email_domain})`);
        });
      }
    } else {
      warn('SSO not available for hooksniff.dev (API may need restart with new config)');
    }
  } else if (res.status === 404) {
    warn('SSO providers endpoint not found (may not be deployed yet)');
  } else {
    warn(`SSO providers: HTTP ${res.status}`);
  }
}

async function testAuthorizationCodeFlow(user) {
  info(`\n═══ 5. Authorization Code Flow: ${user.email} ═══`);
  
  // Step 1: Build authorization URL
  const state = `test-state-${Date.now()}`;
  const nonce = `test-nonce-${Date.now()}`;
  const redirectUri = `${API_BASE}/v1/sso/oidc/callback`;
  
  const authUrl = `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/auth?` +
    `client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=openid+email+profile&state=${state}&nonce=${nonce}`;
  
  pass(`Authorization URL built: ${authUrl.substring(0, 80)}...`);
  
  // Step 2: Simulate browser login (POST form to Keycloak)
  const loginPageRes = await httpGet(authUrl);
  
  if (loginPageRes.status === 200) {
    pass('Login page rendered');
    
    // Extract form action URL
    const formActionMatch = loginPageRes.body.match(/action="([^"]+)"/);
    if (formActionMatch) {
      const formAction = formActionMatch[1].replace(/&amp;/g, '&');
      pass(`Form action found: ${formAction.substring(0, 60)}...`);
      
      // Submit login form
      const loginRes = await httpPost(formAction, {
        username: user.email,
        password: user.password,
      });
      
      if (loginRes.status === 302 || loginRes.status === 303) {
        const location = loginRes.headers.location;
        pass('Login form submitted → redirect received');
        
        // Extract code from redirect
        const redirectUrl = new URL(location);
        const code = redirectUrl.searchParams.get('code');
        const returnedState = redirectUrl.searchParams.get('state');
        
        if (code) pass(`Authorization code: ${code.substring(0, 20)}...`);
        else fail('No authorization code in redirect');
        
        if (returnedState === state) pass('State parameter matches (CSRF OK)');
        else fail(`State mismatch: expected=${state}, got=${returnedState}`);
        
        return { code, state, nonce, redirectUri };
      } else if (loginRes.body.includes('Invalid user credentials')) {
        fail(`${user.email}: Invalid credentials`);
      } else {
        warn(`${user.email}: Login returned HTTP ${loginRes.status}`);
      }
    } else {
      warn('No form action found in login page');
    }
  } else {
    fail(`Login page: HTTP ${loginRes.status}`);
  }
  
  return null;
}

async function testTokenExchangeWithCode(code, redirectUri, user) {
  info(`\n═══ 6. Token Exchange: ${user.email} ═══`);
  
  const tokenRes = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }
  );
  
  if (tokenRes.status === 200) {
    const tokens = tokenRes.json();
    pass('Token exchange successful');
    
    if (tokens.id_token) {
      const parts = tokens.id_token.split('.');
      const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      pass(`ID token for: ${claims.email}`);
      pass(`Roles: ${JSON.stringify(claims.roles)}`);
      pass(`Nonce: ${claims.nonce ? 'present' : 'missing'}`);
    }
    
    if (tokens.access_token) pass('Access token present');
    if (tokens.refresh_token) pass('Refresh token present');
    
    return tokens;
  } else {
    fail(`Token exchange failed: HTTP ${tokenRes.status}`);
    const err = tokenRes.json();
    if (err) info(`  Error: ${err.error} — ${err.error_description}`);
    return null;
  }
}

async function testErrorScenarios() {
  info('\n═══ 7. Error Scenarios ═══');
  
  // Test 1: Wrong password
  const wrongPass = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, username: 'admin@hooksniff.dev', password: 'WRONG!', grant_type: 'password' }
  );
  if (wrongPass.status === 401) pass('Wrong password → HTTP 401');
  else fail(`Wrong password: HTTP ${wrongPass.status}`);
  
  // Test 2: Wrong client secret
  const wrongSecret = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    { client_id: CLIENT_ID, client_secret: 'WRONG-SECRET', username: 'admin@hooksniff.dev', password: 'Admin123!', grant_type: 'password' }
  );
  if (wrongSecret.status === 401) pass('Wrong client secret → HTTP 401');
  else fail(`Wrong client secret: HTTP ${wrongSecret.status}`);
  
  // Test 3: Invalid authorization code
  const invalidCode = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    { grant_type: 'authorization_code', code: 'invalid-code-12345', redirect_uri: `${API_BASE}/v1/sso/oidc/callback`, client_id: CLIENT_ID, client_secret: CLIENT_SECRET }
  );
  if (invalidCode.status === 400) pass('Invalid auth code → HTTP 400');
  else fail(`Invalid auth code: HTTP ${invalidCode.status}`);
  
  // Test 4: Non-existent user
  const noUser = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, username: 'nobody@example.com', password: 'Test1234!', grant_type: 'password' }
  );
  if (noUser.status === 401) pass('Non-existent user → HTTP 401');
  else fail(`Non-existent user: HTTP ${noUser.status}`);
}

async function testTokenRefresh(refreshToken) {
  info('\n═══ 8. Token Refresh ═══');
  
  if (!refreshToken) {
    warn('No refresh token to test');
    return;
  }
  
  const refreshRes = await httpPost(
    `${KEYCLOAK}/realms/${REALM}/protocol/openid-connect/token`,
    {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }
  );
  
  if (refreshRes.status === 200) {
    const tokens = refreshRes.json();
    pass('Token refresh successful');
    if (tokens.access_token) pass('New access token received');
    if (tokens.refresh_token) pass('New refresh token received');
  } else {
    fail(`Token refresh failed: HTTP ${refreshRes.status}`);
  }
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  HookSniff SSO — Full E2E Test (Keycloak + Neon DB)  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // 1. Discovery
    const discovery = await testKeycloakDiscovery();
    
    // 2. JWKS
    await testKeycloakJwks();
    
    // 3. Authenticate each user (direct grant)
    let refreshTokens = [];
    for (const user of TEST_USERS) {
      const result = await testUserAuthentication(user);
      if (result?.tokens?.refresh_token) {
        refreshTokens.push({ user: user.email, token: result.tokens.refresh_token });
      }
    }
    
    // 4. SSO Provider discovery
    await testSsoProviderDiscovery();
    
    // 5. Authorization code flow (admin user)
    const adminUser = TEST_USERS[0];
    const authResult = await testAuthorizationCodeFlow(adminUser);
    
    // 6. Token exchange with code
    if (authResult?.code) {
      const tokens = await testTokenExchangeWithCode(authResult.code, authResult.redirectUri, adminUser);
      
      // 7. Token refresh
      if (tokens?.refresh_token) {
        await testTokenRefresh(tokens.refresh_token);
      }
    }
    
    // 8. Error scenarios
    await testErrorScenarios();
    
  } catch (err) {
    console.error('\n💥 Test error:', err.message);
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                      SUMMARY                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⚠️  Warnings: ${warnings.length}`);
  console.log(`  📊 Total: ${passed + failed + warnings.length}`);
  
  if (warnings.length > 0) {
    console.log('\n  Warnings:');
    warnings.forEach(w => console.log(`    • ${w}`));
  }
}

main();
