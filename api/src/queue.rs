//! Redis Streams-based webhook queue for sub-millisecond delivery.
//!
//! Architecture: Redis-first with PostgreSQL fallback.
//! - Write: Try Redis XADD first, fall back to PostgreSQL INSERT on failure
//! - Read: Worker uses XREADGROUP with blocking reads
//! - Ack: XACK after successful delivery
//! - Recovery: XAUTOCLAIM for crash recovery (5 min timeout)

use anyhow::Result;
use redis::aio::ConnectionManager;
use serde::{Deserialize, Serialize};

const STREAM_KEY: &str = "hooksniff:webhooks";
const CONSUMER_GROUP: &str = "hooksniff-workers";
const MAX_STREAM_LEN: usize = 100_000;

/// Redis Streams queue client.
#[derive(Debug, Clone)]
pub struct RedisQueue {
    conn: ConnectionManager,
}

/// Message pushed to Redis Streams.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueMessage {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub endpoint_url: String,
    pub payload: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_headers: Option<serde_json::Value>,
    pub signing_secret: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trace_id: Option<String>,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub queue_item_id: String,
}

impl RedisQueue {
    /// Create a new Redis queue connection and ensure consumer group exists.
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let mut conn = ConnectionManager::new(client).await?;

        // Create consumer group (idempotent — BUSYGROUP error is swallowed)
        let _: Result<(), redis::RedisError> = redis::cmd("XGROUP")
            .arg("CREATE")
            .arg(STREAM_KEY)
            .arg(CONSUMER_GROUP)
            .arg("0")
            .arg("MKSTREAM")
            .query_async(&mut conn)
            .await;

        tracing::info!(
 " Redis Streams queue active — stream={}, group={}",
            STREAM_KEY,
            CONSUMER_GROUP
        );
        Ok(Self { conn })
    }

    /// Push a message to the stream (sub-millisecond).
    pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
        let headers_str = msg
            .custom_headers
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_default())
            .unwrap_or_default();

        let id: String = redis::cmd("XADD")
            .arg(STREAM_KEY)
            .arg("MAXLEN")
            .arg("~")
            .arg(MAX_STREAM_LEN)
            .arg("*")
            .arg("delivery_id")
            .arg(&msg.delivery_id)
            .arg("endpoint_id")
            .arg(&msg.endpoint_id)
            .arg("url")
            .arg(&msg.endpoint_url)
            .arg("payload")
            .arg(&msg.payload)
            .arg("headers")
            .arg(&headers_str)
            .arg("signing_secret")
            .arg(&msg.signing_secret)
            .arg("trace_id")
            .arg(msg.trace_id.as_deref().unwrap_or(""))
            .arg("attempt")
            .arg(msg.attempt_count.to_string())
            .arg("max_attempts")
            .arg(msg.max_attempts.to_string())
            .arg("queue_item_id")
            .arg(&msg.queue_item_id)
            .query_async(&mut self.conn)
            .await?;

        Ok(id)
    }

    /// Read a batch of messages using consumer group (blocking).
    pub async fn read_batch(
        &mut self,
        consumer_name: &str,
        count: usize,
        block_ms: usize,
    ) -> Result<Vec<(String, QueueMessage)>> {
        let result: redis::Value = redis::cmd("XREADGROUP")
            .arg("GROUP")
            .arg(CONSUMER_GROUP)
            .arg(consumer_name)
            .arg("COUNT")
            .arg(count)
            .arg("BLOCK")
            .arg(block_ms)
            .arg("STREAMS")
            .arg(STREAM_KEY)
            .arg(">")
            .query_async(&mut self.conn)
            .await?;

        parse_stream_result(result)
    }

    /// Acknowledge a message (delivery complete).
    pub async fn ack(&mut self, stream_id: &str) -> Result<()> {
        let _: redis::Value = redis::cmd("XACK")
            .arg(STREAM_KEY)
            .arg(CONSUMER_GROUP)
            .arg(stream_id)
            .query_async(&mut self.conn)
            .await?;
        Ok(())
    }

    /// Crash recovery — claim pending messages older than 5 minutes.
    pub async fn claim_pending(
        &mut self,
        consumer_name: &str,
    ) -> Result<Vec<(String, QueueMessage)>> {
        let result: redis::Value = redis::cmd("XAUTOCLAIM")
            .arg(STREAM_KEY)
            .arg(CONSUMER_GROUP)
            .arg(consumer_name)
            .arg(300_000) // 5 min timeout
            .arg("0-0")
            .query_async(&mut self.conn)
            .await?;

        parse_xautoclaim_result(result)
    }

    /// Get stream length for monitoring.
    pub async fn len(&mut self) -> Result<usize> {
        let info: redis::Value = redis::cmd("XLEN")
            .arg(STREAM_KEY)
            .query_async(&mut self.conn)
            .await?;

        match info {
            redis::Value::Int(n) => Ok(n as usize),
            _ => Ok(0),
        }
    }
}

/// Parse XREADGROUP result into (stream_id, QueueMessage) pairs.
fn parse_stream_result(value: redis::Value) -> Result<Vec<(String, QueueMessage)>> {
    let mut messages = Vec::new();

    if let redis::Value::Array(streams) = value {
        for stream in streams {
            if let redis::Value::Array(stream_data) = stream {
                if stream_data.len() < 2 {
                    continue;
                }
                if let redis::Value::Array(entries) = &stream_data[1] {
                    for entry in entries {
                        if let Some((id, msg)) = parse_stream_entry(entry) {
                            messages.push((id, msg));
                        }
                    }
                }
            }
        }
    }

    Ok(messages)
}

/// Parse XAUTOCLAIM result.
fn parse_xautoclaim_result(value: redis::Value) -> Result<Vec<(String, QueueMessage)>> {
    let mut messages = Vec::new();

    if let redis::Value::Array(result) = value {
        if result.len() >= 2 {
            if let redis::Value::Array(entries) = &result[1] {
                for entry in entries {
                    if let Some((id, msg)) = parse_stream_entry(entry) {
                        messages.push((id, msg));
                    }
                }
            }
        }
    }

    Ok(messages)
}

/// Parse a single stream entry: [id, [field, val, field, val, ...]]
fn parse_stream_entry(entry: &redis::Value) -> Option<(String, QueueMessage)> {
    if let redis::Value::Array(entry_data) = entry {
        if entry_data.len() < 2 {
            return None;
        }

        let stream_id = match &entry_data[0] {
            redis::Value::BulkString(bytes) => String::from_utf8_lossy(bytes).to_string(),
            _ => return None,
        };

        let fields = extract_fields(&entry_data[1]);

        let delivery_id = fields.get("delivery_id")?.clone();
        let endpoint_id = fields.get("endpoint_id")?.clone();

        Some((
            stream_id.clone(),
            QueueMessage {
                delivery_id,
                endpoint_id,
                endpoint_url: fields.get("url").cloned().unwrap_or_default(),
                payload: fields.get("payload").cloned().unwrap_or_default(),
                custom_headers: fields
                    .get("headers")
                    .and_then(|s| serde_json::from_str(s).ok()),
                signing_secret: fields.get("signing_secret").cloned().unwrap_or_default(),
                trace_id: fields.get("trace_id").filter(|s| !s.is_empty()).cloned(),
                attempt_count: fields
                    .get("attempt")
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(0),
                max_attempts: fields
                    .get("max_attempts")
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(5),
                queue_item_id: fields.get("queue_item_id").cloned().unwrap_or_default(),
            },
        ))
    } else {
        None
    }
}

/// Extract field-value pairs from a Redis stream entry's field array.
fn extract_fields(value: &redis::Value) -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();

    if let redis::Value::Array(items) = value {
        let mut i = 0;
        while i + 1 < items.len() {
            let key = match &items[i] {
                redis::Value::BulkString(bytes) => String::from_utf8_lossy(bytes).to_string(),
                _ => {
                    i += 2;
                    continue;
                }
            };
            let val = match &items[i + 1] {
                redis::Value::BulkString(bytes) => String::from_utf8_lossy(bytes).to_string(),
                redis::Value::Int(n) => n.to_string(),
                redis::Value::Nil => String::new(),
                _ => {
                    i += 2;
                    continue;
                }
            };
            map.insert(key, val);
            i += 2;
        }
    }

    map
}
