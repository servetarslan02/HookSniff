//! Background Job Spawning
//!
//! All periodic background jobs are spawned here.
//! Uses distributed locks (via Redis) to prevent duplicate work
//! in multi-instance deployments.

use chrono::Datelike;
use sqlx::PgPool;

use crate::config;
use crate::email::EmailProvider;
use crate::jobs;
use crate::notifications::FcmClient;

/// Spawn all background jobs.
///
/// Each job runs in its own tokio task. Jobs that should run on only one
/// instance use Redis-based distributed locks via `JobQueue::try_acquire_lock`.
pub fn spawn_background_jobs(
    pool: PgPool,
    job_queue: Option<jobs::job_queue::JobQueue>,
    email_provider: EmailProvider,
    fcm_client: Option<FcmClient>,
    retention_days: i64,
) {
    // Job queue worker (processes email + notification jobs from Redis)
    if let Some(ref queue) = job_queue {
        let worker_queue = queue.clone();
        let worker_email = email_provider.clone();
        let worker_fcm = fcm_client.clone();
        let worker_pool = pool.clone();
        tokio::spawn(async move {
            worker_queue
                .process_jobs(worker_email, worker_fcm, worker_pool)
                .await;
        });

        // Delayed job processor (moves ready delayed jobs to main queue)
        let _delayed_queue = queue.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                if let Some(ref url) = config::resolve_redis_url() {
                    if let Ok(client) = redis::Client::open(url.as_str()) {
                        if let Ok(mut conn) = redis::aio::ConnectionManager::new(client).await {
                            if let Err(e) = jobs::job_queue::process_delayed_jobs(&mut conn).await {
                                tracing::warn!("Delayed job processor error: {:?}", e);
                            }
                        }
                    }
                }
            }
        });

        tracing::info!("✅ Redis job queue worker started");
    }

    // ── Retention cleanup (daily, distributed lock) ─────────────
    let sched_pool = pool.clone();
    let sched_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            let should_run = if let Some(ref queue) = sched_queue {
                queue.try_acquire_lock("retention", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Err(e) = jobs::retention::run_retention(&sched_pool, retention_days).await {
                    tracing::error!("❌ Retention job failed: {:?}", e);
                }
            }
        }
    });

    // ── Monthly webhook count reset (daily check, distributed lock) ──
    let reset_pool = pool.clone();
    let reset_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            let should_run = if let Some(ref queue) = reset_queue {
                queue.try_acquire_lock("monthly_reset", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Err(e) = jobs::retention::reset_monthly_webhook_counts(&reset_pool).await {
                    tracing::error!("❌ Monthly count reset failed: {:?}", e);
                }
            }
        }
    });

    // ── Compliance audit (daily, distributed lock) ──
    let compliance_pool = pool.clone();
    let compliance_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(6 * 60 * 60)).await; // Every 6 hours
            let should_run = if let Some(ref queue) = compliance_queue {
                queue.try_acquire_lock("compliance_audit", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                let results = crate::security::compliance::run_compliance_checks(&compliance_pool).await;
                let failed: Vec<_> = results.iter().filter(|r| !r.passed).collect();
                if !failed.is_empty() {
                    tracing::warn!(
                        failed_count = failed.len(),
                        "⚠️ Compliance audit found issues: {}",
                        failed.iter().map(|r| format!("{}: {}", r.check_name, r.details)).collect::<Vec<_>>().join("; ")
                    );
                } else {
                    tracing::info!("✅ Compliance audit: all checks passed");
                }
            }
        }
    });

    // ── Daily webhook count reset (every 24 hours) ──────────────
    let daily_reset_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            if let Err(e) = jobs::retention::reset_daily_webhook_counts(&daily_reset_pool).await {
                tracing::error!("❌ Daily count reset failed: {:?}", e);
            }
        }
    });

    // ── Cleanup: seen_webhooks + idempotency_keys + revoked_tokens (every 6h) ──
    let cleanup_pool = pool.clone();
    let cleanup_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(6 * 60 * 60)).await;
            let should_run = if let Some(ref queue) = cleanup_queue {
                queue.try_acquire_lock("cleanup_6h", 1800).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                // Clean expired seen_webhooks
                match sqlx::query("DELETE FROM seen_webhooks WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired seen_webhooks", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ seen_webhooks cleanup failed: {:?}", e),
                }
                // Clean expired idempotency_keys
                match sqlx::query("DELETE FROM idempotency_keys WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired idempotency_keys", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ idempotency_keys cleanup failed: {:?}", e),
                }
                // Clean expired revoked_tokens
                match sqlx::query("DELETE FROM revoked_tokens WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired revoked_tokens", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ revoked_tokens cleanup failed: {:?}", e),
                }
            }
        }
    });

    // ── Metrics push to Grafana Cloud (every 60s) ───────────────
    let metrics_pool = pool.clone();
    tokio::spawn(async move {
        jobs::metrics_push::run(metrics_pool).await;
    });

    // ── Dunning: payment reminders + retries (daily) ────────────
    let dunning_pool = pool.clone();
    let dunning_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            let should_run = if let Some(ref queue) = dunning_queue {
                queue.try_acquire_lock("dunning", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Some(email_client) = crate::resend_email::ResendEmailClient::from_env_or_db(&dunning_pool).await {
                    match jobs::dunning::run_dunning(&dunning_pool, &email_client).await {
                        Ok(sent) => {
                            if sent > 0 {
                                tracing::info!("📧 Dunning: {} payment reminder emails sent", sent);
                            }
                        }
                        Err(e) => tracing::error!("❌ Dunning job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, dunning emails skipped");
                }

                match jobs::dunning::retry_failed_payments(&dunning_pool).await {
                    Ok(retried) => {
                        if retried > 0 {
                            tracing::info!("🔄 Payment retry: {} retries attempted", retried);
                        }
                    }
                    Err(e) => tracing::error!("❌ Payment retry job failed: {:?}", e),
                }

                match jobs::dunning::activate_paused_subscriptions(&dunning_pool).await {
                    Ok(count) => {
                        if count > 0 {
                            tracing::info!("⏸️ Activated pause for {} subscriptions", count);
                        }
                    }
                    Err(e) => tracing::error!("❌ Pause activation job failed: {:?}", e),
                }

                match jobs::dunning::expire_paused_subscriptions(&dunning_pool).await {
                    Ok(count) => {
                        if count > 0 {
                            tracing::info!("⏰ Expired {} paused subscriptions", count);
                        }
                    }
                    Err(e) => tracing::error!("❌ Pause expiry job failed: {:?}", e),
                }
            }
        }
    });

    // ── Alert evaluation (every 5 minutes) ──────────────────────
    let alert_pool = pool.clone();
    let alert_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(5 * 60)).await;
            let should_run = if let Some(ref queue) = alert_queue {
                queue.try_acquire_lock("alert_eval", 300).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Some(email_client) = crate::resend_email::ResendEmailClient::from_env_or_db(&alert_pool).await {
                    match jobs::alert_eval::run_alert_evaluation(&alert_pool, &email_client).await {
                        Ok(triggered) => {
                            if triggered > 0 {
                                tracing::info!("🚨 Alert eval: {} alerts triggered", triggered);
                            }
                        }
                        Err(e) => tracing::error!("❌ Alert evaluation job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, alert emails skipped");
                }
            }
        }
    });

    // ── Overage invoicing (daily check, 1st of month) ───────────
    let overage_pool = pool.clone();
    let overage_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            let should_run = if let Some(ref queue) = overage_queue {
                queue.try_acquire_lock("overage_invoicing", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Some(email_client) = crate::resend_email::ResendEmailClient::from_env_or_db(&overage_pool).await {
                    match jobs::overage_invoicing::run_overage_invoicing(&overage_pool, &email_client).await {
                        Ok(created) => {
                            if created > 0 {
                                tracing::info!("💰 Overage invoicing: {} invoices created", created);
                            }
                        }
                        Err(e) => tracing::error!("❌ Overage invoicing job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, overage invoice emails skipped");
                }
            }
        }
    });

    // ── Weekly digest (Monday 09:00 UTC) ────────────────────────
    let digest_pool = pool.clone();
    let digest_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            let now = chrono::Utc::now();
            let next_monday = {
                let weekday = now.date_naive().weekday().num_days_from_monday(); // 0=Mon, 6=Sun
                let days_until_monday = if weekday == 0 { 0 } else { 7 - weekday };
                let target = if days_until_monday == 0
                    && now.time() >= chrono::NaiveTime::from_hms_opt(9, 0, 0).unwrap()
                {
                    now.date_naive() + chrono::Days::new(7)
                } else {
                    now.date_naive() + chrono::Days::new(days_until_monday as u64)
                };
                target.and_hms_opt(9, 0, 0).unwrap()
            };
            let sleep_secs = (next_monday - now.naive_utc()).num_seconds().max(60) as u64;
            tokio::time::sleep(std::time::Duration::from_secs(sleep_secs)).await;

            let should_run = if let Some(ref queue) = digest_queue {
                queue.try_acquire_lock("weekly_digest", 3600).await.unwrap_or(true)
            } else {
                true
            };
            if should_run {
                if let Some(email_client) = crate::resend_email::ResendEmailClient::from_env_or_db(&digest_pool).await {
                    match jobs::weekly_digest::run_weekly_digest(&digest_pool, &email_client).await {
                        Ok(sent) => {
                            tracing::info!("📊 Weekly digest: {} emails sent", sent);
                        }
                        Err(e) => tracing::error!("❌ Weekly digest job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, weekly digest emails skipped");
                }
            }
        }
    });
}
