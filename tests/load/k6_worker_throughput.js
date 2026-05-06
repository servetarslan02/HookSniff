import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate, Counter, Gauge } from "k6/metrics";

// ─── Config ───────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const API_KEY = __ENV.API_KEY || "";
const RECEIVER_URL = __ENV.RECEIVER_URL || "http://localhost:8090";
const TOTAL_WEBHOOKS = parseInt(__ENV.TOTAL_WEBHOOKS || "10000");
const BATCH_SIZE = 100; // Max allowed by API
const POLL_INTERVAL_SEC = parseInt(__ENV.POLL_INTERVAL || "5");
const MAX_WAIT_SEC = parseInt(__ENV.MAX_WAIT || "300");

// ─── Custom Metrics ───────────────────────────────────────────────
const queueDepth = new Gauge("queue_depth");
const deliveryLatency = new Trend("delivery_latency_ms", true);
const workerThroughput = new Trend("worker_items_per_sec", true);
const failureRate = new Rate("worker_failure_rate");
const pollLatency = new Trend("poll_latency_ms", true);

// ─── Options ──────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Single VU — we're measuring worker throughput, not API load
    monitor: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      maxDuration: `${MAX_WAIT_SEC + 60}s`,
    },
  },
  thresholds: {
    worker_failure_rate: ["rate<0.05"],    // <5% failures acceptable
  },
};

// ─── Setup: Create endpoint + pre-populate queue ──────────────────
export function setup() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  console.log(`=== Worker Throughput Test ===`);
  console.log(`Target: ${TOTAL_WEBHOOKS} webhooks`);

  // 1. Create endpoint on test receiver
  const epRes = http.post(
    `${BASE_URL}/v1/endpoints`,
    JSON.stringify({
      url: `${RECEIVER_URL}/webhook`,
      description: "Worker throughput test",
      retry_policy: {
        max_attempts: 1,
        backoff: "exponential",
        initial_delay_secs: 10,
        max_delay_secs: 60,
      },
    }),
    { headers }
  );

  check(epRes, { "endpoint created": (r) => r.status === 200 });

  if (epRes.status !== 200) {
    console.error(`Failed to create endpoint: ${epRes.status}`);
    throw new Error("Cannot create endpoint");
  }

  const endpointId = epRes.json("id");
  console.log(`Endpoint: ${endpointId}`);

  // 2. Pre-populate queue via batch API
  const startTime = Date.now();
  let created = 0;

  for (let batch = 0; batch < Math.ceil(TOTAL_WEBHOOKS / BATCH_SIZE); batch++) {
    const remaining = TOTAL_WEBHOOKS - created;
    const thisBatch = Math.min(BATCH_SIZE, remaining);

    const webhooks = [];
    for (let i = 0; i < thisBatch; i++) {
      webhooks.push({
        endpoint_id: endpointId,
        event: "throughput.test",
        data: {
          batch: batch,
          seq: i,
          created_at: new Date().toISOString(),
        },
      });
    }

    const batchRes = http.post(
      `${BASE_URL}/v1/webhooks/batch`,
      JSON.stringify({ webhooks }),
      { headers }
    );

    if (batchRes.status === 200) {
      const result = batchRes.json();
      created += (result.deliveries || []).length;
    } else {
      console.warn(`Batch ${batch} failed: ${batchRes.status} ${batchRes.body}`);
      // Rate limited — back off
      if (batchRes.status === 429) {
        sleep(2);
      }
    }

    // Progress logging every 20%
    if ((batch + 1) % Math.ceil(Math.ceil(TOTAL_WEBHOOKS / BATCH_SIZE) / 5) === 0) {
      console.log(`Pre-populated: ${created}/${TOTAL_WEBHOOKS}`);
    }
  }

  const populateTime = (Date.now() - startTime) / 1000;
  console.log(`Queue populated: ${created} items in ${populateTime.toFixed(1)}s`);

  return {
    endpointId,
    headers,
    totalCount: created,
    populateTime,
    startMonitorTime: Date.now(),
  };
}

// ─── Main: Monitor worker processing ──────────────────────────────
export default function (data) {
  const { endpointId, headers, totalCount, startMonitorTime } = data;
  const startDate = new Date(startMonitorTime).toISOString();

  let lastDelivered = 0;
  let lastFailed = 0;
  let lastPending = totalCount;
  let monitorStart = Date.now();
  let allDone = false;

  console.log(`Monitoring worker processing (polling every ${POLL_INTERVAL_SEC}s)...`);

  while (!allDone) {
    const elapsed = (Date.now() - monitorStart) / 1000;

    if (elapsed > MAX_WAIT_SEC) {
      console.warn(`Timeout after ${MAX_WAIT_SEC}s — worker may be slow`);
      break;
    }

    // Poll delivery status
    const pollStart = Date.now();
    const statsRes = http.get(`${BASE_URL}/v1/stats`, { headers });
    pollLatency.add(Date.now() - pollStart);

    if (statsRes.status !== 200) {
      console.warn(`Stats poll failed: ${statsRes.status}`);
      sleep(POLL_INTERVAL_SEC);
      continue;
    }

    const stats = statsRes.json();

    // Get webhooks created during this test to count precisely
    const listRes = http.get(
      `${BASE_URL}/v1/webhooks?per_page=1&status=delivered`,
      { headers }
    );

    let delivered = 0;
    let failed = 0;
    let pending = totalCount;

    if (statsRes.status === 200) {
      delivered = stats.delivered || 0;
      failed = stats.failed || 0;
      pending = stats.pending || 0;
    }

    queueDepth.set(pending);

    // Calculate throughput since last poll
    const newDelivered = delivered - lastDelivered;
    const newFailed = failed - lastFailed;
    const processed = newDelivered + newFailed;

    if (processed > 0) {
      const itemsPerSec = processed / POLL_INTERVAL_SEC;
      workerThroughput.add(itemsPerSec);
    }

    // Log progress
    const totalProcessed = delivered + failed;
    const progress = ((totalProcessed / totalCount) * 100).toFixed(1);
    const throughput = elapsed > 0 ? (totalProcessed / elapsed).toFixed(1) : 0;

    console.log(
      `[${elapsed.toFixed(0)}s] ` +
      `Progress: ${progress}% (${totalProcessed}/${totalCount}) | ` +
      `Delivered: ${delivered} | Failed: ${failed} | ` +
      `Pending: ${pending} | ` +
      `Throughput: ${throughput}/s`
    );

    // Check if done
    if (pending === 0 || totalProcessed >= totalCount * 0.99) {
      allDone = true;

      const totalTime = (Date.now() - monitorStart) / 1000;
      const finalThroughput = totalProcessed / totalTime;
      const failRate = failed / Math.max(totalProcessed, 1);

      console.log(`\n=== RESULTS ===`);
      console.log(`Total webhooks:  ${totalCount}`);
      console.log(`Delivered:       ${delivered}`);
      console.log(`Failed:          ${failed}`);
      console.log(`Total time:      ${totalTime.toFixed(1)}s`);
      console.log(`Throughput:      ${finalThroughput.toFixed(1)} items/s`);
      console.log(`Failure rate:    ${(failRate * 100).toFixed(2)}%`);

      failureRate.add(failRate > 0.05);
      workerThroughput.add(finalThroughput);
    }

    lastDelivered = delivered;
    lastFailed = failed;
    lastPending = pending;

    sleep(POLL_INTERVAL_SEC);
  }
}

// ─── Teardown ─────────────────────────────────────────────────────
export function teardown(data) {
  if (!data.endpointId) return;

  http.del(`${BASE_URL}/v1/endpoints/${data.endpointId}`, null, {
    headers: data.headers,
  });
  console.log(`Cleaned up throughput test endpoint: ${data.endpointId}`);
}
