//! Buffered webhook counter — batches webhook_count increments in memory
//! and flushes to PostgreSQL every few seconds.
//!
//! Instead of `UPDATE customers SET webhook_count = webhook_count + 1`
//! on every single webhook (causing row-lock contention), we buffer
//! increments in memory and flush as a single atomic UPDATE.
//!
//! This reduces DB writes from ~167/s to ~0.2/s (once every 5 seconds).

use dashmap::DashMap;
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use uuid::Uuid;

/// Buffer entry: accumulated count since last flush.
struct CounterEntry {
    count: i64,
}

/// Thread-safe buffered counter for webhook_count increments.
#[derive(Clone)]
pub struct WebhookCountBuffer {
    /// customer_id → accumulated count since last flush
    pending: Arc<DashMap<Uuid, i64>>,
    pool: PgPool,
}

impl WebhookCountBuffer {
    pub fn new(pool: PgPool, flush_interval: Duration) -> Self {
        let pending = Arc::new(DashMap::new());
        let flush_pool = pool.clone();
        let flush_pending = pending.clone();

        let buffer = Self {
            pending,
            pool,
        };
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(flush_interval);
            loop {
                interval.tick().await;
                Self::flush(&flush_pending, &flush_pool).await;
            }
        });

        tracing::info!(
            "✅ WebhookCountBuffer started (flush every {}s)",
            flush_interval.as_secs()
        );
        buffer
    }

    /// Buffer an increment for a customer. Non-blocking.
    pub fn increment(&self, customer_id: Uuid, count: i64) {
        self.pending
            .entry(customer_id)
            .and_modify(|e| *e += count)
            .or_insert(count);
    }

    /// Flush all pending increments to PostgreSQL.
    async fn flush(pending: &DashMap<Uuid, i64>, pool: &PgPool) {
        if pending.is_empty() {
            return;
        }

        // Drain all entries
        let entries: Vec<(Uuid, i64)> = pending
            .iter()
            .map(|entry| (*entry.key(), *entry.value()))
            .collect();

        // Clear the map BEFORE flushing to avoid losing concurrent increments
        for (customer_id, _) in &entries {
            pending.remove(customer_id);
        }

        // Batch UPDATE in a single query using unnest
        if entries.is_empty() {
            return;
        }

        let customer_ids: Vec<Uuid> = entries.iter().map(|(id, _)| *id).collect();
        let counts: Vec<i64> = entries.iter().map(|(_, c)| *c).collect();

        let result = sqlx::query(
            "UPDATE customers SET webhook_count = webhook_count + v.count \
             FROM unnest($1::uuid[], $2::bigint[]) AS v(id, count) \
             WHERE customers.id = v.id"
        )
        .bind(&customer_ids)
        .bind(&counts)
        .execute(pool)
        .await;

        match result {
            Ok(result) => {
                let rows = result.rows_affected();
                if rows > 0 {
                    tracing::debug!(
                        "WebhookCountBuffer: flushed {} increments for {} customers",
                        entries.iter().map(|(_, c)| c).sum::<i64>(),
                        rows
                    );
                }
            }
            Err(e) => {
                tracing::error!("WebhookCountBuffer flush failed: {:?}", e);
                // Re-add failed entries back to the buffer
                for (customer_id, count) in entries {
                    pending
                        .entry(customer_id)
                        .and_modify(|e| *e += count)
                        .or_insert(count);
                }
            }
        }
    }

    /// Get the current buffered count for a customer (for diagnostics).
    pub fn pending_count(&self, customer_id: &Uuid) -> i64 {
        self.pending.get(customer_id).map(|e| *e).unwrap_or(0)
    }

    /// Force flush all pending increments (for shutdown).
    pub async fn flush_all(&self) {
        Self::flush(&self.pending, &self.pool).await;
    }
}
