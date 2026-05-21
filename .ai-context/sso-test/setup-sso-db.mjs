import pg from 'pg';
const { Client } = pg;

const NEON_URL = "postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({ connectionString: NEON_URL });

async function main() {
  await client.connect();
  console.log('✅ Connected to Neon DB');

  // 1. Check existing SSO config
  const existing = await client.query("SELECT id, customer_id, team_id, provider, enabled FROM sso_configs LIMIT 5");
  console.log('\nExisting SSO configs:', existing.rows.length);
  existing.rows.forEach(r => console.log(`  ${r.id} | customer=${r.customer_id} | team=${r.team_id} | ${r.provider} | enabled=${r.enabled}`));

  // 2. Get Servet's customer ID
  const servet = await client.query("SELECT id, email, plan FROM customers WHERE email = 'servetarslan02@gmail.com'");
  if (servet.rows.length === 0) {
    console.log('\n❌ Servet not found in customers table');
    await client.end();
    return;
  }
  const customerId = servet.rows[0].id;
  console.log(`\n✅ Servet found: id=${customerId}, plan=${servet.rows[0].plan}`);

  // 3. Get or create a team for SSO
  let teamId;
  const teams = await client.query("SELECT id, name, owner_id FROM teams WHERE owner_id = $1 LIMIT 1", [customerId]);
  if (teams.rows.length > 0) {
    teamId = teams.rows[0].id;
    console.log(`✅ Team found: id=${teamId}, name=${teams.rows[0].name}`);
  } else {
    const newTeam = await client.query(
      "INSERT INTO teams (name, owner_id, created_at) VALUES ('HookSniff SSO Team', $1, NOW()) RETURNING id",
      [customerId]
    );
    teamId = newTeam.rows[0].id;
    console.log(`✅ Team created: id=${teamId}`);
  }

  // 4. Insert/Update SSO config (OIDC - Keycloak)
  const ssoConfig = {
    team_id: teamId,
    customer_id: customerId,
    created_by: customerId,
    provider: 'oidc',
    enabled: true,
    admin_bypass: true,
    verified_domain: 'hooksniff.dev',
    issuer_url: 'http://localhost:8080/realms/hooksniff',
    client_id: 'hooksniff-client',
    client_secret_encrypted: null,
    default_team_id: teamId,
    default_role: 'viewer',
  };

  const existingConfig = await client.query("SELECT id FROM sso_configs WHERE team_id = $1", [teamId]);
  
  if (existingConfig.rows.length > 0) {
    await client.query(`
      UPDATE sso_configs SET 
        provider = $1, enabled = $2, admin_bypass = $3, verified_domain = $4,
        issuer_url = $5, client_id = $6, default_team_id = $7, default_role = $8,
        updated_at = NOW()
      WHERE team_id = $9
    `, [ssoConfig.provider, ssoConfig.enabled, ssoConfig.admin_bypass, ssoConfig.verified_domain,
        ssoConfig.issuer_url, ssoConfig.client_id, ssoConfig.default_team_id, ssoConfig.default_role, teamId]);
    console.log('✅ SSO config updated');
  } else {
    await client.query(`
      INSERT INTO sso_configs (team_id, customer_id, created_by, provider, enabled, admin_bypass, verified_domain, issuer_url, client_id, default_team_id, default_role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [ssoConfig.team_id, ssoConfig.customer_id, ssoConfig.created_by, ssoConfig.provider, ssoConfig.enabled,
        ssoConfig.admin_bypass, ssoConfig.verified_domain, ssoConfig.issuer_url, ssoConfig.client_id,
        ssoConfig.default_team_id, ssoConfig.default_role]);
    console.log('✅ SSO config inserted');
  }

  // 5. Add SSO test users to the team
  const testEmails = ['admin@hooksniff.dev', 'dev@hooksniff.dev', 'viewer@hooksniff.dev', 'analyst@hooksniff.dev'];
  
  for (const email of testEmails) {
    let user = await client.query("SELECT id FROM customers WHERE email = $1", [email]);
    
    if (user.rows.length === 0) {
      const newUser = await client.query(`
        INSERT INTO customers (email, api_key_hash, api_key_prefix, plan, webhook_limit, is_active, email_verified, name, role, password_hash, created_at)
        VALUES ($1, 'sso-managed', 'sso-user-', 'free', 100, true, true, $2, 'member', 'sso-no-password', NOW())
        RETURNING id
      `, [email, email.split('@')[0].replace('.', ' ')]);
      user = newUser;
      console.log(`  Created customer: ${email}`);
    }
    
    const userId = user.rows[0].id;
    
    const member = await client.query("SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2", [teamId, userId]);
    if (member.rows.length === 0) {
      const role = email.startsWith('admin') ? 'admin' : email.startsWith('dev') ? 'developer' : email.startsWith('analyst') ? 'analyst' : 'viewer';
      await client.query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW())",
        [teamId, userId, role]
      );
      console.log(`  Added to team: ${email} as ${role}`);
    } else {
      console.log(`  Already in team: ${email}`);
    }
  }

  // 6. Verify final state
  console.log('\n=== Final SSO Config ===');
  const finalConfig = await client.query(`
    SELECT s.id, s.provider, s.enabled, s.verified_domain, s.issuer_url, s.client_id, s.default_role,
           t.name as team_name
    FROM sso_configs s
    JOIN teams t ON t.id = s.team_id
    WHERE s.team_id = $1
  `, [teamId]);
  
  finalConfig.rows.forEach(r => {
    console.log(`  Provider: ${r.provider}`);
    console.log(`  Enabled: ${r.enabled}`);
    console.log(`  Domain: ${r.verified_domain}`);
    console.log(`  Issuer: ${r.issuer_url}`);
    console.log(`  Client ID: ${r.client_id}`);
    console.log(`  Default Role: ${r.default_role}`);
    console.log(`  Team: ${r.team_name}`);
  });

  console.log('\n=== Team Members ===');
  const members = await client.query(`
    SELECT c.email, tm.role, tm.joined_at
    FROM team_members tm
    JOIN customers c ON c.id = tm.customer_id
    WHERE tm.team_id = $1
    ORDER BY tm.role
  `, [teamId]);
  
  members.rows.forEach(m => {
    console.log(`  ${m.email} — ${m.role}`);
  });

  await client.end();
  console.log('\n✅ Done!');
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
