const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tables = [
  'endpoint_hourly_stats',
  'endpoint_profiles', 
  'anomaly_scores',
  'alert_correlations',
  'healing_actions',
  'cortex_action_history',
  'endpoint_strategy_weights',
  'recovery_surges',
  'predictions',
  'cortex_insights',
  'weekly_reports',
  'routing_decisions'
];

async function check() {
  console.log('=== CORTEX DATA CHECK ===\n');
  for (const t of tables) {
    try {
      const r = await pool.query(`SELECT COUNT(*) as cnt FROM ${t}`);
      const cnt = r.rows[0].cnt;
      const status = cnt > 0 ? '✅' : '⬜';
      console.log(`${status} ${t}: ${cnt} rows`);
    } catch (e) {
      console.log(`❌ ${t}: ${e.message}`);
    }
  }

  // Check latest hourly stats
  console.log('\n--- Latest Hourly Stats ---');
  const hs = await pool.query("SELECT endpoint_id, hour_start, total_deliveries, successful, failed, avg_latency_ms FROM endpoint_hourly_stats ORDER BY hour_start DESC LIMIT 5");
  if (hs.rows.length === 0) console.log('  (no data yet)');
  else hs.rows.forEach(r => console.log(`  ${r.endpoint_id} @ ${r.hour_start} | total=${r.total_deliveries} ok=${r.successful} fail=${r.failed} lat=${r.avg_latency_ms}ms`));

  // Check latest anomalies
  console.log('\n--- Latest Anomalies ---');
  const an = await pool.query("SELECT endpoint_id, score, category, created_at FROM anomaly_scores ORDER BY created_at DESC LIMIT 5");
  if (an.rows.length === 0) console.log('  (no data yet)');
  else an.rows.forEach(r => console.log(`  ${r.endpoint_id} score=${r.score} [${r.category}] @ ${r.created_at}`));

  // Check healing actions
  console.log('\n--- Latest Healing Actions ---');
  const ha = await pool.query("SELECT endpoint_id, action_type, outcome, created_at FROM healing_actions ORDER BY created_at DESC LIMIT 5");
  if (ha.rows.length === 0) console.log('  (no data yet)');
  else ha.rows.forEach(r => console.log(`  ${r.endpoint_id} ${r.action_type} -> ${r.outcome} @ ${r.created_at}`));

  // Check action memory
  console.log('\n--- Action Memory ---');
  const am = await pool.query("SELECT endpoint_id, action_type, outcome, success_score, created_at FROM cortex_action_history ORDER BY created_at DESC LIMIT 5");
  if (am.rows.length === 0) console.log('  (no data yet)');
  else am.rows.forEach(r => console.log(`  ${r.endpoint_id} ${r.action_type} -> ${r.outcome} score=${r.success_score} @ ${r.created_at}`));

  // Check profiles
  console.log('\n--- Endpoint Profiles ---');
  const pr = await pool.query("SELECT endpoint_id, success_rate_1h, success_rate_24h, success_rate_7d, confidence, sample_size FROM endpoint_profiles ORDER BY updated_at DESC LIMIT 5");
  if (pr.rows.length === 0) console.log('  (no data yet)');
  else pr.rows.forEach(r => console.log(`  ${r.endpoint_id} sr1h=${r.success_rate_1h} sr24h=${r.success_rate_24h} sr7d=${r.success_rate_7d} conf=${r.confidence} n=${r.sample_size}`));

  // Check platform_settings for cortex config
  console.log('\n--- Cortex Config ---');
  const cfg = await pool.query("SELECT value->'cortex_config' as cfg FROM platform_settings WHERE key = 'main'");
  if (cfg.rows.length === 0 || !cfg.rows[0].cfg) console.log('  (no cortex config in platform_settings)');
  else console.log('  ✅ cortex_config exists in platform_settings');

  // Check if deliveries exist (source data)
  console.log('\n--- Source Data ---');
  const del = await pool.query("SELECT COUNT(*) as cnt FROM deliveries");
  console.log(`  deliveries: ${del.rows[0].cnt}`);
  const ep = await pool.query("SELECT COUNT(*) as cnt FROM endpoints WHERE is_active = true");
  console.log(`  active endpoints: ${ep.rows[0].cnt}`);
  const da = await pool.query("SELECT COUNT(*) as cnt FROM delivery_attempts");
  console.log(`  delivery_attempts: ${da.rows[0].cnt}`);

  await pool.end();
}

check().catch(e => { console.error(e); process.exit(1); });
