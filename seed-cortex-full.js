const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

const ADMIN_ID = '03006b76-7c42-48e2-b379-29be0b11e283';

(async () => {
  await c.connect();
  console.log('🧠 Cortex Senaryo Üretici\n');

  // Get current endpoints
  const eps = await c.query('SELECT id, url, customer_id FROM endpoints WHERE customer_id = $1', [ADMIN_ID]);
  console.log('Mevcut endpoint sayısı:', eps.rows.length);
  
  if (eps.rows.length === 0) {
    console.log('❌ Endpoint yok! Önce seed script çalıştırın.');
    await c.end();
    return;
  }

  const endpointIds = eps.rows.map(e => e.id);
  const now = new Date();

  // ═══════════════════════════════════════════════
  // 1. ENDPOINT HOURLY STATS (Son 7 gün, saatlik)
  // ═══════════════════════════════════════════════
  console.log('📊 1. Endpoint Hourly Stats oluşturuluyor...');
  let statsCount = 0;
  for (const epId of endpointIds) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const ts = new Date(now);
        ts.setDate(ts.getDate() - day);
        ts.setHours(hour, 0, 0, 0);
        
        // Simulate realistic patterns: high traffic during business hours
        const isBusinessHour = hour >= 8 && hour <= 18;
        const baseDeliveries = isBusinessHour ? 50 : 10;
        const deliveries = baseDeliveries + Math.floor(Math.random() * 30);
        const successRate = 0.92 + Math.random() * 0.07; // 92-99%
        const successful = Math.floor(deliveries * successRate);
        const failed = deliveries - successful;
        const avgLatency = 80 + Math.floor(Math.random() * 200);
        const p95Latency = avgLatency * (1.5 + Math.random());
        
        try {
          await c.query(`
            INSERT INTO endpoint_hourly_stats 
            (customer_id, endpoint_id, hour, total_deliveries, successful, failed, avg_latency_ms, p95_latency_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [ADMIN_ID, epId, ts, deliveries, successful, failed, avgLatency, Math.floor(p95Latency)]);
          statsCount++;
        } catch (e) { /* skip duplicates */ }
      }
    }
  }
  console.log(`  ✅ ${statsCount} saatlik istatistik eklendi`);

  // ═══════════════════════════════════════════════
  // 2. ANOMALY SCORES (Son 3 gün)
  // ═══════════════════════════════════════════════
  console.log('🚨 2. Anomaly Scores oluşturuluyor...');
  const anomalyTypes = [
    { type: 'latency_spike', severity: 'high', description: 'P95 latency spiked to 2.3s (normal: 150ms)' },
    { type: 'failure_rate', severity: 'critical', description: 'Failure rate reached 45% on endpoint' },
    { type: 'volume_drop', severity: 'medium', description: 'Delivery volume dropped 80% in last hour' },
    { type: 'timeout_cluster', severity: 'high', description: 'Multiple timeouts detected in succession' },
    { type: 'error_pattern', severity: 'low', description: 'New error pattern detected: 503 Service Unavailable' },
    { type: 'latency_drift', severity: 'medium', description: 'Gradual latency increase over 6 hours' },
    { type: 'payload_size', severity: 'low', description: 'Unusually large payloads detected' },
  ];
  
  let anomalyCount = 0;
  for (let day = 0; day < 3; day++) {
    for (const anomaly of anomalyTypes) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      const epId = endpointIds[Math.floor(Math.random() * endpointIds.length)];
      const score = anomaly.severity === 'critical' ? 0.95 : anomaly.severity === 'high' ? 0.8 : anomaly.severity === 'medium' ? 0.6 : 0.4;
      
      try {
        await c.query(`
          INSERT INTO anomaly_scores 
          (customer_id, endpoint_id, anomaly_type, score, severity, description, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [ADMIN_ID, epId, anomaly.type, score, anomaly.severity, anomaly.description, ts]);
        anomalyCount++;
      } catch (e) { /* skip */ }
    }
  }
  console.log(`  ✅ ${anomalyCount} anomali skoru eklendi`);

  // ═══════════════════════════════════════════════
  // 3. ML MODELS (Her endpoint için)
  // ═══════════════════════════════════════════════
  console.log('🤖 3. ML Models oluşturuluyor...');
  const modelTypes = ['latency_predictor', 'failure_predictor', 'volume_forecaster', 'anomaly_detector'];
  let modelCount = 0;
  
  for (const epId of endpointIds) {
    for (const modelType of modelTypes) {
      const accuracy = 0.75 + Math.random() * 0.2; // 75-95%
      const trainedAt = new Date(now);
      trainedAt.setHours(trainedAt.getHours() - Math.floor(Math.random() * 48));
      
      try {
        await c.query(`
          INSERT INTO ml_models 
          (customer_id, endpoint_id, model_type, accuracy, trained_at, version, is_active)
          VALUES ($1, $2, $3, $4, $5, 1, true)
          ON CONFLICT DO NOTHING
        `, [ADMIN_ID, epId, modelType, accuracy, trainedAt]);
        modelCount++;
      } catch (e) { /* skip */ }
    }
  }
  console.log(`  ✅ ${modelCount} ML modeli eklendi`);

  // ═══════════════════════════════════════════════
  // 4. HEALING ACTIONS (Son 5 gün)
  // ═══════════════════════════════════════════════
  console.log('🔧 4. Healing Actions oluşturuluyor...');
  const healingActions = [
    { action: 'retry_slowdown', detail: 'Increased retry delay from 1s to 4s due to repeated failures', status: 'success' },
    { action: 'circuit_break', detail: 'Circuit breaker activated after 10 consecutive failures', status: 'success' },
    { action: 'fallback_url', detail: 'Switched to fallback URL after primary endpoint timeout', status: 'success' },
    { action: 'rate_limit_reduce', detail: 'Reduced rate limit from 100/min to 50/min due to overload', status: 'applied' },
    { action: 'auto_disable', detail: 'Endpoint auto-disabled after 50% failure rate for 30 minutes', status: 'success' },
    { action: 'timeout_adjust', detail: 'Increased timeout from 5s to 15s for slow endpoint', status: 'applied' },
  ];
  
  let healingCount = 0;
  for (let day = 0; day < 5; day++) {
    for (const ha of healingActions) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(Math.floor(Math.random() * 24));
      const epId = endpointIds[Math.floor(Math.random() * endpointIds.length)];
      
      try {
        await c.query(`
          INSERT INTO healing_actions 
          (customer_id, endpoint_id, action_type, details, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [ADMIN_ID, epId, ha.action, ha.detail, ha.status, ts]);
        healingCount++;
      } catch (e) { /* skip */ }
    }
  }
  console.log(`  ✅ ${healingCount} healing action eklendi`);

  // ═══════════════════════════════════════════════
  // 5. ML DECISIONS (Son 3 gün)
  // ═══════════════════════════════════════════════
  console.log('🎯 5. ML Decisions oluşturuluyor...');
  const decisions = [
    { decision: 'increase_retries', reason: 'High success rate on retry suggests transient failures', confidence: 0.87 },
    { decision: 'switch_to_fallback', reason: 'Primary endpoint consistently slower than fallback', confidence: 0.92 },
    { decision: 'reduce_timeout', reason: 'Most requests complete within 200ms, timeout can be reduced', confidence: 0.78 },
    { decision: 'enable_circuit_breaker', reason: 'Failure pattern suggests need for circuit breaking', confidence: 0.95 },
  ];
  
  let decisionCount = 0;
  for (const d of decisions) {
    const ts = new Date(now);
    ts.setDate(ts.getDate() - Math.floor(Math.random() * 3));
    const epId = endpointIds[Math.floor(Math.random() * endpointIds.length)];
    
    try {
      await c.query(`
        INSERT INTO ml_decisions 
        (customer_id, endpoint_id, decision_type, reason, confidence, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [ADMIN_ID, epId, d.decision, d.reason, d.confidence, ts]);
      decisionCount++;
    } catch (e) { /* skip */ }
  }
  console.log(`  ✅ ${decisionCount} ML decision eklendi`);

  // ═══════════════════════════════════════════════
  // 6. ML FEATURES (Son 7 gün, her endpoint için)
  // ═══════════════════════════════════════════════
  console.log('📐 6. ML Features oluşturuluyor...');
  let featureCount = 0;
  for (const epId of endpointIds) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour += 4) { // Every 4 hours
        const ts = new Date(now);
        ts.setDate(ts.getDate() - day);
        ts.setHours(hour);
        
        const features = {
          avg_latency: 80 + Math.random() * 300,
          p95_latency: 150 + Math.random() * 500,
          success_rate: 0.85 + Math.random() * 0.14,
          volume: 10 + Math.floor(Math.random() * 100),
          error_rate: Math.random() * 0.15,
          retry_rate: Math.random() * 0.1,
          timeout_rate: Math.random() * 0.05,
          payload_size_avg: 1024 + Math.floor(Math.random() * 5000),
        };
        
        try {
          await c.query(`
            INSERT INTO ml_features 
            (customer_id, endpoint_id, features, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
          `, [ADMIN_ID, epId, JSON.stringify(features), ts]);
          featureCount++;
        } catch (e) { /* skip */ }
      }
    }
  }
  console.log(`  ✅ ${featureCount} ML feature vektörü eklendi`);

  // ═══════════════════════════════════════════════
  // 7. CORTEX TRACES (Son 3 gün)
  // ═══════════════════════════════════════════════
  console.log('🔍 7. Cortex Traces oluşturuluyor...');
  const stages = ['signal_collect', 'anomaly_detect', 'healing_eval', 'ml_predict', 'proactive_scan', 'drift_check'];
  let traceCount = 0;
  
  for (let day = 0; day < 3; day++) {
    for (const stage of stages) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(Math.floor(Math.random() * 24));
      const duration = 50 + Math.floor(Math.random() * 500);
      const status = Math.random() > 0.05 ? 'success' : 'timeout';
      
      try {
        await c.query(`
          INSERT INTO cortex_traces 
          (customer_id, stage_name, duration_ms, status, completed_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [ADMIN_ID, stage, duration, status, ts]);
        traceCount++;
      } catch (e) { /* skip */ }
    }
  }
  console.log(`  ✅ ${traceCount} trace eklendi`);

  // ═══════════════════════════════════════════════
  // 8. AB TESTS
  // ═══════════════════════════════════════════════
  console.log('🧪 8. AB Tests oluşturuluyor...');
  try {
    await c.query(`
      INSERT INTO ab_tests (customer_id, name, description, status, variant_a, variant_b, started_at, created_at)
      VALUES 
        ($1, 'Retry Strategy A vs B', 'Comparing exponential vs linear backoff', 'running', 
         '{"strategy": "exponential", "base_delay": 1000, "max_delay": 30000}',
         '{"strategy": "linear", "base_delay": 2000, "max_delay": 20000}',
         NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
        ($1, 'Timeout Optimization', 'Testing 5s vs 10s timeout', 'completed',
         '{"timeout_ms": 5000}',
         '{"timeout_ms": 10000}',
         NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
      ON CONFLICT DO NOTHING
    `, [ADMIN_ID]);
    console.log('  ✅ 2 AB test eklendi');
  } catch (e) {
    console.log('  ⚠️ AB tests:', e.message.substring(0, 60));
  }

  // ═══════════════════════════════════════════════
  // 9. ML DRIFT EVENTS
  // ═══════════════════════════════════════════════
  console.log('📈 9. ML Drift Events oluşturuluyor...');
  const driftEvents = [
    { type: 'feature_drift', severity: 'medium', detail: 'avg_latency distribution shifted significantly' },
    { type: 'concept_drift', severity: 'high', detail: 'Failure rate pattern changed after deployment' },
    { type: 'data_drift', severity: 'low', detail: 'Payload size distribution changed' },
  ];
  
  let driftCount = 0;
  for (const de of driftEvents) {
    const ts = new Date(now);
    ts.setDate(ts.getDate() - Math.floor(Math.random() * 5));
    const epId = endpointIds[Math.floor(Math.random() * endpointIds.length)];
    
    try {
      await c.query(`
        INSERT INTO ml_drift_events 
        (customer_id, endpoint_id, drift_type, severity, details, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [ADMIN_ID, epId, de.type, de.severity, de.detail, ts]);
      driftCount++;
    } catch (e) { /* skip */ }
  }
  console.log(`  ✅ ${driftCount} drift event eklendi`);

  // ═══════════════════════════════════════════════
  // 10. ML MODEL QUALITY
  // ═══════════════════════════════════════════════
  console.log('📊 10. ML Model Quality oluşturuluyor...');
  try {
    for (const epId of endpointIds) {
      for (let day = 0; day < 7; day++) {
        const ts = new Date(now);
        ts.setDate(ts.getDate() - day);
        await c.query(`
          INSERT INTO ml_model_quality 
          (customer_id, endpoint_id, model_type, accuracy, precision_score, recall_score, f1_score, evaluated_at)
          VALUES ($1, $2, 'latency_predictor', $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [ADMIN_ID, epId, 
            0.8 + Math.random() * 0.15, 
            0.75 + Math.random() * 0.2,
            0.7 + Math.random() * 0.25,
            0.72 + Math.random() * 0.2,
            ts]);
      }
    }
    console.log('  ✅ ML model quality metrikleri eklendi');
  } catch (e) {
    console.log('  ⚠️ ML quality:', e.message.substring(0, 60));
  }

  // ═══════════════════════════════════════════════
  // 11. ENDPOINT PROFILES
  // ═══════════════════════════════════════════════
  console.log('👤 11. Endpoint Profiles oluşturuluyor...');
  let profileCount = 0;
  for (const epId of endpointIds) {
    try {
      await c.query(`
        INSERT INTO endpoint_profiles 
        (customer_id, endpoint_id, avg_latency_ms, p95_latency_ms, success_rate, avg_payload_size, typical_volume_per_hour, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (endpoint_id) DO UPDATE SET
          avg_latency_ms = EXCLUDED.avg_latency_ms,
          p95_latency_ms = EXCLUDED.p95_latency_ms,
          success_rate = EXCLUDED.success_rate,
          last_updated = NOW()
      `, [ADMIN_ID, epId, 
          100 + Math.floor(Math.random() * 200),
          200 + Math.floor(Math.random() * 400),
          0.90 + Math.random() * 0.09,
          1024 + Math.floor(Math.random() * 5000),
          30 + Math.floor(Math.random() * 100)]);
      profileCount++;
    } catch (e) {
      console.log('  ⚠️ Profile:', e.message.substring(0, 60));
    }
  }
  console.log(`  ✅ ${profileCount} endpoint profili eklendi`);

  // ═══════════════════════════════════════════════
  // 12. AUTOML TRIALS
  // ═══════════════════════════════════════════════
  console.log('🔬 12. AutoML Trials oluşturuluyor...');
  try {
    const epId = endpointIds[0];
    for (let i = 0; i < 5; i++) {
      await c.query(`
        INSERT INTO automl_trials 
        (customer_id, endpoint_id, trial_number, params, score, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'completed', NOW() - INTERVAL '${i} hours')
        ON CONFLICT DO NOTHING
      `, [ADMIN_ID, epId, i + 1,
          JSON.stringify({
            n_estimators: 50 + i * 20,
            max_depth: 3 + i,
            learning_rate: 0.01 + i * 0.02,
            min_samples_split: 2 + i,
          }),
          0.7 + i * 0.05]);
    }
    console.log('  ✅ 5 AutoML trial eklendi');
  } catch (e) {
    console.log('  ⚠️ AutoML:', e.message.substring(0, 60));
  }

  // ═══════════════════════════════════════════════
  // ÖZET
  // ═══════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log('🧠 CORTEX SEED TAMAMLANDI!');
  console.log('════════════════════════════════════════');
  console.log(`  Hourly Stats:  ${statsCount}`);
  console.log(`  Anomaly Scores: ${anomalyCount}`);
  console.log(`  ML Models:     ${modelCount}`);
  console.log(`  Healing:       ${healingCount}`);
  console.log(`  ML Decisions:  ${decisionCount}`);
  console.log(`  ML Features:   ${featureCount}`);
  console.log(`  Traces:        ${traceCount}`);
  console.log(`  AB Tests:      2`);
  console.log(`  Drift Events:  ${driftCount}`);
  console.log(`  Profiles:      ${profileCount}`);
  console.log(`  AutoML:        5`);
  console.log('════════════════════════════════════════');
  
  await c.end();
})();
