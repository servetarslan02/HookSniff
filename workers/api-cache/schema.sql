-- HookSniff Analytics D1 Schema
-- Lightweight analytics tables to reduce PostgreSQL load

-- Delivery statistics per endpoint per hour
CREATE TABLE IF NOT EXISTS delivery_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_id TEXT NOT NULL,
  hour TEXT NOT NULL,  -- ISO 8601 hour: '2026-06-04T13:00:00Z'
  total INTEGER NOT NULL DEFAULT 0,
  successful INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms REAL NOT NULL DEFAULT 0,
  p95_latency_ms REAL NOT NULL DEFAULT 0,
  p99_latency_ms REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_delivery_stats_endpoint_hour 
  ON delivery_stats(endpoint_id, hour);

CREATE INDEX IF NOT EXISTS idx_delivery_stats_hour 
  ON delivery_stats(hour);

-- Endpoint health snapshots
CREATE TABLE IF NOT EXISTS endpoint_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_id TEXT NOT NULL,
  snapshot_at TEXT NOT NULL,  -- ISO 8601 timestamp
  success_rate REAL NOT NULL DEFAULT 0,
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms REAL NOT NULL DEFAULT 0,
  p95_latency_ms REAL NOT NULL DEFAULT 0,
  p99_latency_ms REAL NOT NULL DEFAULT 0,
  failure_streak INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_endpoint_health_endpoint 
  ON endpoint_health(endpoint_id, snapshot_at);

-- Daily aggregated stats
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,  -- '2026-06-04'
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  successful INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  unique_endpoints INTEGER NOT NULL DEFAULT 0,
  avg_success_rate REAL NOT NULL DEFAULT 0,
  avg_latency_ms REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_stats_date 
  ON daily_stats(date);

-- Error classification summary
CREATE TABLE IF NOT EXISTS error_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint_id TEXT NOT NULL,
  date TEXT NOT NULL,
  error_class TEXT NOT NULL,  -- 'permanent_error', 'rate_limited', 'server_error', 'timeout', 'network_error'
  count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_error_summary_endpoint_date 
  ON error_summary(endpoint_id, date);
