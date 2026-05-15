//! Event publisher with Redis Streams + local broadcast.
//!
//! Publishes events to Redis Streams (XADD) for cross-instance delivery
//! and local broadcast channel for same-instance real-time推送.

use anyhow::Result;
use redis::aio::ConnectionManager;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{debug, warn};
use uuid::Uuid;

/// Global sequence counter (instance başına)
static GLOBAL_SEQ: AtomicU64 = AtomicU64::new(0);

/// Tüm sistem event'leri
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum AppEvent {
    DeliveryCreated {
        delivery_id: Uuid,
        endpoint_id: Uuid,
        customer_id: Uuid,
        event_type: Option<String>,
    },
    DeliveryStatusChanged {
        delivery_id: Uuid,
        customer_id: Uuid,
        old_status: String,
        new_status: String,
    },
    QueueUpdated {
        pending: i64,
        processing: i64,
        failed: i64,
    },
    UserCreated {
        user_id: Uuid,
        email: String,
        plan: String,
    },
    EndpointStatusChanged {
        endpoint_id: Uuid,
        customer_id: Uuid,
        is_active: bool,
    },
}

impl AppEvent {
    pub fn channel(&self) -> &'static str {
        match self {
            Self::DeliveryCreated { .. } | Self::DeliveryStatusChanged { .. } => "deliveries",
            Self::QueueUpdated { .. } => "queue",
            Self::UserCreated { .. } => "users",
            Self::EndpointStatusChanged { .. } => "endpoints",
        }
    }

    pub fn event_type(&self) -> &'static str {
        match self {
            Self::DeliveryCreated { .. } => "delivery.created",
            Self::DeliveryStatusChanged { .. } => "delivery.status_changed",
            Self::QueueUpdated { .. } => "queue.updated",
            Self::UserCreated { .. } => "user.created",
            Self::EndpointStatusChanged { .. } => "endpoint.status_changed",
        }
    }
}

/// Wrap edilmiş event — sequence + timestamp + dedup ID
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub id: Uuid,
    pub seq: u64,
    pub ts: i64,
    pub event: AppEvent,
}

impl EventEnvelope {
    pub fn new(event: AppEvent) -> Self {
        Self {
            id: Uuid::new_v4(),
            seq: GLOBAL_SEQ.fetch_add(1, Ordering::Relaxed),
            ts: chrono::Utc::now().timestamp_millis(),
            event,
        }
    }
}

/// Redis Streams tabanlı event publisher
#[derive(Clone)]
pub struct EventPublisher {
    redis: Option<ConnectionManager>,
    local_tx: broadcast::Sender<EventEnvelope>,
    stream_key: String,
}

impl EventPublisher {
    /// Yeni publisher oluştur. Redis URL verilirse Redis Streams'e de yazar.
    pub async fn new(redis_url: Option<&str>) -> Self {
        let (local_tx, _) = broadcast::channel(1024);

        let redis = match redis_url {
            Some(url) if !url.is_empty() => {
                match redis::Client::open(url) {
                    Ok(client) => {
                        match ConnectionManager::new(client).await {
                            Ok(conn) => Some(conn),
                            Err(e) => {
                                warn!("Redis connection failed for EventPublisher: {e}");
                                None
                            }
                        }
                    }
                    Err(e) => {
                        warn!("Redis client creation failed: {e}");
                        None
                    }
                }
            }
            _ => None,
        };

        Self {
            redis,
            local_tx,
            stream_key: "hooksniff:events".to_string(),
        }
    }

    /// Redis bağlantısı var mı?
    pub fn has_redis(&self) -> bool {
        self.redis.is_some()
    }

    /// Event'i Redis Streams'e yaz + local broadcast
    pub async fn publish(&self, event: AppEvent) -> Result<()> {
        let envelope = EventEnvelope::new(event);
        let payload = serde_json::to_string(&envelope)?;

        // Redis Streams — XADD hooksniff:events * type <type> channel <ch> data <json> seq <n>
        if let Some(ref mut conn) = self.redis.clone() {
            let mut cmd = redis::cmd("XADD");
            cmd.arg(&self.stream_key)
                .arg("*")
                .arg("type")
                .arg(envelope.event.event_type())
                .arg("channel")
                .arg(envelope.event.channel())
                .arg("data")
                .arg(&payload)
                .arg("seq")
                .arg(envelope.seq.to_string());

            match cmd.execute_async(conn).await {
                Ok(()) => {
                    debug!("Event published to Redis Streams: {}", envelope.event.event_type());
                }
                Err(e) => {
                    warn!("Redis XADD failed (best-effort): {e}");
                }
            }
        }

        // Local broadcast (aynı instance'daki WS client'ları için)
        let _ = self.local_tx.send(envelope);
        Ok(())
    }

    /// Local broadcast receiver (anlık推送 için)
    pub fn subscribe(&self) -> broadcast::Receiver<EventEnvelope> {
        self.local_tx.subscribe()
    }

    /// Son N eventi getir (ilk yükleme / reconnect sonrası)
    pub async fn get_recent(&self, count: usize) -> Result<Vec<EventEnvelope>> {
        let conn = match self.redis.clone() {
            Some(c) => c,
            None => return Ok(vec![]),
        };

        let mut conn = conn;
        // XREVRANGE hooksniff:events + - COUNT <count>
        let result: Vec<(String, Vec<String>)> = redis::cmd("XREVRANGE")
            .arg(&self.stream_key)
            .arg("+")
            .arg("-")
            .arg("COUNT")
            .arg(count)
            .query_async(&mut conn)
            .await?;

        let mut events = Vec::new();
        for (_id, fields) in result {
            // fields: ["type", "...", "channel", "...", "data", "...", "seq", "..."]
            if let Some(data_idx) = fields.iter().position(|f| f == "data") {
                if let Some(json) = fields.get(data_idx + 1) {
                    if let Ok(envelope) = serde_json::from_str::<EventEnvelope>(json) {
                        events.push(envelope);
                    }
                }
            }
        }
        events.reverse(); // Eski → yeni sırala
        Ok(events)
    }
}
