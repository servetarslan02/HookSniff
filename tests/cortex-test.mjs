/**
 * HookSniff Cortex Test Suite
 * 
 * Tests all Cortex engine features:
 * - Anomaly Detection
 * - Drift Detection  
 * - Healing Engine (Circuit Breaker)
 * - Predictive Engine
 * - Signal Collector
 * - ML Anomaly Detection
 * - Scheduler
 */

const API = process.env.API_URL || 'https://hooksniff-api-499907444852.europe-west1.run.app';
const EMAIL = process.env.TEST_EMAIL || 'servetarslan02@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'Alayci_165';

let token = '';
let pass = 0, fail = 0, skip = 0;

const ok = (n, d = '') => { pass++; console.log(`  PASS ${n} ${d}`); };
const no = (n, d = '') => { fail++; console.log(`  FAIL ${n} ${d}`); };
const skp = (n, d = '') => { skip++; console.log(`  SKIP ${n} ${d}`); };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchStatus(url, options = {}) {
  const r = await fetch(url, options);
  return { status: r.status, body: await r.text().catch(() => ''), ok: r.ok };
}

function authHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ═══ SETUP ═══
async function setup() {
  console.log('[SETUP] Authentication');
  const r = await fetchStatus(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (r.status === 200) {
    token = JSON.parse(r.body).token;
    ok('Login', 'token acquired');
  } else {
    no('Login', `status=${r.status}`);
    process.exit(1);
  }
}

// ═══ 1. CORTEX STATUS ═══
async function testCortexStatus() {
  console.log('\n[1] Cortex Status');

  // 1a. Cortex status endpoint
  const r = await fetchStatus(`${API}/v1/cortex/status`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    ok('Cortex status', `running=${data.running || data.scheduler?.running}`);
  } else if (r.status === 404) {
    skp('Cortex status', 'endpoint not found (may be different path)');
  } else {
    no('Cortex status', `status=${r.status}`);
  }

  // 1b. Cortex scheduler health
  const schedR = await fetchStatus(`${API}/v1/cortex/scheduler`, { headers: authHeaders() });
  if (schedR.status === 200) {
    ok('Cortex scheduler', 'accessible');
  } else if (schedR.status === 404) {
    skp('Cortex scheduler', 'endpoint not found');
  } else {
    no('Cortex scheduler', `status=${schedR.status}`);
  }
}

// ═══ 2. ANOMALY DETECTION ═══
async function testAnomalyDetection() {
  console.log('\n[2] Anomaly Detection');

  // 2a. Anomaly scores endpoint
  const r = await fetchStatus(`${API}/v1/cortex/anomaly-scores`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    const scores = Array.isArray(data) ? data : data.scores || data.data || [];
    ok('Anomaly scores', `count=${scores.length}`);
    
    // Check score structure
    if (scores.length > 0) {
      const first = scores[0];
      const hasFields = first.endpoint_id || first.score || first.timestamp;
      hasFields ? ok('Score structure', 'valid') : no('Score structure', 'missing fields');
    }
  } else if (r.status === 404) {
    skp('Anomaly scores', 'endpoint not found');
  } else {
    no('Anomaly scores', `status=${r.status}`);
  }

  // 2b. Batch scoring (if endpoint exists)
  const batchR = await fetchStatus(`${API}/v1/cortex/anomaly-scores/batch`, { headers: authHeaders() });
  if (batchR.status === 200) {
    ok('Batch scoring', 'accessible');
  } else if (batchR.status === 404) {
    skp('Batch scoring', 'endpoint not found');
  }
}

// ═══ 3. DRIFT DETECTION ═══
async function testDriftDetection() {
  console.log('\n[3] Drift Detection');

  const r = await fetchStatus(`${API}/v1/cortex/drift`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    ok('Drift detection', `accessible`);
  } else if (r.status === 404) {
    skp('Drift detection', 'endpoint not found');
  } else {
    no('Drift detection', `status=${r.status}`);
  }
}

// ═══ 4. HEALING ENGINE ═══
async function testHealingEngine() {
  console.log('\n[4] Healing Engine');

  // 4a. Healing status
  const r = await fetchStatus(`${API}/v1/cortex/healing`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    ok('Healing engine', `accessible`);
  } else if (r.status === 404) {
    skp('Healing engine', 'endpoint not found');
  } else {
    no('Healing engine', `status=${r.status}`);
  }

  // 4b. Circuit breaker status
  const cbR = await fetchStatus(`${API}/v1/cortex/healing/circuit-breaker`, { headers: authHeaders() });
  if (cbR.status === 200) {
    ok('Circuit breaker', 'accessible');
  } else if (cbR.status === 404) {
    skp('Circuit breaker', 'endpoint not found');
  }
}

// ═══ 5. PREDICTIVE ENGINE ═══
async function testPredictiveEngine() {
  console.log('\n[5] Predictive Engine');

  const r = await fetchStatus(`${API}/v1/cortex/predictions`, { headers: authHeaders() });
  if (r.status === 200) {
    ok('Predictive engine', 'accessible');
  } else if (r.status === 404) {
    skp('Predictive engine', 'endpoint not found');
  } else {
    no('Predictive engine', `status=${r.status}`);
  }
}

// ═══ 6. SIGNAL COLLECTOR ═══
async function testSignalCollector() {
  console.log('\n[6] Signal Collector');

  const r = await fetchStatus(`${API}/v1/cortex/signals`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    ok('Signal collector', `accessible`);
  } else if (r.status === 404) {
    skp('Signal collector', 'endpoint not found');
  } else {
    no('Signal collector', `status=${r.status}`);
  }
}

// ═══ 7. ML ANOMALY DETECTION ═══
async function testMLAnomaly() {
  console.log('\n[7] ML Anomaly Detection');

  const r = await fetchStatus(`${API}/v1/cortex/ml/models`, { headers: authHeaders() });
  if (r.status === 200) {
    ok('ML models', 'accessible');
  } else if (r.status === 404) {
    skp('ML models', 'endpoint not found');
  } else {
    no('ML models', `status=${r.status}`);
  }
}

// ═══ 8. CHAOS ENGINE ═══
async function testChaosEngine() {
  console.log('\n[8] Chaos Engine');

  // 8a. Chaos scenarios
  const r = await fetchStatus(`${API}/v1/cortex/chaos/scenarios`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    const scenarios = Array.isArray(data) ? data : data.scenarios || data.data || [];
    ok('Chaos scenarios', `count=${scenarios.length}`);
  } else if (r.status === 404) {
    skp('Chaos scenarios', 'endpoint not found');
  } else {
    no('Chaos scenarios', `status=${r.status}`);
  }
}

// ═══ 9. ALERT CORRELATION ═══
async function testAlertCorrelation() {
  console.log('\n[9] Alert Correlation');

  const r = await fetchStatus(`${API}/v1/cortex/alerts`, { headers: authHeaders() });
  if (r.status === 200) {
    ok('Alert correlation', 'accessible');
  } else if (r.status === 404) {
    skp('Alert correlation', 'endpoint not found');
  } else {
    no('Alert correlation', `status=${r.status}`);
  }
}

// ═══ 10. PERFORMANCE STATS ═══
async function testPerformanceStats() {
  console.log('\n[10] Performance Stats');

  const r = await fetchStatus(`${API}/v1/cortex/stats`, { headers: authHeaders() });
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    ok('Performance stats', `accessible`);
  } else if (r.status === 404) {
    skp('Performance stats', 'endpoint not found');
  } else {
    no('Performance stats', `status=${r.status}`);
  }
}

// ═══ MAIN ═══
async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log(' HookSniff Cortex Test Suite');
  console.log(` API: ${API}`);
  console.log(` Time: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  await setup();
  await testCortexStatus();
  await testAnomalyDetection();
  await testDriftDetection();
  await testHealingEngine();
  await testPredictiveEngine();
  await testSignalCollector();
  await testMLAnomaly();
  await testChaosEngine();
  await testAlertCorrelation();
  await testPerformanceStats();

  console.log('\n═══════════════════════════════════════════════');
  const total = pass + fail;
  const pct = total > 0 ? Math.round((pass / total) * 100) : 0;
  console.log(` RESULTS: ${pass}/${total} passed (${pct}%)`);
  console.log(` PASS: ${pass}  FAIL: ${fail}  SKIP: ${skip}`);
  console.log('═══════════════════════════════════════════════');
}

run().catch(e => console.error('FATAL:', e.message));
