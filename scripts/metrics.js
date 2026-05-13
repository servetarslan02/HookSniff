const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DB_URL });
c.connect().then(async () => {
  const r = await c.query(`
    SELECT
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour') as deliveries_1h,
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour' AND status='delivered') as delivered_1h,
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour' AND status='failed') as failed_1h,
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours') as deliveries_24h,
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours' AND status='delivered') as delivered_24h,
      (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours' AND status='failed') as failed_24h,
      (SELECT COUNT(*) FROM webhook_queue WHERE status='pending') as queue_pending,
      (SELECT COUNT(*) FROM webhook_queue WHERE status='processing') as queue_processing,
      (SELECT COUNT(*) FROM webhook_queue WHERE status='delivered') as queue_delivered,
      (SELECT COUNT(*) FROM endpoints) as total_endpoints,
      (SELECT COUNT(*) FROM endpoints WHERE created_at > now() - interval '24 hours') as new_endpoints_24h,
      (SELECT COUNT(*) FROM customers) as total_customers,
      (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '24 hours') as new_customers_24h,
      (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '7 days') as new_customers_7d,
      (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '24 hours') as active_users_24h,
      (SELECT COUNT(*) FROM customers WHERE plan='free') as plan_free,
      (SELECT COUNT(*) FROM customers WHERE plan='developer') as plan_developer,
      (SELECT COUNT(*) FROM customers WHERE plan='startup') as plan_startup,
      (SELECT COUNT(*) FROM customers WHERE plan='pro') as plan_pro,
      (SELECT COUNT(*) FROM customers WHERE plan='enterprise') as plan_enterprise,
      (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%login%') as logins_1h,
      (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%fail%') as failed_actions_1h,
      (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '24 hours') as audit_events_24h,
      (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%rate%') as rate_limited_1h
  `);
  console.log(JSON.stringify(r.rows[0]));
  await c.end();
}).catch(e => console.log(JSON.stringify({error: e.message})));
