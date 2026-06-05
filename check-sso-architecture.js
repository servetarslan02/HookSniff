const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

(async () => {
  await c.connect();

  // 1. SSO configs
  const configs = await c.query("SELECT id, customer_id, team_id, provider, enabled, issuer_url, client_id, verified_domain, admin_bypass, scim_enabled, default_role, created_at FROM sso_configs ORDER BY created_at DESC LIMIT 5");
  console.log('=== SSO CONFIGS ===');
  configs.rows.forEach(r => console.log(`  ${r.id.substring(0,8)} | customer=${r.customer_id?.substring(0,8)} | team=${r.team_id?.substring(0,8) || 'null'} | ${r.provider} | enabled=${r.enabled} | domain=${r.verified_domain || 'none'}`));

  // 2. SSO login attempts
  const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'sso_login_attempts' ORDER BY ordinal_position");
  console.log('\n=== SSO LOGIN ATTEMPTS COLUMNS ===');
  cols.rows.forEach(r => console.log(`  ${r.column_name}`));

  // 3. Check if there are any login attempts
  try {
    const attempts = await c.query('SELECT * FROM sso_login_attempts ORDER BY created_at DESC LIMIT 5');
    console.log('\n=== LOGIN ATTEMPTS ===');
    if (attempts.rows.length === 0) console.log('  (none)');
    else attempts.rows.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  } catch (e) {
    console.log('\n=== LOGIN ATTEMPTS TABLE ===');
    console.log('  Error: ' + e.message);
  }

  // 4. Check domain verifications
  try {
    const domains = await c.query('SELECT * FROM domain_verifications ORDER BY created_at DESC LIMIT 5');
    console.log('\n=== DOMAIN VERIFICATIONS ===');
    if (domains.rows.length === 0) console.log('  (none)');
    else domains.rows.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  } catch (e) {
    console.log('\n=== DOMAIN VERIFICATIONS ===');
    console.log('  Error: ' + e.message);
  }

  // 5. SCIM users
  try {
    const scim = await c.query('SELECT * FROM sso_scim_users ORDER BY created_at DESC LIMIT 5');
    console.log('\n=== SCIM USERS ===');
    if (scim.rows.length === 0) console.log('  (none)');
    else scim.rows.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  } catch (e) {
    console.log('\n=== SCIM USERS ===');
    console.log('  Error: ' + e.message);
  }

  // 6. Customers table - check for SSO-related fields
  const custCols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND column_name LIKE '%sso%' ORDER BY ordinal_position");
  console.log('\n=== CUSTOMER SSO COLUMNS ===');
  if (custCols.rows.length === 0) console.log('  (none)');
  else custCols.rows.forEach(r => console.log(`  ${r.column_name}`));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
