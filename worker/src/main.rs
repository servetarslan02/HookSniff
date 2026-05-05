use anyhow::Result;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::config::ClientConfig;
use rdkafka::message::Message;
use rdkafka::producer::FutureProducer;
use serde::{Deserialize, Serialize};
use tracing_subscriber::EnvFilter;

pub(crate) mod activities;
pub(crate) mod config;
pub mod delivery;
pub mod fanout;
pub(crate) mod retry_scheduler;
pub(crate) mod signing;
pub(crate) mod workflows;

use activities::HookRelayActivities;
use workflows::{RetryPolicy, WebhookDeliveryInput, WebhookDeliveryWorkflow};

/// Message format coming from the Kafka topic.
#[derive(Debug, Deserialize, Serialize)]
pub struct WebhookMessage {
    delivery_id: String,
    endpoint_id: String,
    endpoint_url: String,
    signing_secret: String,
    old_signing_secret: Option<String>,
    secret_rotated_at: Option<String>,
    custom_headers: Option<serde_json::Value>,
    payload: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let cfg = config::WorkerConfig::from_env()?;

    // -----------------------------------------------------------------------
    // Database pool (shared between activities and retry scheduler)
    // -----------------------------------------------------------------------
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(10)
        .connect(&cfg.database_url)
        .await?;

    // -----------------------------------------------------------------------
    // HTTP client (shared with activities)
    // -----------------------------------------------------------------------
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()?;

    // -----------------------------------------------------------------------
    // Kafka consumer — receives new webhook delivery messages
    // -----------------------------------------------------------------------
    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", &cfg.kafka_brokers)
        .set("group.id", &cfg.consumer_group)
        .set("auto.offset.reset", "earliest")
        .set("enable.auto.commit", "true")
        .create()?;

    consumer.subscribe(&[&cfg.kafka_topic])?;

    // -----------------------------------------------------------------------
    // Kafka producer — for retry scheduler (backward compat)
    // -----------------------------------------------------------------------
    let retry_producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &cfg.kafka_brokers)
        .set("message.timeout.ms", "5000")
        .set("queue.buffering.max.messages", "100000")
        .create()?;

    // -----------------------------------------------------------------------
    // Spawn retry scheduler as a background task (backward compat)
    // -----------------------------------------------------------------------
    let retry_pool = pool.clone();
    let retry_cfg = cfg.clone();
    tokio::spawn(async move {
        retry_scheduler::run_retry_scheduler(retry_pool, retry_producer, retry_cfg).await;
    });

    // -----------------------------------------------------------------------
    // Temporal Worker
    //
    // The Temporal worker polls the task queue for workflow and activity tasks.
    // It runs in the background alongside the Kafka consumer.
    //
    // Architecture:
    //   Kafka consumer → receives webhook messages → starts Temporal workflow
    //   Temporal worker → executes activities (HTTP delivery, DB updates, Kafka)
    // -----------------------------------------------------------------------
    tracing::info!("🔧 Initializing Temporal worker at {}", cfg.temporal_url);

    // Create a shared Kafka producer for activities (used by publish_to_kafka)
    let shared_kafka_producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &cfg.kafka_brokers)
        .set("message.timeout.ms", "5000")
        .set("queue.buffering.max.messages", "100000")
        .create()?;

    let temporal_handle = {
        let cfg_clone = cfg.clone();
        let pool_clone = pool.clone();
        let http_client_clone = http_client.clone();

        tokio::spawn(async move {
            if let Err(e) = run_temporal_worker(cfg_clone, pool_clone, http_client_clone, Some(shared_kafka_producer)).await {
                tracing::error!("❌ Temporal worker failed: {:?}", e);
            }
        })
    };

    tracing::info!(
        "🔄 HookRelay Worker started — Kafka: {} | Temporal: {} (queue: {})",
        cfg.kafka_brokers,
        cfg.temporal_url,
        cfg.temporal_task_queue
    );

    // -----------------------------------------------------------------------
    // Main Kafka consumer loop
    //
    // Instead of processing webhooks directly (the old approach), we now
    // start a Temporal workflow for each incoming message. The workflow
    // handles delivery, retries, backoff, and dead-letter logic.
    // -----------------------------------------------------------------------
    loop {
        match consumer.recv().await {
            Ok(msg) => {
                if let Some(payload) = msg.payload_view::<str>().unwrap_or(None) {
                    match serde_json::from_str::<WebhookMessage>(payload) {
                        Ok(webhook) => {
                            tracing::info!("📥 Received delivery {}", webhook.delivery_id);

                            match start_delivery_workflow(&cfg, &pool, &webhook).await {
                                Ok(workflow_id) => {
                                    tracing::info!(
                                        "🚀 Started workflow {} for delivery {}",
                                        workflow_id,
                                        webhook.delivery_id
                                    );
                                }
                                Err(e) => {
                                    tracing::error!(
                                        "❌ Failed to start workflow for delivery {}: {:?}",
                                        webhook.delivery_id,
                                        e
                                    );
                                }
                            }
                        }
                        Err(e) => {
                            tracing::error!("❌ Failed to parse Kafka message: {:?}", e);
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

/// Run the Temporal worker — registers workflows and activities, then
/// polls the task queue indefinitely.
///
/// This runs as a background tokio task. The worker is the bridge between
/// the Temporal server and our Rust activity implementations. When the
/// server dispatches a workflow task, the worker replays the workflow
/// deterministically. When it dispatches an activity task, the worker
/// executes the corresponding Rust function.
async fn run_temporal_worker(
    cfg: config::WorkerConfig,
    pool: sqlx::PgPool,
    http_client: reqwest::Client,
    kafka_producer: Option<FutureProducer>,
) -> Result<()> {
    // Set the Temporal address for the SDK's envconfig loader.
    // The SDK reads TEMPORAL_ADDRESS or falls back to localhost:7233.
    std::env::set_var("TEMPORAL_ADDRESS", &cfg.temporal_url);

    // Initialize the Core runtime — this manages the gRPC connection
    // to the Temporal server and internal event loops.
    let runtime = temporalio_sdk_core::CoreRuntime::new_assume_tokio(
        temporalio_sdk_core::RuntimeOptions::builder().build()?,
    )?;

    // Load connection options from env/config (TEMPORAL_ADDRESS, etc.)
    let (conn_options, client_options) = temporalio_client::ClientOptions::load_from_config(
        temporalio_client::envconfig::LoadClientConfigProfileOptions::default(),
    )?;

    let connection = temporalio_client::Connection::connect(conn_options).await?;
    let client = temporalio_client::Client::new(connection, client_options);

    // Build the activities instance with shared state
    let activities = HookRelayActivities {
        http_client,
        pool,
        kafka_producer,
    };

    // Configure the worker:
    // - Task queue: where workflows and activities are dispatched
    // - Activities: the HTTP delivery, DB recording, dead-letter, Kafka publish
    // - Workflows: the WebhookDeliveryWorkflow
    let worker_options = temporalio_sdk::WorkerOptions::new(&cfg.temporal_task_queue)
        .register_activities(activities)
        .register_workflow::<WebhookDeliveryWorkflow>()
        .build();

    let worker = temporalio_sdk::Worker::new(&runtime, client, worker_options)?;

    tracing::info!(
        "⚙️ Temporal worker running on task queue '{}'",
        cfg.temporal_task_queue
    );

    // Run the worker — this blocks until the worker is shut down.
    // It polls the task queue and executes workflows/activities.
    worker.run().await?;

    Ok(())
}

/// Start a Temporal workflow for a webhook delivery.
///
/// Constructs the workflow input from the Kafka message and endpoint
/// configuration, then signals the Temporal server to begin execution.
///
/// The workflow ID is derived from the delivery ID to ensure idempotency —
/// if the same Kafka message is processed twice (e.g., after a restart),
/// the second attempt will be a no-op because the workflow already exists.
async fn start_delivery_workflow(
    cfg: &config::WorkerConfig,
    pool: &sqlx::PgPool,
    webhook: &WebhookMessage,
) -> Result<String> {
    // Fetch the retry policy from the endpoint configuration
    let endpoint_info: (Option<serde_json::Value>,) =
        sqlx::query_as("SELECT retry_policy FROM endpoints WHERE id = $1")
            .bind(&webhook.endpoint_id)
            .fetch_one(pool)
            .await?;

    let retry_policy = endpoint_info
        .0
        .as_ref()
        .and_then(|v| serde_json::from_value::<RetryPolicy>(v.clone()).ok())
        .unwrap_or_default();

    let workflow_input = WebhookDeliveryInput {
        delivery_id: webhook.delivery_id.clone(),
        endpoint_id: webhook.endpoint_id.clone(),
        endpoint_url: webhook.endpoint_url.clone(),
        signing_secret: webhook.signing_secret.clone(),
        payload: webhook.payload.clone(),
        custom_headers: webhook.custom_headers.clone(),
        retry_policy,
    };

    // Build a Temporal client to start the workflow.
    // We create a separate client for starting workflows (the worker has its own).
    let runtime = temporalio_sdk_core::CoreRuntime::new_assume_tokio(
        temporalio_sdk_core::RuntimeOptions::builder().build()?,
    )?;

    std::env::set_var("TEMPORAL_ADDRESS", &cfg.temporal_url);

    let (conn_options, client_options) = temporalio_client::ClientOptions::load_from_config(
        temporalio_client::envconfig::LoadClientConfigProfileOptions::default(),
    )?;

    let connection = temporalio_client::Connection::connect(conn_options).await?;
    let client = temporalio_client::Client::new(connection, client_options);

    // Use the delivery ID as the workflow ID for idempotency.
    // If this workflow already exists (e.g., Kafka redelivery), Temporal
    // will reject the start request gracefully.
    let workflow_id = format!("webhook-delivery-{}", webhook.delivery_id);

    match client
        .start_workflow(
            workflow_input,
            cfg.temporal_task_queue.clone(),
            workflow_id.clone(),
            "WebhookDeliveryWorkflow".to_string(),
            None, // use default workflow options
        )
        .await
    {
        Ok(_) => Ok(workflow_id),
        Err(e) => {
            let err_str = e.to_string();
            if err_str.contains("ALREADY_EXISTS") || err_str.contains("already started") {
                // Workflow already running — this is fine, Kafka redelivered
                tracing::debug!(
                    "Workflow {} already exists, skipping (Kafka redelivery)",
                    workflow_id
                );
                Ok(workflow_id)
            } else {
                Err(anyhow::anyhow!("Failed to start workflow: {}", e))
            }
        }
    }
}
