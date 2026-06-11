import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (sql) return sql;
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL not configured — playground DB disabled');
    return null;
  }
  sql = neon(url);
  return sql;
}

/** Playground history tablosunu oluştur (yoksa) */
export async function ensurePlaygroundTable() {
  const db = getSql();
  if (!db) return;
  await db`
    CREATE TABLE IF NOT EXISTS playground_history (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      query JSONB DEFAULT '{}',
      headers JSONB DEFAULT '{}',
      body TEXT,
      content_length INTEGER DEFAULT 0,
      ip TEXT,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_playground_token ON playground_history (token, timestamp DESC)`;
}

/** Playground isteği kaydet */
export async function insertPlaygroundRequest(record: {
  id: string;
  token: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string | null;
  content_length: number;
  ip: string;
  timestamp: string;
}) {
  const db = getSql();
  if (!db) return;
  await db`
    INSERT INTO playground_history (id, token, method, path, query, headers, body, content_length, ip, timestamp)
    VALUES (${record.id}, ${record.token}, ${record.method}, ${record.path},
            ${JSON.stringify(record.query)}::jsonb, ${JSON.stringify(record.headers)}::jsonb,
            ${record.body}, ${record.content_length}, ${record.ip}, ${record.timestamp})
  `;
}

/** Playground token'ı için history getir */
export async function getPlaygroundHistory(token: string, sinceMs?: number, limit = 100) {
  const db = getSql();
  if (!db) return [];
  if (sinceMs && sinceMs > 0) {
    const sinceDate = new Date(sinceMs).toISOString();
    return await db`
      SELECT id, method, path, query, headers, body, content_length, ip, timestamp
      FROM playground_history
      WHERE token = ${token} AND timestamp > ${sinceDate}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
  }
  return await db`
    SELECT id, method, path, query, headers, body, content_length, ip, timestamp
    FROM playground_history
    WHERE token = ${token}
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;
}

/** Playground token'ı için history sil */
export async function deletePlaygroundHistory(token: string) {
  const db = getSql();
  if (!db) return;
  await db`DELETE FROM playground_history WHERE token = ${token}`;
}

/** 24 saatten eski kayıtları temizle */
export async function cleanupOldPlaygroundRecords() {
  const db = getSql();
  if (!db) return;
  await db`DELETE FROM playground_history WHERE timestamp < NOW() - INTERVAL '24 hours'`;
}
