use anyhow::Result;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::config::ClientConfig;
use rdkafka::message::Message;
use serde::{Deserialize, Serialize};
use tracing_subscriber::EnvFilter;

mod config;
mod delivery;
mod signing;

#[derive(Debug, Deserialize, Serialize)]
struct WebhookMessage {
    delivery_id: String,
    endpoint_id: String,
    endpoint_url: String,
    signing_secret: String,
    payload: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let cfg = config::WorkerConfig::from_env()?;
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()?;

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(10)
        .connect(&cfg.database_url)
        .await?;

    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", &cfg.kafka_brokers)
        .set("group.id", &cfg.consumer_group)
        .set("auto.offset.reset", "earliest")
        .set("enable.auto.commit", "true")
        .create()?;

    consumer.subscribe(&[&cfg.kafka_topic])?;

    tracing::info!("🔄 Hookrelay Worker started, listening on {}", cfg.kafka_brokers);

    loop {
        match consumer.recv().await {
            Ok(msg) => {
                if let Some(payload) = msg.payload_view::<str>().unwrap_or(None) {
                    match serde_json::from_str::<WebhookMessage>(payload) {
                        Ok(webhook) => {
                            tracing::info!("📥 Processing delivery {}", webhook.delivery_id);
                            if let Err(e) = delivery::process_delivery(&http_client, &cfg, &webhook, &pool).await {
                                tracing::error!("❌ Failed to process delivery {}: {:?}", webhook.delivery_id, e);
                            }
                        }
                        Err(e) => {
                            tracing::error!("❌ Failed to parse message: {:?}", e);
                        }
                    }
                }
            }
            Err(e) => {
                tracing::error!("❌ Kafka error: {:?}", e);
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        }
    }
}
