//! Daily event usage tracking and overage email notifications.

use sqlx::PgPool;


use crate::billing::Plan;
use crate::email::EmailProvider;
use crate::models::customer::Customer;

/// Track daily event usage and return whether the customer is over their limit.
/// Also sends email notifications when approaching or exceeding limits.
pub async fn track_daily_event(
    pool: &PgPool,
    customer: &Customer,
    email_client: Option<&EmailProvider>,
) -> Result<bool, sqlx::Error> {
    let plan = Plan::parse_str(&customer.plan);
    let daily_limit = plan.max_events_per_day();

    // Upsert daily counter
    let row: (i64, i64,) = sqlx::query_as(
        "INSERT INTO daily_event_usage (customer_id, event_date, event_count, overage_count) \
         VALUES ($1, CURRENT_DATE, 1, 0) \
         ON CONFLICT (customer_id, event_date) DO UPDATE SET \
         event_count = daily_event_usage.event_count + 1, \
         overage_count = CASE \
             WHEN daily_event_usage.event_count >= $2 THEN daily_event_usage.overage_count + 1 \
             ELSE daily_event_usage.overage_count \
         END \
         RETURNING event_count, overage_count",
    )
    .bind(customer.id)
    .bind(daily_limit as i64)
    .fetch_one(pool)
    .await?;

    let (current_count, overage_count) = row;
    let is_over_limit = current_count > daily_limit as i64;

    // Email notification logic
    if customer.overage_email_notification {
        let threshold_80 = (daily_limit as f64 * 0.8) as i64;
        let threshold_100 = daily_limit as i64;

        if current_count == threshold_80 {
            // Approaching limit — 80%
            let _ = send_limit_notification(
                pool,
                customer,
                email_client,
                "approaching",
                current_count,
                daily_limit,
            )
            .await;
        } else if current_count == threshold_100 {
            // At limit — 100%
            let _ = send_limit_notification(
                pool,
                customer,
                email_client,
                "at_limit",
                current_count,
                daily_limit,
            )
            .await;
        } else if overage_count == 1 && customer.allow_overage {
            // First overage event
            let _ = send_limit_notification(
                pool,
                customer,
                email_client,
                "exceeded",
                current_count,
                daily_limit,
            )
            .await;
        }
    }

    Ok(is_over_limit)
}

/// Send a limit notification email.
async fn send_limit_notification(
    _pool: &PgPool,
    customer: &Customer,
    email_client: Option<&EmailProvider>,
    status: &str,
    current: i64,
    limit: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let (subject, body) = match status {
        "approaching" => (
            "⚠️ HookSniff: Event limitinizin %80'ine ulaştınız".to_string(),
            format!(
                "Merhaba,\n\nGünlük event limitinizin %80'ine ulaştınız.\n\
                 Mevcut kullanım: {}/{}\n\n\
                 Limit aşımında ek ücret uygulanacaktır.\n\
                 Ayarlarınızı kontrol etmek için: https://hooksniff.vercel.app/account",
                current, limit
            ),
        ),
        "at_limit" => (
            "🔴 HookSniff: Günlük event limitinize ulaştınız".to_string(),
            format!(
                "Merhaba,\n\nGünlük event limitinize ulaştınız.\n\
                 Mevcut kullanım: {}/{}\n\n\
                 Overage modunuz aktif ise ek ücret karşılığında events almaya devam edersiniz.\n\
                 https://hooksniff.vercel.app/account",
                current, limit
            ),
        ),
        "exceeded" => (
            "💰 HookSniff: Event limiti aşıldı — overage ücreti uygulanıyor".to_string(),
            format!(
                "Merhaba,\n\nGünlük event limitinizi aştınız.\n\
                 Mevcut kullanım: {}/{}\n\n\
                 Her ek event için overage ücreti uygulanacaktır.\n\
                 https://hooksniff.vercel.app/account",
                current, limit
            ),
        ),
        _ => return Ok(()),
    };

    // Send email via the email client
    if let Some(client) = email_client {
        match client.send_contact_email(&customer.email, &subject, &body).await {
            Ok(()) => {
                tracing::info!(
                    "📧 Overage notification sent to {}: {} ({}, {}/{})",
                    customer.email, subject, status, current, limit
                );
            }
            Err(e) => {
                tracing::warn!(
                    "⚠️ Failed to send overage notification to {}: {:?}",
                    customer.email, e
                );
            }
        }
    } else {
        tracing::info!(
            "📧 Overage notification (no email provider): {} — {} ({}, {}/{})",
            customer.email, subject, status, current, limit
        );
    }

    let _ = (subject, body);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_threshold_calculation() {
        let limit: u64 = 30_000;
        let threshold_80 = (limit as f64 * 0.8) as i64;
        let threshold_100 = limit as i64;
        assert_eq!(threshold_80, 24_000);
        assert_eq!(threshold_100, 30_000);
    }
}
