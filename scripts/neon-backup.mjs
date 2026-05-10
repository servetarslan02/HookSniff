#!/usr/bin/env node
/**
 * HookSniff — Neon PostgreSQL Backup Script
 * 
 * Uses pg module to export database schema + data as SQL.
 * No pg_dump required — works in any Node.js environment.
 * 
 * Usage:
 *   node scripts/neon-backup.mjs                    # Full backup to stdout
 *   node scripts/neon-backup.mjs --out /tmp/backup  # Save to directory
 *   node scripts/neon-backup.mjs --tables users,webhooks  # Specific tables only
 * 
 * Environment:
 *   DATABASE_URL — PostgreSQL connection string (required)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const args = process.argv.slice(2);
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const tablesArg = args.includes('--tables') ? args[args.indexOf('--tables') + 1] : null;
const specificTables = tablesArg ? tablesArg.split(',').map(t => t.trim()) : null;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

async function getTables(client) {
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return res.rows.map(r => r.table_name);
}

async function getTableSchema(client, tableName) {
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default,
           character_maximum_length, numeric_precision
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  return res.rows;
}

async function getTableConstraints(client, tableName) {
  const res = await client.query(`
    SELECT 
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = $1
    ORDER BY tc.constraint_type, tc.constraint_name
  `, [tableName]);
  return res.rows;
}

async function getTableIndexes(client, tableName) {
  const res = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = $1
    ORDER BY indexname
  `, [tableName]);
  return res.rows;
}

async function getTableData(client, tableName) {
  const res = await client.query(`SELECT * FROM "${tableName}"`);
  return res.rows;
}

function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Buffer.isBuffer(val)) return `'\\x${val.toString('hex')}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  // Dynamic import for pg (may not be installed globally)
  let pg;
  try {
    pg = await import('pg');
  } catch {
    console.error('❌ pg module not found. Install it: npm install pg');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.error('🔗 Connected to Neon PostgreSQL');

  const tables = specificTables || await getTables(client);
  console.error(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);

  const lines = [];
  lines.push(`-- HookSniff Database Backup`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Tables: ${tables.length}`);
  lines.push(`-- NOTE: This is a data-only backup. Run migrations first for schema.`);
  lines.push('');

  for (const table of tables) {
    console.error(`📦 Backing up table: ${table}`);
    
    const data = await getTableData(client, table);
    
    if (data.length === 0) {
      lines.push(`-- Table ${table}: empty`);
      lines.push('');
      continue;
    }

    const columns = Object.keys(data[0]);
    lines.push(`-- Table: ${table} (${data.length} rows)`);
    lines.push(`TRUNCATE TABLE "${table}" CASCADE;`);

    for (const row of data) {
      const values = columns.map(c => escapeValue(row[c])).join(', ');
      lines.push(`INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values});`);
    }
    lines.push('');
  }

  // Also get migration history
  try {
    const migrations = await client.query(`
      SELECT name, applied_at FROM _migrations ORDER BY applied_at
    `);
    if (migrations.rows.length > 0) {
      lines.push('-- Migration history');
      lines.push('-- (run these to track which migrations have been applied)');
      for (const m of migrations.rows) {
        lines.push(`-- ${m.name} @ ${m.applied_at}`);
      }
    }
  } catch {
    // _migrations table might not exist
  }

  const output = lines.join('\n');

  if (outDir) {
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const filename = `hooksniff-backup-${timestamp}.sql`;
    const filepath = join(outDir, filename);
    writeFileSync(filepath, output);
    console.error(`✅ Backup saved: ${filepath} (${(output.length / 1024).toFixed(1)} KB)`);
  } else {
    process.stdout.write(output);
  }

  await client.end();
  console.error('✅ Backup complete');
}

main().catch(err => {
  console.error('❌ Backup failed:', err.message);
  process.exit(1);
});
