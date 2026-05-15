use anyhow::Result;
use redis::aio::ConnectionManager;
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Background job types that can be enqueued to Redis.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Job {
    /// Send an email (welcome, verification, password reset, etc.)
    Email {
        to: String,
        template: EmailTemplate,
        language: String,
    },
    /// Send a push notification via FCM
    Notification {
        customer_id: String,
        token: String,
        title: String,
        body: String,
        data: Option<serde_json::Value>,
    },
    /// Scheduled cleanup — only one instance should run at a time
    ScheduledCleanup {
        task: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmailTemplate {
    Welcome { name: Option<String> },
    Verification { verify_url: String },
    PasswordReset { reset_url: String },
    Invoice {
        invoice_number: String,
        amount: String,
        plan_name: String,
        period_start: String,
        period_end: String,
        payment_url: Option<String>,
    },
    WebhookSuccess { endpoint_name: String },
}

/// Redis-backed job queue.
///
/// Uses Redis lists (LPUSH/BRPOP) for reliable job delivery.
/// Scheduled jobs use distributed locks to prevent duplicate execution
/// across multiple API instances.
#[derive(Clone)]
pub struct JobQueue {
    conn: ConnectionManager,
}

impl JobQueue {
    /// Create a new job queue connected to Redis.
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let conn = ConnectionManager::new(client).await?;
        tracing::info!("✅ Redis job queue connected");
        Ok(Self { conn })
    }

    /// Enqueue a job for background processing.
    pub async fn enqueue(&self, job: &Job) -> Result<()> {
        let mut conn = self.conn.clone();
        let payload = serde_json::to_string(job)?;
        let _: () = redis::cmd("LPUSH")
            .arg("hooksniff:jobs")
            .arg(&payload)
            .query_async(&mut conn)
            .await?;
        tracing::debug!("📥 Job enqueued");
        Ok(())
    }

    /// Try to acquire a distributed lock for a scheduled task.
    /// Returns true if lock acquired (caller should run the task).
    /// Uses SET NX EX for atomic lock acquisition.
    pub async fn try_acquire_lock(&self, task: &str, ttl_secs: u64) -> Result<bool> {
        let mut conn = self.conn.clone();
        let key = format!("hooksniff:lock:{task}");
        let result: Option<String> = redis::cmd("SET")
            .arg(&key)
            .arg("1")
            .arg("NX")
            .arg("EX")
            .arg(ttl_secs)
            .query_async(&mut conn)
            .await?;
        Ok(result.is_some())
    }

    /// Process jobs from the queue in a loop.
    /// This function never returns — it blocks on BRPOP and processes jobs.
    pub async fn process_jobs(
        self,
        email_provider: crate::email::EmailProvider,
        fcm: Option<crate::notifications::FcmClient>,
        pool: sqlx::PgPool,
    ) {
        tracing::info!("🔄 Job queue worker started");
        loop {
            match self.poll_one_job(&email_provider, fcm.as_ref(), &pool).await {
                Ok(()) => {}
                Err(e) => {
                    tracing::error!("❌ Job processing error: {:?}", e);
                    // Brief pause before retrying to avoid tight error loops
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            }
        }
    }

    /// Poll and process a single job. Blocks up to 5 seconds waiting for a job.
    async fn poll_one_job(
        &self,
        email_provider: &crate::email::EmailProvider,
        fcm: Option<&crate::notifications::FcmClient>,
        pool: &sqlx::PgPool,
    ) -> Result<()> {
        let mut conn = self.conn.clone();

        // BRPOP blocks until a job arrives (or timeout)
        let result: Option<(String, String)> = redis::cmd("BRPOP")
            .arg("hooksniff:jobs")
            .arg(5) // 5 second timeout
            .query_async(&mut conn)
            .await?;

        let (_key, payload) = match result {
            Some(r) => r,
            None => return Ok(()), // Timeout, no job — loop again
        };

        let job: Job = serde_json::from_str(&payload)?;
        self.execute_job(job, email_provider, fcm, pool).await
    }

    /// Execute a single job with retry logic.
    async fn execute_job(
        &self,
        job: Job,
        email_provider: &crate::email::EmailProvider,
        fcm: Option<&crate::notifications::FcmClient>,
        pool: &sqlx::PgPool,
    ) -> Result<()> {
        match &job {
            Job::Email { to, template, language } => {
                let lang = match language.as_str() {
                    "en" => crate::email::Language::En,
                    _ => crate::email::Language::Tr,
                };
                let result = match template {
                    EmailTemplate::Welcome { name } => {
                        email_provider.send_welcome_email(to, name.as_deref(), lang).await
                    }
                    EmailTemplate::Verification { verify_url } => {
                        email_provider.send_verification_email(to, verify_url, lang).await
                    }
                    EmailTemplate::PasswordReset { reset_url } => {
                        email_provider.send_password_reset_email(to, reset_url, lang).await
                    }
                    EmailTemplate::Invoice { invoice_number, amount, plan_name, period_start, period_end, payment_url } => {
                        email_provider.send_invoice_email(to, invoice_number, amount, plan_name, period_start, period_end, payment_url.as_deref(), lang).await
                    }
                    EmailTemplate::WebhookSuccess { endpoint_name } => {
                        email_provider.send_webhook_success_email(to, endpoint_name, lang).await
                    }
                };
                if let Err(e) = result {
                    tracing::warn!("📧 Email send failed to {}: {:?}", to, e);
                    // Re-enqueue with retry (max 3 attempts)
                    self.maybe_retry(&job, 3).await?;
                } else {
                    tracing::info!("📧 Email sent to {}: {:?}", to, template);
                }
            }
            Job::Notification { customer_id, token, title, body, data } => {
                // FCM notification
                if let Some(fcm) = fcm {
                    match fcm.send(token, title, body, data.clone()).await {
                        Ok(()) => {
                            // Update last_used_at
                            let cid: sqlx::types::Uuid = customer_id.parse().unwrap_or_default();
                            let _ = sqlx::query(
                                "UPDATE device_tokens SET last_used_at = NOW() WHERE customer_id = $1 AND token = $2",
                            )
                            .bind(cid)
                            .bind(token)
                            .execute(pool)
                            .await;
                        }
                        Err(e) => {
                            tracing::warn!("🔔 Notification failed for {}: {:?}", customer_id, e);
                        }
                    }
                } else {
                    tracing::warn!("🔔 FCM not configured, skipping notification for {}", customer_id);
                }
            }
            Job::ScheduledCleanup { task } => {
                // This shouldn't be enqueued — scheduled tasks use try_acquire_lock directly
                tracing::warn!("⚠️ ScheduledCleanup job found in queue (should use lock): {}", task);
            }
        }
        Ok(())
    }

    /// Re-enqueue a failed job if retries remain.
    /// Uses a Redis hash to track retry counts.
    async fn maybe_retry(&self, job: &Job, max_retries: u32) -> Result<()> {
        let mut conn = self.conn.clone();
        let job_id = format!("{:?}", std::mem::discriminant(job));
        let retry_key = format!("hooksniff:retries:{job_id}");

        let count: u32 = redis::cmd("INCR")
            .arg(&retry_key)
            .query_async(&mut conn)
            .await?;

        if count >= max_retries {
            // Max retries reached, drop the job
            let _: () = redis::cmd("DEL")
                .arg(&retry_key)
                .query_async(&mut conn)
                .await?;
            tracing::error!("❌ Job dropped after {} retries: {:?}", max_retries, job);
            return Ok(());
        }

        // Exponential backoff: 2^count seconds
        let delay = 2u64.pow(count);
        let payload = serde_json::to_string(job)?;

        // Use a delayed enqueue: store in a sorted set with score = execute_at timestamp
        let execute_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs()
            + delay;

        let _: () = redis::cmd("ZADD")
            .arg("hooksniff:jobs:delayed")
            .arg(execute_at)
            .arg(&payload)
            .query_async(&mut conn)
            .await?;

        // Set TTL on retry counter (1 hour)
        let _: () = redis::cmd("EXPIRE")
            .arg(&retry_key)
            .arg(3600)
            .query_async(&mut conn)
            .await?;

        tracing::info!("🔄 Job scheduled for retry in {}s (attempt {})", delay, count);
        Ok(())
    }
}

/// Process delayed jobs that are now ready.
/// Call this periodically (e.g., every 5 seconds) from the worker.
pub async fn process_delayed_jobs(conn: &mut ConnectionManager) -> Result<()> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)?
        .as_secs();

    // Get all delayed jobs that are ready (score <= now)
    let jobs: Vec<String> = redis::cmd("ZRANGEBYSCORE")
        .arg("hooksniff:jobs:delayed")
        .arg(0)
        .arg(now)
        .query_async(conn)
        .await?;

    for job_payload in jobs {
        // Move from delayed set to main queue
        let _: () = redis::cmd("LPUSH")
            .arg("hooksniff:jobs")
            .arg(&job_payload)
            .query_async(conn)
            .await?;

        // Remove from delayed set
        let _: () = redis::cmd("ZREM")
            .arg("hooksniff:jobs:delayed")
            .arg(&job_payload)
            .query_async(conn)
            .await?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn job_serialization_roundtrip() {
        let job = Job::Email {
            to: "test@example.com".to_string(),
            template: EmailTemplate::Welcome {
                name: Some("Servet".to_string()),
            },
            language: "tr".to_string(),
        };
        let json = serde_json::to_string(&job).unwrap();
        let deserialized: Job = serde_json::from_str(&json).unwrap();
        match deserialized {
            Job::Email { to, .. } => assert_eq!(to, "test@example.com"),
            _ => panic!("Wrong variant"),
        }
    }

    #[test]
    fn email_template_serialization() {
        let templates = vec![
            EmailTemplate::Welcome { name: None },
            EmailTemplate::Verification {
                verify_url: "https://hooksniff.dev/verify?token=abc".to_string(),
            },
            EmailTemplate::PasswordReset {
                reset_url: "https://hooksniff.dev/reset?token=xyz".to_string(),
            },
        ];
        for template in templates {
            let json = serde_json::to_string(&template).unwrap();
            let _: EmailTemplate = serde_json::from_str(&json).unwrap();
        }
    }
}
