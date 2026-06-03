/**
 * HookSniff Billing Test Suite
 * Tests: subscription, invoices, usage, settings, auth, compliance
 */

const API = 'https://hooksniff-api-499907444852.europe-west1.run.app';
const EMAIL = 'servetarslan02@gmail.com';
const PASSWORD = 'Alayci_165';
let token = '';
let pass = 0, fail = 0, skip = 0;

const ok = (n, d = '') => { pass++; console.log(`  PASS ${n} ${d}`); };
const no = (n, d = '') => { fail++; console.log(`  FAIL ${n} ${d}`); };
const skp = (n, d = '') => { skip++; console.log(`  SKIP ${n} ${d}`); };

async function fetchStatus(url, opts = {}) {
  const r = await fetch(url, opts);
  return { status: r.status, body: await r.text().catch(() => ''), ok: r.ok };
}

async function run() {
  console.log('=== Billing Test Suite ===');
  console.log(`API: ${API}\n`);

  // 0. Login
  const lr = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (lr.status !== 200) { no('Login', `status=${lr.status}`); return; }
  token = JSON.parse(lr.body).token;
  ok('Login');
  const H = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 1. Subscription
  console.log('\n[1] Subscription');
  const sr = await fetchStatus(`${API}/v1/billing/subscription`, { headers: H });
  if (sr.status === 200) {
    const s = JSON.parse(sr.body);
    ok('Subscription', `plan=${s.plan || s.plan_name || 'unknown'} status=${s.status || s.subscription_status || 'unknown'}`);
    s.cancel_at_period_end !== undefined ? ok('Cancel at period end', `${s.cancel_at_period_end}`) : skp('Cancel at period end', 'field missing');
    s.current_period_end ? ok('Period end', s.current_period_end) : skp('Period end', 'field missing');
  } else { no('Subscription', `status=${sr.status}`); }

  // 2. Invoices
  console.log('\n[2] Invoices');
  const ir = await fetchStatus(`${API}/v1/billing/invoices`, { headers: H });
  if (ir.status === 200) {
    const inv = JSON.parse(ir.body);
    const invoices = Array.isArray(inv) ? inv : inv.invoices || inv.data || [];
    ok('Invoices', `count=${invoices.length}`);
    if (invoices.length > 0) {
      const f = invoices[0];
      f.amount_cents !== undefined || f.amount !== undefined ? ok('Amount field', 'present') : no('Amount field', 'missing');
      f.status !== undefined ? ok('Status field', f.status) : no('Status field', 'missing');
      const ids = invoices.map(i => i.provider_invoice_id).filter(Boolean);
      new Set(ids).size === ids.length ? ok('Idempotency', 'no duplicates') : no('Idempotency', 'duplicates!');
    }
  } else { no('Invoices', `status=${ir.status}`); }

  // 3. Usage
  console.log('\n[3] Usage');
  const ur = await fetchStatus(`${API}/v1/billing/usage`, { headers: H });
  if (ur.status === 200) {
    const u = JSON.parse(ur.body);
    ok('Usage', `plan=${u.plan} webhooks=${u.webhooks?.used}/${u.webhooks?.limit} endpoints=${u.endpoints?.used}/${u.endpoints?.limit}`);
    u.webhooks ? ok('Webhooks counter', 'present') : no('Webhooks counter', 'missing');
    u.endpoints ? ok('Endpoints counter', 'present') : no('Endpoints counter', 'missing');
    u.rate_limit ? ok('Rate limit', `rpm=${u.rate_limit.requests_per_minute}`) : no('Rate limit', 'missing');
    u.retention_days ? ok('Retention', `${u.retention_days}d`) : no('Retention', 'missing');
    u.period?.start && u.period?.end ? ok('Period', `${u.period.start} to ${u.period.end}`) : no('Period', 'missing');
  } else { no('Usage', `status=${ur.status}`); }

  // 4. Settings
  console.log('\n[4] Settings');
  const setr = await fetchStatus(`${API}/v1/billing/settings`, { headers: H });
  if (setr.status === 200) {
    const set = JSON.parse(setr.body);
    ok('Settings', 'accessible');
    set.allow_overage !== undefined ? ok('Allow overage', `${set.allow_overage}`) : skp('Allow overage', 'missing');
  } else { no('Settings', `status=${setr.status}`); }

  // 5. Auth Protection
  console.log('\n[5] Auth Protection');
  const nor = await fetchStatus(`${API}/v1/billing/subscription`);
  nor.status === 401 ? ok('No token rejected', '401') : no('No token rejected', `${nor.status}`);
  const invr = await fetchStatus(`${API}/v1/billing/subscription`, { headers: { 'Authorization': 'Bearer fake' } });
  invr.status === 401 ? ok('Invalid token rejected', '401') : no('Invalid token rejected', `${invr.status}`);

  // 6. Overage Compliance
  console.log('\n[6] Overage Compliance');
  if (setr.status === 200) {
    const set = JSON.parse(setr.body);
    if (set.allow_overage && !set.overage_terms_accepted_at) {
      no('Overage consent', 'overage enabled without consent!');
    } else {
      ok('Overage consent', set.allow_overage ? 'accepted' : 'disabled');
    }
  }

  // 7. Results
  console.log('\n========================');
  const total = pass + fail;
  console.log(`RESULTS: ${pass}/${total} passed (${total > 0 ? Math.round(pass/total*100) : 0}%)`);
  console.log(`PASS: ${pass}  FAIL: ${fail}  SKIP: ${skip}`);
  console.log('========================');
}

run().catch(e => console.error('FATAL:', e.message));
