//! Weekly digest email job — sends a summary of the past week's activity.
//!
//! Runs every Monday at 09:00 UTC. For each customer with email_on_weekly_digest = true:
//! 1. Queries delivery stats (last 7 days)
//! 2. Queries top endpoints, failure reasons
//! 3. Sends a summary email in the customer's preferred language

use anyhow::Result;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::resend_email::ResendEmailClient;

/// Run the weekly digest email job.
/// Called every Monday at 09:00 UTC by the main loop.
pub async fn run_weekly_digest(pool: &PgPool, email_client: &ResendEmailClient) -> Result<u64> {
    tracing::info!("📊 Running weekly digest job...");

    let mut emails_sent = 0u64;

    // Fetch customers who opted in to weekly digest
    let customers: Vec<(Uuid, String, String)> = sqlx::query_as(
        "SELECT c.id, c.email, COALESCE(c.language, 'en') as language \
         FROM notification_preferences np \
         JOIN customers c ON c.id = np.customer_id \
         WHERE np.email_on_weekly_digest = true \
         AND c.is_active = true \
         AND c.email_verified = true"
    )
    .fetch_all(pool)
    .await?;

    for (customer_id, email, language) in &customers {
        match generate_and_send_digest(pool, email_client, *customer_id, email, language).await {
            Ok(sent) => {
                if sent {
                    emails_sent += 1;
                    tracing::debug!("📧 Weekly digest sent to {}", email);
                }
            }
            Err(e) => {
                tracing::warn!("Failed to send weekly digest to {}: {:?}", email, e);
            }
        }
    }

    tracing::info!("✅ Weekly digest complete: {} emails sent", emails_sent);
    Ok(emails_sent)
}

/// Generate and send a weekly digest email for a single customer.
async fn generate_and_send_digest(
    pool: &PgPool,
    email_client: &ResendEmailClient,
    customer_id: Uuid,
    email: &str,
    language: &str,
) -> Result<bool> {
    // Get delivery stats for the past 7 days
    let stats: (i64, i64, i64, Option<f64>) = sqlx::query_as(
        "SELECT \
            COUNT(*) as total, \
            COUNT(*) FILTER (WHERE status = 'delivered') as success, \
            COUNT(*) FILTER (WHERE status IN ('failed', 'dead')) as failed, \
            AVG(duration_ms)::DOUBLE PRECISION as avg_latency \
         FROM deliveries \
         WHERE customer_id = $1 \
         AND created_at > NOW() - INTERVAL '7 days'"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    // Skip if no activity
    if stats.0 == 0 {
        return Ok(false);
    }

    let success_rate = if stats.0 > 0 {
        (stats.1 as f64 / stats.0 as f64) * 100.0
    } else {
        0.0
    };

    // Get active endpoints count
    let endpoint_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    // Get top 5 failing endpoints
    let failing_endpoints: Vec<(String, i64)> = sqlx::query_as(
        "SELECT e.url, COUNT(*) as failures \
         FROM deliveries d \
         JOIN endpoints e ON e.id = d.endpoint_id \
         WHERE d.customer_id = $1 \
         AND d.status IN ('failed', 'dead') \
         AND d.created_at > NOW() - INTERVAL '7 days' \
         GROUP BY e.url \
         ORDER BY failures DESC \
         LIMIT 5"
    )
    .bind(customer_id)
    .fetch_all(pool)
    .await?;

    // Get current plan
    let plan: String = sqlx::query_scalar(
        "SELECT plan FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    let avg_latency_ms = stats.3.unwrap_or(0.0);
    let is_tr = language == "tr";

    let (subject, html) = if is_tr {
        build_tr_digest(
            &plan, stats.0, stats.1, stats.2, success_rate, avg_latency_ms,
            endpoint_count, &failing_endpoints,
        )
    } else {
        build_en_digest(
            &plan, stats.0, stats.1, stats.2, success_rate, avg_latency_ms,
            endpoint_count, &failing_endpoints,
        )
    };

    email_client.send_contact_email(email, &subject, &html).await?;
    Ok(true)
}

fn build_tr_digest(
    plan: &str,
    total: i64,
    success: i64,
    failed: i64,
    success_rate: f64,
    avg_latency: f64,
    endpoints: i64,
    failing: &[(String, i64)],
) -> (String, String) {
    let subject = format!("📊 HookSniff Haftalık Özet — %{:.1} Başarı Oranı", success_rate);

    let failing_html = if failing.is_empty() {
        "<p style='color:#22c55e;'>✅ Hata yok — tüm endpoint'ler sağlıklı!</p>".to_string()
    } else {
        let rows: String = failing.iter().map(|(url, count)| {
            format!("<tr><td style='padding:6px 8px;border:1px solid #e5e7eb;font-size:13px;'>{}</td><td style='padding:6px 8px;border:1px solid #e5e7eb;color:#dc2626;text-align:center;'>{}</td></tr>", url, count)
        }).collect();
        format!(
            "<table style='width:100%;border-collapse:collapse;'><tr style='background:#f9fafb;'><th style='padding:6px 8px;border:1px solid #e5e7eb;text-align:left;font-size:12px;'>Endpoint</th><th style='padding:6px 8px;border:1px solid #e5e7eb;font-size:12px;'>Hata</th></tr>{}</table>",
            rows
        )
    };

    let rate_color = if success_rate >= 99.0 { "#22c55e" } else if success_rate >= 95.0 { "#f59e0b" } else { "#dc2626" };

    let html = format!(
        r#"<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
        <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:20px;margin:0;">📊 Haftalık Özet</h1>
            <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">{} planı • Son 7 gün</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:{};">%{:.1}</div>
                <div style="font-size:12px;color:#6b7280;">Başarı Oranı</div>
            </div>
            <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#3b82f6;">{}</div>
                <div style="font-size:12px;color:#6b7280;">Toplam Teslimat</div>
            </div>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#f59e0b;">{:.0}ms</div>
                <div style="font-size:12px;color:#6b7280;">Ort. Gecikme</div>
            </div>
            <div style="background:#f3e8ff;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#8b5cf6;">{}</div>
                <div style="font-size:12px;color:#6b7280;">Aktif Endpoint</div>
            </div>
        </div>
        <div style="margin-bottom:16px;">
            <div style="font-size:13px;color:#6b7280;margin-bottom:4px;">✅ Başarılı: {} &nbsp;|&nbsp; ❌ Başarısız: {}</div>
        </div>
        {}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
            <a href="https://hooksniff.vercel.app/core" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">Dashboard'a Git</a>
        </div>
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">Bu email'i almak istemiyorsanız Ayarlar → Bildirim tercihlerinden kapatabilirsiniz.</p>
        </div>"#,
        plan, rate_color, success_rate, total, avg_latency, endpoints, success, failed, failing_html
    );

    (subject, html)
}

fn build_en_digest(
    plan: &str,
    total: i64,
    success: i64,
    failed: i64,
    success_rate: f64,
    avg_latency: f64,
    endpoints: i64,
    failing: &[(String, i64)],
) -> (String, String) {
    let subject = format!("📊 HookSniff Weekly Digest — {:.1}% Success Rate", success_rate);

    let failing_html = if failing.is_empty() {
        "<p style='color:#22c55e;'>✅ No failures — all endpoints healthy!</p>".to_string()
    } else {
        let rows: String = failing.iter().map(|(url, count)| {
            format!("<tr><td style='padding:6px 8px;border:1px solid #e5e7eb;font-size:13px;'>{}</td><td style='padding:6px 8px;border:1px solid #e5e7eb;color:#dc2626;text-align:center;'>{}</td></tr>", url, count)
        }).collect();
        format!(
            "<table style='width:100%;border-collapse:collapse;'><tr style='background:#f9fafb;'><th style='padding:6px 8px;border:1px solid #e5e7eb;text-align:left;font-size:12px;'>Endpoint</th><th style='padding:6px 8px;border:1px solid #e5e7eb;font-size:12px;'>Failures</th></tr>{}</table>",
            rows
        )
    };

    let rate_color = if success_rate >= 99.0 { "#22c55e" } else if success_rate >= 95.0 { "#f59e0b" } else { "#dc2626" };

    let html = format!(
        r#"<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
        <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:20px;margin:0;">📊 Weekly Digest</h1>
            <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">{} plan • Last 7 days</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:{};">{:.1}%</div>
                <div style="font-size:12px;color:#6b7280;">Success Rate</div>
            </div>
            <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#3b82f6;">{}</div>
                <div style="font-size:12px;color:#6b7280;">Total Deliveries</div>
            </div>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#f59e0b;">{:.0}ms</div>
                <div style="font-size:12px;color:#6b7280;">Avg Latency</div>
            </div>
            <div style="background:#f3e8ff;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#8b5cf6;">{}</div>
                <div style="font-size:12px;color:#6b7280;">Active Endpoints</div>
            </div>
        </div>
        <div style="margin-bottom:16px;">
            <div style="font-size:13px;color:#6b7280;margin-bottom:4px;">✅ Success: {} &nbsp;|&nbsp; ❌ Failed: {}</div>
        </div>
        {}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
            <a href="https://hooksniff.vercel.app/core" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">Go to Dashboard</a>
        </div>
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">Don't want these emails? Turn them off in Settings → Notification preferences.</p>
        </div>"#,
        plan, rate_color, success_rate, total, avg_latency, endpoints, success, failed, failing_html
    );

    (subject, html)
}
