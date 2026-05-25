import pg from 'pg';
import { execSync } from 'child_process';
const { Client } = pg;

const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

async function main() {
  await client.connect();
  
  const users = [
    { email: 'test-admin@rbac.test', pass: 'Admin123!' },
    { email: 'test-developer@rbac.test', pass: 'Dev1234!' },
    { email: 'test-analyst@rbac.test', pass: 'Anal1234!' },
    { email: 'test-viewer@rbac.test', pass: 'View1234!' },
  ];
  
  for (const u of users) {
    try {
      // Generate argon2id hash using node built-in
      const salt = Buffer.alloc(16);
      crypto.randomFillSync(salt);
      const hash = execSync(`printf '${u.pass}' | argon2 '${salt.toString('hex')}' -id -m 16 -t 3 -p 1 2>&1 | grep Encoded | awk '{print $2}'`, { encoding: 'utf8' }).trim();
      
      if (hash && hash.startsWith('$argon2')) {
        await client.query('UPDATE customers SET password_hash = $1 WHERE email = $2', [hash, u.email]);
        console.log(`✅ ${u.email} → password reset OK`);
      } else {
        console.log(`⚠️ ${u.email} → hash not generated: "${hash}"`);
      }
    } catch(e) {
      console.log(`⚠️ ${u.email} → ${e.message.substring(0,80)}`);
    }
  }
  
  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
