const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const ANOMALIES = {
  normal: 0.80,
  slight: 0.10,
  spike: 0.05,
  cascade: 0.04,
};

function getRealisticMetrics(hour) {
  let sr = 0.96, lat = 150, vol = 800;
  if ((hour >= 9 && hour <= 11) || (hour >= 12 && hour <= 15)) {
    sr = 0.93; lat = 200; vol = 1500;
  }
  if (hour >= 0 && hour <= 5) {
    sr = 0.985; vol = 200;
  }
  return {
    success_rate: sr + (Math.random() - 0.5) * 0.02,
    latency_ms: lat + Math.random() * 100,
    volume: vol + Math.floor(Math.random() * 300),
  };
}

function getAnomalyType() {
  const rand = Math.random();
  if (rand < 0.80) return 'normal';
  if (rand < 0.90) return 'slight';
  if (rand < 0.95) return 'spike';
  return 'cascade';
}

function applyAnomaly(m, type) {
  if (type === 'slight') return { success_rate: m.success_rate * 0.85, latency_ms: m.latency_ms * 1.5, volume: m.volume };
  if (type === 'spike') return { success_rate: m.success_rate * 0.9, latency_ms: m.latency_ms * 2.5, volume: m.volume * 2 };
  if (type === 'cascade') return { success_rate: m.success_rate * 0.6, latency_ms: 8000 + Math.random() * 2000, volume: m.volume };
  return m;
}

(async () => {
  try {
    console.log('🔄 Fetching endpoints...');
    const endpoints = await pool.query('SELECT id FROM endpoints LIMIT 25');
    
    if (!endpoints.rows.length) {
      console.error('❌ No endpoints found');
      process.exit(1);
    }
    
    console.log(`✅ Found ${endpoints.rows.length} endpoints\n`);
    
    let inserted = 0;
    const services = ['stripe', 'github', 'shopify', 'paypal', 'twilio'];
    
    // Generate 72 hours of realistic data
    for (let hoursBack = 72; hoursBack >= 0; hoursBack--) {
      const timestamp = new Date(Date.now() - hoursBack * 3600000);
      const hour = timestamp.getHours();
      
      for (const endpoint of endpoints.rows) {
        const service = services[Math.floor(Math.random() * services.length)];
        const baseMetrics = getRealisticMetrics(hour);
        const anomalyType = getAnomalyType();
        const finalMetrics = applyAnomaly(baseMetrics, anomalyType);
        
        const delivered = Math.floor(finalMetrics.volume * finalMetrics.success_rate);
        const failed = finalMetrics.volume - delivered;
        
        const p50 = Math.floor(finalMetrics.latency_ms * 0.95);
        const p95 = Math.floor(finalMetrics.latency_ms * 1.15);
        const p99 = Math.floor(finalMetrics.latency_ms * 1.4);
        
        await pool.query(
          `INSERT INTO endpoint_hourly_stats (
             endpoint_id,
             hour_start,
             total_deliveries,
             successful,
             failed,
             avg_latency_ms,
             p50_latency_ms,
             p95_latency_ms,
             p99_latency_ms,
             error_breakdown
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (endpoint_id, hour_start)
           DO UPDATE SET
             total_deliveries = EXCLUDED.total_deliveries,
             successful = EXCLUDED.successful,
             failed = EXCLUDED.failed,
             avg_latency_ms = EXCLUDED.avg_latency_ms,
             p50_latency_ms = EXCLUDED.p50_latency_ms,
             p95_latency_ms = EXCLUDED.p95_latency_ms,
             p99_latency_ms = EXCLUDED.p99_latency_ms,
             error_breakdown = EXCLUDED.error_breakdown`,
          [
            endpoint.id,
            timestamp,
            finalMetrics.volume,
            delivered,
            failed,
            Math.floor(finalMetrics.latency_ms),
            p50,
            p95,
            p99,
            JSON.stringify({
              service,
              anomaly: anomalyType,
              payload_example: `${service}:${anomalyType}`,
            }),
          ]
        );
        
        inserted++;
        if (inserted % 50 === 0) {
          process.stdout.write(`✓ ${inserted} records\r`);
        }
      }
    }
    
    console.log(`\n✅ Inserted ${inserted} realistic records\n`);
    console.log(`📊 Service mix: Stripe, GitHub, Shopify, PayPal, Twilio`);
    console.log(`🎭 Anomalies: 80% normal, 10% slight, 5% spike, 4% cascade\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
