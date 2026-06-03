const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  try {
    // Test revenue/metrics queries
    console.log('=== revenue/metrics queries ===');
    
    let r = await client.query("SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0::double precision) FROM invoices WHERE status = 'paid' AND paid_at >= NOW() - INTERVAL '30 days'");
    console.log('mrr:', r.rows[0]);
    
    r = await client.query("SELECT COALESCE(AVG(avg_months), 0.0::double precision) FROM (SELECT customer_id, CASE WHEN COUNT(*) > 1 THEN EXTRACT(EPOCH FROM (MAX(paid_at) - MIN(paid_at))) / 2592000.0 ELSE 0.0::double precision END as avg_months FROM invoices WHERE status = 'paid' GROUP BY customer_id) sub");
    console.log('avg_months:', r.rows[0]);
    
    r = await client.query("SELECT COUNT(*)::bigint FROM (SELECT customer_id FROM invoices WHERE status = 'paid' GROUP BY customer_id HAVING MAX(paid_at) < NOW() - INTERVAL '30 days') churned");
    console.log('churned:', r.rows[0]);
    
    // Test revenue/cohorts query
    console.log('\n=== revenue/cohorts query ===');
    r = await client.query(`WITH cohort_base AS (
      SELECT TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') as cohort_month, c.id as customer_id, DATE_TRUNC('month', c.created_at) as cohort_start
      FROM customers c WHERE c.created_at >= NOW() - ('12' || ' months')::interval
    ), cohort_revenue AS (
      SELECT cb.cohort_month, COUNT(DISTINCT cb.customer_id) as customers_signed_up,
        COUNT(DISTINCT CASE WHEN i.paid_at >= NOW() - INTERVAL '30 days' THEN cb.customer_id END) as customers_active,
        COALESCE(SUM(CASE WHEN i.paid_at >= cb.cohort_start AND i.paid_at < cb.cohort_start + INTERVAL '1 month' THEN i.amount_cents::bigint ELSE 0::bigint END), 0::bigint) as total_revenue_cents
      FROM cohort_base cb LEFT JOIN invoices i ON i.customer_id = cb.customer_id AND i.status = 'paid'
      GROUP BY cb.cohort_month
    ) SELECT cohort_month, customers_signed_up, customers_active, total_revenue_cents,
      CASE WHEN customers_signed_up > 0 THEN ROUND(customers_active::double precision / customers_signed_up * 100, 1)::double precision ELSE 0.0::double precision END as retention_rate
    FROM cohort_revenue ORDER BY cohort_month DESC`);
    console.log('cohorts:', r.rows.length, 'rows');
    r.rows.slice(0,3).forEach(row => console.log('  ', JSON.stringify(row)));
    
    console.log('\nAll queries OK!');
  } catch(e) { console.log('ERROR:', e.message); }
  finally { await client.end(); }
});
