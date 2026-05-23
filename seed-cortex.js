const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log('=== CORTEX MANUAL AGGREGATION ===\n');

  // Step 1: Find all hours that have deliveries
  const hours = await pool.query(`
    SELECT DISTINCT date_trunc('hour', created_at) as hour_start
    FROM deliveries
    ORDER BY hour_start
  `);
  console.log(`Found ${hours.rows.length} hours with deliveries`);

  // Step 2: Aggregate each hour
  for (const row of hours.rows) {
    const hourStart = row.hour_start;
    const hourEnd = new Date(new Date(hourStart).getTime() + 3600000);
    
    const result = await pool.query(`
      INSERT INTO endpoint_hourly_stats (endpoint_id, hour_start, total_deliveries, successful, failed, avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown)
      WITH latest_attempts AS (
        SELECT DISTINCT ON (da.delivery_id)
          da.delivery_id, da.duration_ms, da.error_message, da.status_code
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.created_at >= $1 AND d.created_at < $2
        ORDER BY da.delivery_id, da.attempt_number DESC
      ),
      endpoint_stats AS (
        SELECT d.endpoint_id,
          COUNT(DISTINCT d.id) as total,
          COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'delivered') as ok,
          COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('failed', 'dead_letter')) as fail,
          COALESCE(AVG(la.duration_ms), 0)::INT as avg_lat,
          COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p50,
          COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p95,
          COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p99
        FROM deliveries d
        LEFT JOIN latest_attempts la ON la.delivery_id = d.id
        WHERE d.created_at >= $1 AND d.created_at < $2
        GROUP BY d.endpoint_id
      )
      SELECT es.endpoint_id, $1, es.total, es.ok, es.fail, es.avg_lat, es.p50, es.p95, es.p99, '{}'::jsonb
      FROM endpoint_stats es
      ON CONFLICT (endpoint_id, hour_start) DO UPDATE SET
        total_deliveries = EXCLUDED.total_deliveries,
        successful = EXCLUDED.successful,
        failed = EXCLUDED.failed,
        avg_latency_ms = EXCLUDED.avg_latency_ms
    `, [hourStart, hourEnd]);
    
    console.log(`  Hour ${hourStart}: ${result.rowCount} endpoints`);
  }

  // Step 3: Update profiles
  console.log('\n--- Updating Profiles ---');
  const endpoints = await pool.query("SELECT DISTINCT endpoint_id FROM endpoint_hourly_stats");
  for (const ep of endpoints.rows) {
    const eid = ep.endpoint_id;
    await pool.query(`
      INSERT INTO endpoint_profiles (endpoint_id, latency_p95, latency_p99, success_rate_1h, success_rate_24h, success_rate_7d, sample_size, confidence, updated_at)
      SELECT 
        $1,
        COALESCE(AVG(p95_latency_ms), 0)::INT,
        COALESCE(AVG(p99_latency_ms), 0)::INT,
        COALESCE(SUM(successful)::FLOAT / NULLIF(SUM(total_deliveries), 0) * 100, 100),
        COALESCE(SUM(successful)::FLOAT / NULLIF(SUM(total_deliveries), 0) * 100, 100),
        COALESCE(SUM(successful)::FLOAT / NULLIF(SUM(total_deliveries), 0) * 100, 100),
        COALESCE(SUM(total_deliveries), 0)::INT,
        LEAST(COALESCE(SUM(total_deliveries), 0)::FLOAT / 100.0, 1.0),
        NOW()
      FROM endpoint_hourly_stats WHERE endpoint_id = $1
      ON CONFLICT (endpoint_id) DO UPDATE SET
        latency_p95 = EXCLUDED.latency_p95,
        latency_p99 = EXCLUDED.latency_p99,
        success_rate_1h = EXCLUDED.success_rate_1h,
        success_rate_24h = EXCLUDED.success_rate_24h,
        success_rate_7d = EXCLUDED.success_rate_7d,
        sample_size = EXCLUDED.sample_size,
        confidence = EXCLUDED.confidence,
        updated_at = NOW()
    `, [eid]);
    console.log(`  Profile updated: ${eid}`);
  }

  // Step 4: Score anomalies
  console.log('\n--- Scoring Anomalies ---');
  for (const ep of endpoints.rows) {
    const eid = ep.endpoint_id;
    const stats = await pool.query(`
      SELECT total_deliveries, successful, failed, p95_latency_ms
      FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start DESC LIMIT 1
    `, [eid]);
    if (stats.rows.length === 0) continue;
    const s = stats.rows[0];
    const sr = s.total_deliveries > 0 ? (s.successful / s.total_deliveries) * 100 : 100;
    const failRate = s.total_deliveries > 0 ? (s.failed / s.total_deliveries) * 100 : 0;
    
    let score = 0;
    if (sr < 90) score += 30;
    if (sr < 70) score += 30;
    if (failRate > 10) score += 20;
    if (s.p95_latency_ms > 5000) score += 20;
    
    const category = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
    
    // Get customer_id
    const epInfo = await pool.query("SELECT customer_id FROM endpoints WHERE id = $1", [eid]);
    const cid = epInfo.rows[0]?.customer_id;
    
    if (score > 0 && cid) {
      await pool.query(
        "INSERT INTO anomaly_scores (endpoint_id, customer_id, score, factors, category) VALUES ($1, $2, $3, $4, $5)",
        [eid, cid, score, JSON.stringify({ success_rate: sr, fail_rate: failRate, p95: s.p95_latency_ms }), category]
      );
      console.log(`  Anomaly: ${eid} score=${score} [${category}]`);
    }
  }

  // Step 5: Generate insights
  console.log('\n--- Generating Insights ---');
  const profiles = await pool.query("SELECT ep.endpoint_id, ep.success_rate_7d, ep.latency_p95, e.customer_id FROM endpoint_profiles ep JOIN endpoints e ON e.id = ep.endpoint_id");
  for (const p of profiles.rows) {
    if (p.latency_p95 > 5000) {
      await pool.query(
        "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'high_latency', $2, $3, 'info', $4)",
        [p.customer_id, `Endpoint p95 latency is ${p.latency_p95}ms`, 'Consider optimizing your endpoint.', JSON.stringify({ endpoint_id: p.endpoint_id, p95: p.latency_p95 })]
      );
      console.log(`  Insight: ${p.endpoint_id} high latency ${p.latency_p95}ms`);
    }
  }

  // Step 6: Update cortex_config
  await pool.query(`
    INSERT INTO platform_settings (key, value)
    SELECT 'main', '{"cortex_config":{}}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE key = 'main')
  `);

  // Final counts
  console.log('\n=== FINAL COUNTS ===');
  for (const t of ['endpoint_hourly_stats','endpoint_profiles','anomaly_scores','cortex_insights','healing_actions','cortex_action_history','predictions']) {
    const r = await pool.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`  ${t}: ${r.rows[0].cnt}`);
  }

  await pool.end();
  console.log('\n✅ Done!');
}

run().catch(e => { console.error(e); process.exit(1); });
