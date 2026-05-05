use anyhow::Result;

#[derive(Debug, Clone)]
pub struct WorkerConfig {
    pub kafka_brokers: String,
    pub kafka_topic: String,
    pub consumer_group: String,
    pub database_url: String,
    pub max_attempts: i32,
    pub retry_delays_secs: Vec<u64>,
}

impl WorkerConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Self {
            kafka_brokers: std::env::var("KAFKA_BROKERS")
                .unwrap_or_else(|_| "localhost:9092".into()),
            kafka_topic: std::env::var("KAFKA_TOPIC")
                .unwrap_or_else(|_| "webhook-deliveries".into()),
            consumer_group: std::env::var("KAFKA_CONSUMER_GROUP")
                .unwrap_or_else(|_| "hookrelay-worker".into()),
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://root@localhost:26257/hookrelay?sslmode=disable".into()),
            max_attempts: std::env::var("MAX_ATTEMPTS")
                .unwrap_or_else(|_| "3".into())
                .parse()?,
            retry_delays_secs: vec![30, 300, 1800], // 30s, 5min, 30min
        })
    }
}
