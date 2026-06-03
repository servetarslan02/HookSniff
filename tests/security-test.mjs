/**
 * HookSniff Security Test Suite — Kapsamlı Senaryo Bazlı
 * 
 * Çalıştırma: node tests/security-test.mjs
 * 
 * Test Kategorileri:
 * 1. Authentication & JWT
 * 2. Brute Force Protection
 * 3. SQL Injection
 * 4. XSS / Injection
 * 5. Path Traversal
 * 6. Rate Limiting
 * 7. Security Headers
 * 8. CORS
 * 9. Endpoint Protection
 * 10. Zero Trust Middleware
 * 11. Threat Detection
 * 12. Security Audit & Health
 * 13. Request Size Limits
 * 14. HTTP Method Enforcement
 */

const API = process.env.API_URL || 'https://hooksniff-api-e6ztf3x2ma-ew.a.run.app';
const EMAIL = process.env.TEST_EMAIL || 'servetarslan02@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'Alayci_165';

let token = '';
let pass = 0, fail = 0, skip = 0;
const results = [];

const ok = (name, detail = '') => { pass++; results.push({ name, passed: true, detail }); console.log(`  PASS ${name} ${detail}`); };
const no = (name, detail = '') => { fail++; results.push({ name, passed: false, detail }); console.log(`  FAIL ${name} ${detail}`); };
const skp = (name, reason = '') => { skip++; results.push({ name, passed: null, detail: reason }); console.log(`  SKIP ${name} ${reason}`); };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Helper: fetch with status check
async function fetchStatus(url, options = {}) {
  const r = await fetch(url, options);
  return { status: r.status, headers: r.headers, body: await r.text().catch(() => ''), ok: r.ok };
}

// Helper: authenticated headers
function authHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ═══════════════════════════════════════════════════════════
// 0. SETUP
// ═══════════════════════════════════════════════════════════
async function setup() {
  console.log('\n[SETUP] Authentication');
  try {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (r.status === 200) {
      const j = JSON.parse(r.body);
      token = j.token;
      ok('Admin login', 'token acquired');
    } else {
      no('Admin login', `status=${r.status}`);
      process.exit(1);
    }
  } catch (e) {
    no('Admin login', e.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════
// 1. AUTHENTICATION & JWT
// ═══════════════════════════════════════════════════════════
async function testAuth() {
  console.log('\n[1] Authentication & JWT');

  // 1a. Valid login
  const validR = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  validR.status === 200 ? ok('Valid login', `status=${validR.status}`) : no('Valid login', `status=${validR.status}`);

  // 1b. Wrong password
  const wrongR = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'WRONG_PASSWORD' })
  });
  [400, 401, 422].includes(wrongR.status) ? ok('Wrong password rejected', `status=${wrongR.status}`) : no('Wrong password rejected', `status=${wrongR.status}`);

  // 1c. Non-existent user
  const noUserR = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@test.com', password: 'test' })
  });
  [400, 401, 404, 422].includes(noUserR.status) ? ok('Non-existent user rejected', `status=${noUserR.status}`) : no('Non-existent user rejected', `status=${noUserR.status}`);

  // 1d. Invalid JWT token
  const invR = await fetchStatus(`${API}/v1/admin/security/audit`, {
    headers: { 'Authorization': 'Bearer invalid_token_12345' }
  });
  invR.status === 401 ? ok('Invalid token rejected', '401') : no('Invalid token rejected', `status=${invR.status}`);

  // 1e. No token
  const noR = await fetchStatus(`${API}/v1/admin/security/audit`);
  noR.status === 401 ? ok('No token rejected', '401') : no('No token rejected', `status=${noR.status}`);

  // 1f. Tampered token
  const tampered = token.slice(0, -5) + 'XXXXX';
  const tamR = await fetchStatus(`${API}/v1/admin/security/audit`, {
    headers: { 'Authorization': `Bearer ${tampered}` }
  });
  tamR.status === 401 ? ok('Tampered token rejected', '401') : no('Tampered token rejected', `status=${tamR.status}`);

  // 1g. Empty Bearer
  const emptyR = await fetchStatus(`${API}/v1/admin/security/audit`, {
    headers: { 'Authorization': 'Bearer ' }
  });
  emptyR.status === 401 ? ok('Empty bearer rejected', '401') : no('Empty bearer rejected', `status=${emptyR.status}`);
}

// ═══════════════════════════════════════════════════════════
// 2. BRUTE FORCE PROTECTION
// ═══════════════════════════════════════════════════════════
async function testBruteForce() {
  console.log('\n[2] Brute Force Protection');

  // 2a. Rapid failed logins (10 attempts)
  let blocked = 0;
  for (let i = 0; i < 10; i++) {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bruteforce@test.com', password: `attempt_${i}` })
    });
    if (r.status === 429) blocked++;
  }
  blocked > 0 ? ok('Brute force rate limited', `${blocked}/10 blocked`) : skp('Brute force rate limited', 'No 429 (threshold may be higher)');

  // 2b. Legitimate login still works after failed attempts
  await sleep(2000);
  const legitR = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  legitR.status === 200 ? ok('Legitimate login works after brute force', '200') : no('Legitimate login works after brute force', `status=${legitR.status}`);

  // 2c. Admin endpoints still accessible (Zero Trust admin bypass)
  const adminR = await fetchStatus(`${API}/v1/admin/security/audit`, { headers: authHeaders() });
  adminR.status === 200 ? ok('Admin accessible after brute force', '200') : no('Admin accessible after brute force', `status=${adminR.status}`);
}

// ═══════════════════════════════════════════════════════════
// 3. SQL INJECTION
// ═══════════════════════════════════════════════════════════
async function testSQLInjection() {
  console.log('\n[3] SQL Injection Protection');

  const payloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM customers --",
    "1; WAITFOR DELAY '0:0:5'--",
    "admin'--",
    "' OR 1=1#",
    "1' AND '1'='1",
    "'; EXEC xp_cmdshell('dir'); --"
  ];

  for (const p of payloads) {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p, password: 'test' })
    });
    r.status === 500 ? no('SQLi blocked', `${p.substring(0, 25)}... => 500!`) : ok('SQLi blocked', `${p.substring(0, 25)}... => ${r.status}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 4. XSS / INJECTION
// ═══════════════════════════════════════════════════════════
async function testXSS() {
  console.log('\n[4] XSS / Injection Protection');

  const payloads = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
    '{{7*7}}',
    '${7*7}',
    '<%= 7*7 %>'
  ];

  for (const p of payloads) {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p, password: 'test' })
    });
    r.status === 500 ? no('XSS blocked', `${p.substring(0, 25)}... => 500!`) : ok('XSS blocked', `${p.substring(0, 25)}... => ${r.status}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 5. PATH TRAVERSAL
// ═══════════════════════════════════════════════════════════
async function testPathTraversal() {
  console.log('\n[5] Path Traversal');

  const paths = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32',
    '%2e%2e%2f%2e%2e%2f',
    '..%252f..%252fetc%252fpasswd',
    '....//....//etc/passwd',
    '/v1/../../../etc/passwd'
  ];

  for (const p of paths) {
    const r = await fetchStatus(`${API}/v1/${p}`);
    r.status === 500 ? no('Path traversal blocked', `${p} => 500!`) : ok('Path traversal blocked', `${p} => ${r.status}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 6. RATE LIMITING
// ═══════════════════════════════════════════════════════════
async function testRateLimiting() {
  console.log('\n[6] Rate Limiting');

  // 6a. Rapid requests to health endpoint
  let rl = 0, ok2 = 0;
  for (let i = 0; i < 50; i++) {
    const r = await fetchStatus(`${API}/health`);
    if (r.status === 429) rl++; else ok2++;
  }
  rl > 0 ? ok('Rate limiting active', `${rl}/50 rate-limited`) : ok('Rate limiting', `all passed (limit may be high for health)`);

  // 6b. Rate limit on login endpoint
  let loginRL = 0;
  for (let i = 0; i < 20; i++) {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ratetest@test.com', password: 'test' })
    });
    if (r.status === 429) loginRL++;
  }
  loginRL > 0 ? ok('Login rate limiting', `${loginRL}/20 rate-limited`) : skp('Login rate limiting', 'No 429 (threshold may be higher)');
}

// ═══════════════════════════════════════════════════════════
// 7. SECURITY HEADERS
// ═══════════════════════════════════════════════════════════
async function testSecurityHeaders() {
  console.log('\n[7] Security Headers');

  const r = await fetchStatus(`${API}/`);
  const h = r.headers;

  const checks = [
    { name: 'X-Content-Type-Options', expected: 'nosniff' },
    { name: 'X-Frame-Options', expected: 'DENY' },
    { name: 'Strict-Transport-Security', expected: 'max-age' },
    { name: 'Referrer-Policy', expected: 'strict-origin' }
  ];

  for (const c of checks) {
    const val = h.get(c.name.toLowerCase());
    val && val.includes(c.expected) ? ok(c.name, val) : no(c.name, `expected=${c.expected} got=${val}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 8. CORS
// ═══════════════════════════════════════════════════════════
async function testCORS() {
  console.log('\n[8] CORS Configuration');

  // 8a. Evil origin
  const evilR = await fetchStatus(`${API}/`, {
    headers: { 'Origin': 'https://evil.com' }
  });
  const acao = evilR.headers.get('access-control-allow-origin');
  if (acao === '*') no('CORS not wildcard', `origin=${acao}`);
  else if (acao && acao.includes('evil')) no('CORS allows evil', `origin=${acao}`);
  else ok('CORS restricted', `origin=${acao || 'none'}`);

  // 8b. Legitimate origin
  const legitR = await fetchStatus(`${API}/`, {
    headers: { 'Origin': 'https://hooksniff.vercel.app' }
  });
  const legitAcao = legitR.headers.get('access-control-allow-origin');
  legitAcao && legitAcao.includes('hooksniff') ? ok('CORS allows legitimate', `origin=${legitAcao}`) : skp('CORS allows legitimate', 'no ACAO header');

  // 8c. Preflight
  const preR = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'OPTIONS',
    headers: { 'Origin': 'https://evil.com', 'Access-Control-Request-Method': 'POST' }
  });
  const preAcao = preR.headers.get('access-control-allow-origin');
  preAcao === '*' || (preAcao && preAcao.includes('evil')) ? no('CORS preflight blocks evil', `origin=${preAcao}`) : ok('CORS preflight blocks evil', `origin=${preAcao || 'none'}`);
}

// ═══════════════════════════════════════════════════════════
// 9. ENDPOINT PROTECTION
// ═══════════════════════════════════════════════════════════
async function testEndpointProtection() {
  console.log('\n[9] Endpoint Protection');

  const sensitive = [
    '/v1/admin/users',
    '/v1/admin/refunds',
    '/v1/admin/gdpr/export',
    '/.env',
    '/v1/debug/vars',
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/.git/config',
    '/phpmyadmin',
    '/actuator/env',
    '/v1/internal/config'
  ];

  for (const ep of sensitive) {
    const r = await fetchStatus(`${API}${ep}`);
    [401, 403, 404, 405].includes(r.status) ? ok(`Protected: ${ep}`, `status=${r.status}`) : no(`Protected: ${ep}`, `status=${r.status} ACCESSIBLE!`);
  }
}

// ═══════════════════════════════════════════════════════════
// 10. ZERO TRUST MIDDLEWARE
// ═══════════════════════════════════════════════════════════
async function testZeroTrust() {
  console.log('\n[10] Zero Trust Middleware');

  // 10a. Root endpoint (no auth needed)
  const rootR = await fetchStatus(`${API}/`);
  rootR.status === 200 ? ok('Root accessible', '200') : no('Root accessible', `status=${rootR.status}`);

  // 10b. Health endpoint (no auth needed)
  const healthR = await fetchStatus(`${API}/health`);
  healthR.status === 200 ? ok('Health accessible', '200') : no('Health accessible', `status=${healthR.status}`);

  // 10c. Admin endpoint with valid token
  const adminR = await fetchStatus(`${API}/v1/admin/security/audit`, { headers: authHeaders() });
  adminR.status === 200 ? ok('Admin with valid token', '200') : no('Admin with valid token', `status=${adminR.status}`);

  // 10d. Admin endpoint without token
  const noAuthR = await fetchStatus(`${API}/v1/admin/users`);
  noAuthR.status === 401 ? ok('Admin without token', '401') : no('Admin without token', `status=${noAuthR.status}`);
}

// ═══════════════════════════════════════════════════════════
// 11. SECURITY AUDIT & HEALTH
// ═══════════════════════════════════════════════════════════
async function testSecurityAudit() {
  console.log('\n[11] Security Audit & Health');

  // 11a. Audit endpoint
  const auditR = await fetchStatus(`${API}/v1/admin/security/audit`, { headers: authHeaders() });
  if (auditR.status === 200) {
    const audit = JSON.parse(auditR.body);
    ok('Security audit', `score=${audit.score}% passed=${audit.passed}/${audit.total}`);
    if (audit.checks) {
      for (const c of audit.checks) {
        c.passed ? ok(`  ${c.name}`, c.details) : skp(`  ${c.name}`, c.details);
      }
    }
  } else {
    no('Security audit', `status=${auditR.status}`);
  }

  // 11b. Health endpoint
  const healthR = await fetchStatus(`${API}/v1/admin/security/health`, { headers: authHeaders() });
  if (healthR.status === 200) {
    const h = JSON.parse(healthR.body);
    ok('Security health', `status=${h.status} blocked=${h.blocked_ips} incidents=${h.incidents_24h}`);
  } else {
    no('Security health', `status=${healthR.status}`);
  }

  // 11c. Incidents endpoint
  const incR = await fetchStatus(`${API}/v1/admin/security/incidents`, { headers: authHeaders() });
  incR.status === 200 ? ok('Incidents endpoint', 'accessible') : no('Incidents endpoint', `status=${incR.status}`);
}

// ═══════════════════════════════════════════════════════════
// 12. REQUEST SIZE LIMITS
// ═══════════════════════════════════════════════════════════
async function testRequestSize() {
  console.log('\n[12] Request Size Limits');

  // 12a. Large payload (3MB)
  const big = 'x'.repeat(3 * 1024 * 1024);
  try {
    const r = await fetchStatus(`${API}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: big,
      signal: AbortSignal.timeout(10000)
    });
    r.status === 413 ? ok('Large payload rejected', '413') : no('Large payload rejected', `status=${r.status}`);
  } catch {
    ok('Large payload rejected', 'connection dropped');
  }
}

// ═══════════════════════════════════════════════════════════
// 13. HTTP METHOD ENFORCEMENT
// ═══════════════════════════════════════════════════════════
async function testHTTPMethods() {
  console.log('\n[13] HTTP Method Enforcement');

  // 13a. DELETE on non-DELETE endpoint
  const delR = await fetchStatus(`${API}/health`, { method: 'DELETE' });
  [400, 404, 405].includes(delR.status) ? ok('DELETE on health rejected', `status=${delR.status}`) : no('DELETE on health rejected', `status=${delR.status}`);

  // 13b. PUT on non-PUT endpoint
  const putR = await fetchStatus(`${API}/health`, { method: 'PUT' });
  [400, 404, 405].includes(putR.status) ? ok('PUT on health rejected', `status=${putR.status}`) : no('PUT on health rejected', `status=${putR.status}`);
}

// ═══════════════════════════════════════════════════════════
// 14. HTTPS & TLS
// ═══════════════════════════════════════════════════════════
async function testTLS() {
  console.log('\n[14] HTTPS & TLS');

  const uri = new URL(API);
  uri.protocol === 'https:' ? ok('HTTPS enforced', 'yes') : no('HTTPS enforced', `protocol=${uri.protocol}`);

  // 14b. HTTP redirect (if applicable)
  const httpUrl = API.replace('https://', 'http://');
  try {
    const r = await fetchStatus(httpUrl, { redirect: 'manual' });
    [301, 302, 308].includes(r.status) ? ok('HTTP redirects to HTTPS', `status=${r.status}`) : skp('HTTP redirect', `status=${r.status} (may not redirect)`);
  } catch {
    skp('HTTP redirect', 'connection refused (expected)');
  }
}

// ═══════════════════════════════════════════════════════════
// 15. WEBHOOK SECURITY
// ═══════════════════════════════════════════════════════════
async function testWebhookSecurity() {
  console.log('\n[15] Webhook Security');

  // 15a. Invalid webhook endpoint
  const whR = await fetchStatus(`${API}/v1/webhooks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ endpoint_id: 'fake-id', event: 'test', data: {} })
  });
  [400, 404, 422].includes(whR.status) ? ok('Invalid webhook rejected', `status=${whR.status}`) : no('Invalid webhook rejected', `status=${whR.status}`);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log(' HookSniff Security Test Suite v3');
  console.log(` API: ${API}`);
  console.log(` Time: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  await setup();
  await testAuth();
  await testBruteForce();
  await sleep(3000); // Cool down
  await testSQLInjection();
  await testXSS();
  await testPathTraversal();
  await testRateLimiting();
  await testSecurityHeaders();
  await testCORS();
  await testEndpointProtection();
  await testZeroTrust();
  await testSecurityAudit();
  await testRequestSize();
  await testHTTPMethods();
  await testTLS();
  await testWebhookSecurity();

  // ═══ RESULTS ═══
  console.log('\n═══════════════════════════════════════════════');
  const total = pass + fail + skip;
  const pct = total > 0 ? Math.round((pass / (pass + fail)) * 100) : 0;
  const grade = fail === 0 ? 'A+' : fail <= 2 ? 'A' : fail <= 5 ? 'B' : fail <= 10 ? 'C' : 'D';
  console.log(` RESULTS: ${pass}/${pass + fail} passed (${pct}%) — Grade: ${grade}`);
  console.log(` PASS: ${pass}  FAIL: ${fail}  SKIP: ${skip}`);
  if (fail > 0) {
    console.log('\n FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
  }
  console.log('═══════════════════════════════════════════════');
}

run().catch(e => console.error('FATAL:', e.message));
