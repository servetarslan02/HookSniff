const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  try {
    const r = await client.query(`WITH cohort_base AS (
      SELECT TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') as cohort_month,
        c.id as customer_id, DATE_TRUNC('month', c.created_at) as cohort_start
      FROM customers c WHERE c.created_at >= NOW() - ('12' || ' months')::interval
    ), cohort_revenue AS (
      SELECT cb.cohort_month,
        COUNT(DISTINCT cb.customer_id) as customers_signed_up,
        COUNT(DISTINCT CASE WHEN i.paid_at >= NOW() - INTERVAL '30 days' THEN cb.customer_id END) as customers_active,
        COALESCE(SUM(CASE WHEN i.paid_at >= cb.cohort_start AND i.paid_at < cb.cohort_start + INTERVAL '1 month' THEN i.amount_cents::bigint ELSE 0::bigint END), 0::bigint) as total_revenue_cents
      FROM cohort_base cb LEFT JOIN invoices i ON i.customer_id = cb.customer_id AND i.status = 'paid'
      GROUP BY cb.cohort_month
    ) SELECT cohort_month, customers_signed_up, customers_active, total_revenue_cents,
      CASE WHEN customers_signed_up > 0 THEN ROUND((customers_active::numeric / customers_signed_up * 100), 1)::double precision ELSE 0.0::double precision END as retention_rate
    FROM cohort_revenue ORDER BY cohort_month DESC`);
    console.log('OK:', r.rows.length, 'rows');
    r.rows.slice(0,3).forEach(row => console.log(' ', JSON.stringify(row)));
  } catch(e) { console.log('ERROR:', e.message); }
  finally { await client.end(); }
});
