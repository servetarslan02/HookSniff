use anyhow::Result;
use rdkafka::config::ClientConfig;
use rdkafka::producer::{FutureProducer, FutureRecord};
use std::time::Duration;

pub fn create_producer(brokers: &str) -> Result<FutureProducer> {
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("message.timeout.ms", "5000")
        .set("queue.buffering.max.messages", "100000")
        .create()?;

    tracing::info!("✅ Kafka producer connected to {}", brokers);
    Ok(producer)
}

pub async fn publish_webhook(
    producer: &FutureProducer,
    topic: &str,
    delivery_id: &str,
    customer_id: &str,
    payload: &str,
) -> Result<()> {
    producer
        .send(
            FutureRecord::to(topic)
                .key(customer_id)
                .payload(payload),
            Duration::from_secs(5),
        )
        .await
        .map_err(|(e, _)| anyhow::anyhow!("Kafka send failed: {}", e))?;

    tracing::debug!("📤 Published webhook {} to Kafka", delivery_id);
    Ok(())
}
