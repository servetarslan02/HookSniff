const https = require('https');

const API_BASE = 'hooksniff-api-e6ztf3x2ma-ew.a.run.app';
const API_KEY = 'hr_live_c7ef28c9d6083d0012a12d82c0a1c3dc6d4eec8c3ca666b442e7fb04c469ff58';

function postWebhook(endpointId, event, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ endpoint_id: endpointId, event, data });
    const start = Date.now();
    
    const req = https.request({
      hostname: API_BASE,
      path: '/v1/webhooks',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Idempotency-Key': `bench-${Date.now()}-${Math.random().toString(36).slice(2)}`
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        resolve({ status: res.statusCode, latency, body: data });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

async function runBenchmark() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  HookSniff — Gerçek Webhook Latency Testi               ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  API: hooksniff-api-e6ztf3x2ma-ew.a.run.app             ║');
  console.log('║  Endpoint: httpbin.org/post                              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // First: get list of endpoints
  console.log('📋 Step 1: Endpoint\'leri al...');
  const endpoints = await new Promise((resolve, reject) => {
    https.get({
      hostname: API_BASE,
      path: '/v1/endpoints',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    }).on('error', reject);
  });

  let endpointId;
  if (Array.isArray(endpoints) && endpoints.length > 0) {
    endpointId = endpoints[0].id;
    console.log(`  ✅ Endpoint bulundu: ${endpointId}`);
    console.log(`  URL: ${endpoints[0].url}\n`);
  } else if (endpoints && endpoints.endpoints && endpoints.endpoints.length > 0) {
    endpointId = endpoints.endpoints[0].id;
    console.log(`  ✅ Endpoint bulundu: ${endpointId}`);
    console.log(`  URL: ${endpoints.endpoints[0].url}\n`);
  } else {
    console.log('  ⚠️ Endpoint bulunamadı, veritabanından alınan ID kullanılacak');
    console.log('  Response:', JSON.stringify(endpoints).substring(0, 200));
    endpointId = '34e4c1bf-ef88-4d54-aacc-608ee0482744'; // httpbin.org/post from DB
  }

  // Step 2: Send 5 webhooks and measure latency
  console.log('📊 Step 2: Webhook gönderimi (5 adet)...\n');
  const results = [];
  
  for (let i = 1; i <= 5; i++) {
    try {
      const result = await postWebhook(endpointId, `benchmark.test.${i}`, {
        index: i,
        timestamp: new Date().toISOString(),
        message: `Benchmark test #${i}`
      });
      
      const icon = result.status >= 200 && result.status < 300 ? '✅' : '❌';
      console.log(`  ${icon} Webhook #${i}: ${result.latency}ms (HTTP ${result.status})`);
      
      let responseBody;
      try { responseBody = JSON.parse(result.body); } catch { responseBody = result.body; }
      if (responseBody && responseBody.id) {
        console.log(`     Delivery ID: ${responseBody.id} | Status: ${responseBody.status}`);
      }
      
      results.push({ index: i, ...result, success: result.status >= 200 && result.status < 300 });
    } catch (e) {
      console.log(`  ❌ Webhook #${i}: ERROR - ${e.message}`);
      results.push({ index: i, error: e.message, success: false });
    }
    
    // Small delay between requests
    if (i < 5) await new Promise(r => setTimeout(r, 500));
  }

  // Step 3: Summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Sonuçlar                                                ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  
  const successful = results.filter(r => r.success);
  const latencies = successful.map(r => r.latency);
  
  if (latencies.length > 0) {
    const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const p50 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.5)];
    
    console.log(`║  Başarılı:    ${successful.length}/${results.length}                               ║`);
    console.log(`║  Avg Latency: ${avg}ms${' '.repeat(42 - avg.toString().length)}║`);
    console.log(`║  Min Latency: ${min}ms${' '.repeat(42 - min.toString().length)}║`);
    console.log(`║  Max Latency: ${max}ms${' '.repeat(42 - max.toString().length)}║`);
    console.log(`║  P50 Latency: ${p50}ms${' '.repeat(42 - p50.toString().length)}║`);
  } else {
    console.log('║  ❌ Hiçbir webhook başarılı olmadı!                      ║');
  }
  
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Eski Sistem (PG Queue)    │ Yeni Sistem (Redis)         ║');
  console.log('║  0-1000ms tetikleme         │ < 10ms tetikleme            ║');
  console.log('║  1s poll interval           │ anında (blocking read)      ║');
  console.log('║  30s ilk retry              │ 100ms ilk retry             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  // Step 4: Check delivery status
  console.log('\n📊 Step 3: Delivery durumunu kontrol et...');
  await new Promise(r => setTimeout(r, 3000)); // Wait 3s for delivery
  
  try {
    const healthRes = await new Promise((resolve, reject) => {
      https.get({
        hostname: API_BASE,
        path: '/v1/health',
        timeout: 15000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
    
    console.log(`  Queue Pending:    ${healthRes.queue.pending}`);
    console.log(`  Queue Processing: ${healthRes.queue.processing}`);
    console.log(`  Redis Status:     ${healthRes.redis.note} (${healthRes.redis.latency_ms}ms)`);
    console.log(`  Last Delivery:    ${healthRes.checks.last_delivery.last_delivered_at}`);
  } catch (e) {
    console.log(`  Health check error: ${e.message}`);
  }
}

runBenchmark().catch(e => console.error('FATAL:', e.message));
