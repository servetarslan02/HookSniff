import type { NextApiRequest, NextApiResponse } from 'next';

// Load Test Script — HookSniff API Performance Test
// Usage: node scripts/load-test.js [concurrent] [duration_sec]

const API_BASE = process.env.API_URL || 'https://hooksniff-api-499907444852.europe-west1.run.app';
const EMAIL = 'servetarslan02@gmail.com';
const PASSWORD = 'Alayci_165';

interface TestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  requestsPerSecond: number;
  errors: string[];
}

async function getAuthToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.token;
}

async function makeRequest(
  endpoint: string,
  token: string,
  method: string = 'GET',
  body?: object
): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const latencyMs = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, latencyMs, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    return { success: true, latencyMs };
  } catch (error) {
    return { success: false, latencyMs: Date.now() - start, error: String(error) };
  }
}

async function runLoadTest(
  concurrent: number = 10,
  durationSec: number = 30
): Promise<TestResult> {
  console.log(`\n🚀 HookSniff Load Test`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Concurrent: ${concurrent}`);
  console.log(`Duration: ${durationSec}s`);
  console.log(`Target: ${API_BASE}\n`);

  // Get auth token
  const token = await getAuthToken();
  console.log('✅ Authenticated\n');

  const results: { success: boolean; latencyMs: number; error?: string }[] = [];
  const errors: string[] = [];
  const startTime = Date.now();
  const endTime = startTime + (durationSec * 1000);

  // Test endpoints
  const endpoints = [
    { path: '/v1/health', method: 'GET' },
    { path: '/v1/applications', method: 'GET' },
    { path: '/v1/endpoints', method: 'GET' },
    { path: '/v1/deliveries?per_page=10', method: 'GET' },
    { path: '/v1/cortex/health', method: 'GET' },
    { path: '/v1/admin/security/stats', method: 'GET' },
  ];

  let requestCount = 0;

  // Run requests in waves
  while (Date.now() < endTime) {
    const promises = Array.from({ length: concurrent }, async () => {
      const endpoint = endpoints[requestCount % endpoints.length];
      requestCount++;
      return makeRequest(endpoint.path, token, endpoint.method);
    });

    const waveResults = await Promise.all(promises);
    results.push(...waveResults);

    // Collect errors
    for (const result of waveResults) {
      if (!result.success && result.error) {
        errors.push(result.error);
      }
    }

    // Progress update every 100 requests
    if (results.length % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rps = (results.length / (Date.now() - startTime) * 1000).toFixed(1);
      process.stdout.write(`\r📊 ${results.length} requests | ${elapsed}s | ${rps} req/s`);
    }

    // Small delay to prevent overwhelming
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.log('\n');

  // Calculate statistics
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = (Date.now() - startTime) / 1000;

  const result: TestResult = {
    totalRequests: results.length,
    successfulRequests: successful,
    failedRequests: failed,
    avgLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)],
    p99LatencyMs: latencies[Math.floor(latencies.length * 0.99)],
    requestsPerSecond: Math.round(results.length / totalDuration),
    errors: [...new Set(errors)].slice(0, 10),
  };

  // Print results
  console.log('📊 Load Test Results');
  console.log('━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Requests:     ${result.totalRequests}`);
  console.log(`Successful:         ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Failed:             ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`\nLatency:`);
  console.log(`  Average:          ${result.avgLatencyMs}ms`);
  console.log(`  P95:              ${result.p95LatencyMs}ms`);
  console.log(`  P99:              ${result.p99LatencyMs}ms`);
  console.log(`\nThroughput:`);
  console.log(`  Requests/sec:     ${result.requestsPerSecond}`);
  console.log(`  Duration:         ${totalDuration.toFixed(1)}s`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length} unique):`);
    for (const error of result.errors.slice(0, 5)) {
      console.log(`  - ${error.substring(0, 100)}`);
    }
  }

  // Performance assessment
  console.log('\n📋 Assessment:');
  if (result.avgLatencyMs < 200) {
    console.log('  ✅ Average latency: Excellent (< 200ms)');
  } else if (result.avgLatencyMs < 500) {
    console.log('  ⚠️  Average latency: Good (< 500ms)');
  } else {
    console.log('  ❌ Average latency: Needs optimization (> 500ms)');
  }

  if (result.p95LatencyMs < 500) {
    console.log('  ✅ P95 latency: Excellent (< 500ms)');
  } else if (result.p95LatencyMs < 1000) {
    console.log('  ⚠️  P95 latency: Acceptable (< 1s)');
  } else {
    console.log('  ❌ P95 latency: Too slow (> 1s)');
  }

  if (result.failedRequests / result.totalRequests < 0.01) {
    console.log('  ✅ Error rate: Excellent (< 1%)');
  } else if (result.failedRequests / result.totalRequests < 0.05) {
    console.log('  ⚠️  Error rate: Acceptable (< 5%)');
  } else {
    console.log('  ❌ Error rate: Too high (> 5%)');
  }

  return result;
}

// Run if called directly
const args = process.argv.slice(2);
const concurrent = parseInt(args[0]) || 10;
const duration = parseInt(args[1]) || 30;

runLoadTest(concurrent, duration)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
  });
