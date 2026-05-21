//! Daily event usage tracking and overage email notifications.

use sqlx::PgPool;


use crate::billing::Plan;
use crate::email::EmailProvider;
use crate::models::customer::Customer;

/// Resolve the effective daily event limit and the customer_id to track usage against.
/// When operating within a team, the team owner's plan limit and their daily counter apply.
/// Returns (tracking_customer_id, daily_limit, allow_overage, overage_email_notification).
async fn resolve_team_tracking(
    pool: &PgPool,
    customer: &Customer,
    team_id: Option<uuid::Uuid>,
) -> (uuid::Uuid, u64, bool, bool) {
    if let Some(tid) = team_id {
        let result: Option<(uuid::Uuid, String, bool, bool)> = sqlx::query_as(
            "SELECT c.id, c.plan, c.allow_overage, c.overage_email_notification FROM teams t JOIN customers c ON c.id = t.owner_id WHERE t.id = $1"
        )
        .bind(tid)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten();

        if let Some((owner_id, plan_str, allow_overage, overage_email)) = result {
            let daily_limit = Plan::parse_str(&plan_str).max_events_per_day();
            return (owner_id, daily_limit, allow_overage, overage_email);
        }
    }
    let daily_limit = Plan::parse_str(&customer.plan).max_events_per_day();
    (customer.id, daily_limit, customer.allow_overage, customer.overage_email_notification)
}

/// Track daily event usage and return whether the customer is over their limit.
/// Also sends email notifications when approaching or exceeding limits.
/// When team_id is provided, daily event counting is tracked on the team owner's record
/// (team-level counting), and the team owner's plan limit applies.
pub async fn track_daily_event(
    pool: &PgPool,
    customer: &Customer,
    email_client: Option<&EmailProvider>,
    team_id: Option<uuid::Uuid>,
) -> Result<bool, sqlx::Error> {
    let (tracking_id, daily_limit, _allow_overage, overage_email_notification) = resolve_team_tracking(pool, customer, team_id).await;

    // Upsert daily counter — tracked on the team owner when in team context
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
    .bind(tracking_id)
    .bind(daily_limit as i64)
    .fetch_one(pool)
    .await?;

    let (current_count, overage_count) = row;
    let is_over_limit = current_count > daily_limit as i64;

    // Email notification logic — send to the team owner when in team context
    if overage_email_notification {
        // Resolve the notification recipient (team owner when in team context)
        let notify_customer: Option<Customer> = if team_id.is_some() && tracking_id != customer.id {
            sqlx::query_as::<_, Customer>(
                "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial FROM customers WHERE id = $1"
            )
            .bind(tracking_id)
            .fetch_optional(pool)
            .await
            .ok()
            .flatten()
        } else {
            None
        };
        let notify_ref = notify_customer.as_ref().unwrap_or(customer);

        let threshold_80 = (daily_limit as f64 * 0.8) as i64;
        let threshold_100 = daily_limit as i64;

        if current_count == threshold_80 {
            let _ = send_limit_notification(pool, notify_ref, email_client, "approaching", current_count, daily_limit).await;
        } else if current_count == threshold_100 {
            let _ = send_limit_notification(pool, notify_ref, email_client, "at_limit", current_count, daily_limit).await;
        } else if overage_count == 1 && _allow_overage {
            let _ = send_limit_notification(pool, notify_ref, email_client, "exceeded", current_count, daily_limit).await;
        }
    }

    Ok(is_over_limit)
}

/// Send a limit notification email.
async fn send_limit_notification(
    pool: &PgPool,
    customer: &Customer,
    email_client: Option<&EmailProvider>,
    status: &str,
    current: i64,
    limit: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    // Query customer language preference
    let lang_raw: String = sqlx::query_scalar(
        "SELECT COALESCE(language, 'tr') FROM customers WHERE id = $1"
    )
    .bind(customer.id)
    .fetch_one(pool)
    .await
    .unwrap_or_else(|_| "tr".to_string());

    let is_en = lang_raw.starts_with("en");

    let (subject, body) = if is_en {
        match status {
            "approaching" => (
                "⚠️ HookSniff: You've reached 80% of your event limit".to_string(),
                format!(
                    "Hello,\n\nYou've reached 80% of your daily event limit.\n\
                     Current usage: {}/{}\n\n\
                     Overage charges will apply if you exceed the limit.\n\
                     Check your settings: https://hooksniff.vercel.app/account",
                    current, limit
                ),
            ),
            "at_limit" => (
                "🔴 HookSniff: You've reached your daily event limit".to_string(),
                format!(
                    "Hello,\n\nYou've reached your daily event limit.\n\
                     Current usage: {}/{}\n\n\
                     If overage mode is enabled, you'll continue receiving events with overage charges.\n\
                     https://hooksniff.vercel.app/account",
                    current, limit
                ),
            ),
            "exceeded" => (
                "💰 HookSniff: Event limit exceeded — overage charges apply".to_string(),
                format!(
                    "Hello,\n\nYou've exceeded your daily event limit.\n\
                     Current usage: {}/{}\n\n\
                     Overage charges will apply for each additional event.\n\
                     https://hooksniff.vercel.app/account",
                    current, limit
                ),
            ),
            _ => return Ok(()),
        }
    } else {
        match status {
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
        }
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
