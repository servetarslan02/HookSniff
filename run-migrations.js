const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  // Strip sslmode from connection string to avoid pg SSL mode warning
  // (ssl is configured via the ssl option below)
  const cleanUrl = DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');
  const client = new Client({ 
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon DB');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files\n`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`▶ Running: ${file}`);
      try {
        await client.query(sql);
        console.log(`  ✅ Success`);
      } catch (err) {
        // Some migrations may already be applied
        if (err.message.includes('already exists')) {
          console.log(`  ⚠️ Already applied, skipping`);
        } else {
          console.log(`  ❌ Error: ${err.message}`);
        }
      }
    }

    console.log('\n✅ All migrations complete!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations();
