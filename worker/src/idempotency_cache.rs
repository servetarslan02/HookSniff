//! Idempotency Cache — Delivered delivery ID'lerini cache'ler.
//!
//! Redis consumer'da her mesaj için DB sorgusu yerine kullanılır.

use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::Duration;

pub struct IdempotencyCache {
    delivered: Arc<RwLock<HashSet<String>>>,
}

impl IdempotencyCache {
    pub fn new(_ttl: Duration) -> Self {
        let cache = Self {
            delivered: Arc::new(RwLock::new(HashSet::new())),
        };

        let delivered = cache.delivered.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(300));
            loop {
                interval.tick().await;
                let mut map = delivered.write().await;
                let size = map.len();
                map.clear();
                if size > 0 {
                    tracing::debug!("🧹 Idempotency cache flushed ({} entries)", size);
                }
            }
        });

        cache
    }

    pub async fn is_delivered(&self, delivery_id: &str) -> bool {
        self.delivered.read().await.contains(delivery_id)
    }

    pub async fn mark_delivered(&self, delivery_id: String) {
        self.delivered.write().await.insert(delivery_id);
    }
}
