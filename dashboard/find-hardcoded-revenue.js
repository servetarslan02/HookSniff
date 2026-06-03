const fs = require('fs');
const c = fs.readFileSync('src/app/[locale]/admin/revenue/components/RevenueContent.tsx', 'utf8');
const lines = c.split('\n');
const patterns = ["'Free'", "'Popular'", "'Edit Plans'", "'Plan Management'", "'No data'", "'Export CSV'", "'Plan Prices'", "'Saving...'", "'Save'", "'Set unlimited'", "'Edit'", "'Configure plan'", "'Lower Plan'", "'Current'", "'Revenue'", "'Subscribers'", "'Cohort'", "'Churned'", "'Refunds'", "'No cohorts'", "'No refunds'", "'No churned'", "'Plan Revenue'", "'Plan Distribution'", "'Monthly Revenue'", "'MRR Trend'", "'Export CSV'", "'Endpoints'", "'Webhooks/mo'", "'Rate/min'", "'Retention'", "'Features'", "'Manage Plans'", "'HMAC'", "'CloudEvents'", "'FIFO'", "'SSO/SAML'", "'SLA'", "'Popular'", "'Loading'", "'Error'", "'Active Subscribers'", "'No monthly'", "'Approve'", "'Deny'", "'Refund'"];
lines.forEach((line, i) => {
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('import') || t.includes('className')) return;
  for (const p of patterns) {
    if (t.includes(p) && !t.includes('t(') && !t.includes('tc(')) {
      console.log('L' + (i+1) + ': ' + t.substring(0, 120));
      break;
    }
  }
});
console.log('Done');
