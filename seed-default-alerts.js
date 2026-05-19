const { Client } = require('pg');

async function seedAlerts() {
  const url = process.argv[2];
  if (!url) { console.error('Usage: node seed-default-alerts.js <DATABASE_URL>'); process.exit(1); }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Neon DB');

    // Find admin user (servetarslan02)
    const adminRes = await client.query(
      `SELECT id, email, plan FROM customers WHERE email = 'servetarslan02@gmail.com' OR is_admin = true LIMIT 1`
    );
    
    if (adminRes.rows.length === 0) {
      console.error('❌ No admin user found');
      process.exit(1);
    }
    
    const admin = adminRes.rows[0];
    console.log(`👤 Admin: ${admin.email} (${admin.id})\n`);

    const alerts = [
      {
        name: 'High Failure Rate',
        condition: 'failure_rate',
        threshold: 10,
        channels: ['email'],
        cooldown: 15,
      },
      {
        name: 'Critical Failure Rate',
        condition: 'failure_rate',
        threshold: 50,
        channels: ['email'],
        cooldown: 10,
      },
      {
        name: 'High Latency',
        condition: 'latency',
        threshold: 5000,
        channels: ['email'],
        cooldown: 30,
      },
      {
        name: 'Endpoint Down',
        condition: 'consecutive_failures',
        threshold: 5,
        channels: ['email'],
        cooldown: 15,
      },
      {
        name: 'Endpoint Critical',
        condition: 'consecutive_failures',
        threshold: 10,
        channels: ['email'],
        cooldown: 10,
      },
    ];

    for (const alert of alerts) {
      const existing = await client.query(
        `SELECT id FROM alert_rules WHERE name = $1 AND customer_id = $2`,
        [alert.name, admin.id]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Already exists: ${alert.name}`);
        continue;
      }

      await client.query(
        `INSERT INTO alert_rules (customer_id, name, condition, threshold, channels, is_active, cooldown_minutes)
         VALUES ($1, $2, $3, $4, $5, true, $6)`,
        [admin.id, alert.name, alert.condition, alert.threshold, JSON.stringify(alert.channels), alert.cooldown]
      );
      console.log(`✅ ${alert.name} — ${alert.condition} > ${alert.threshold}, cooldown ${alert.cooldown}min`);
    }

    const count = await client.query(`SELECT COUNT(*) FROM alert_rules WHERE customer_id = $1`, [admin.id]);
    console.log(`\n📊 Toplam alert kuralı: ${count.rows[0].count}`);

  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAlerts();
