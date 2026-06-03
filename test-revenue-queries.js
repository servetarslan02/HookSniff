const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  // Test the exact queries from revenue/metrics
  const queries = [
    ["COUNT customers", "SELECT COUNT(*) FROM customers"],
    ["COUNT paying", "SELECT COUNT(*) FROM customers WHERE plan NOT IN ('free', 'developer')"],
    ["MRR", "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0::double precision) as mrr FROM invoices WHERE status = 'paid' AND paid_at >= NOW() - INTERVAL '30 days'"],
    ["avg_months", "SELECT COALESCE(AVG(avg_months), 0.0::double precision) FROM (SELECT customer_id, CASE WHEN COUNT(*) > 1 THEN EXTRACT(EPOCH FROM (MAX(paid_at) - MIN(paid_at))) / 2592000.0 ELSE 0.0::double precision END as avg_months FROM invoices WHERE status = 'paid' GROUP BY customer_id) sub"],
    ["current_month", "SELECT COALESCE(SUM(i.amount_cents::double precision / 100.0), 0.0::double precision) FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'paid' AND i.paid_at >= DATE_TRUNC('month', NOW()) AND c.created_at < DATE_TRUNC('month', NOW())"],
    ["expansion", "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0::double precision) FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'paid' AND i.paid_at >= DATE_TRUNC('month', NOW()) AND c.plan IN ('startup', 'pro', 'enterprise') AND c.created_at < DATE_TRUNC('month', NOW()) - INTERVAL '1 month'"],
    ["cohorts", "WITH cohort_base AS (SELECT TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') as cohort_month, c.id as customer_id, DATE_TRUNC('month', c.created_at) as cohort_start FROM customers c WHERE c.created_at >= NOW() - ('12' || ' months')::interval) SELECT COUNT(*) FROM cohort_base"],
  ];
  
  for (const [name, sql] of queries) {
    try {
      const r = await client.query(sql);
      console.log('OK  ' + name + ': ' + JSON.stringify(r.rows[0]).substring(0, 80));
    } catch(e) {
      console.log('ERR ' + name + ': ' + e.message.substring(0, 100));
    }
  }
  await client.end();
});
